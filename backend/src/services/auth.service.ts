import { GetRecord, HardDeleteRecord, UpdateRecord } from "./db.service.js";
import { and, eq, isNull } from "drizzle-orm";
import { AppError } from "@/utils/error.util.js";
import bcrypt from "bcryptjs";
import OTPService, { type IOTPService } from "./otp.service.js";
import { JWTPayloadSchema, type JWTPayloadType } from "@/types/token.type.js";
import {
  UserLoginSchema,
  type AccountSelect,
  type UserLoginType,
  type UserType,
} from "@/types/user.type.js";
import type { IUserService } from "./user.service.js";
import UserService from "./user.service.js";
import { VerifyOTPSchema, type VerifyOTPType } from "@/types/otp.type.js";
import { Accounts } from "@/schemas/auth.schema.js";
import {
  ConfirmPasswordChangeSchema,
  RequestPasswordChangeSchema,
  VerifyEmailConfirmSchema,
  type ConfirmPasswordChangeType,
  type RequestPasswordChangeType,
} from "@/types/auth.type.js";

/** An Accounts row with the password field stripped, as returned to callers. */
type SafeAccount = Omit<AccountSelect, "password">;

/** Public surface of {@link AuthService}, for dependency injection/mocking. */
export interface IAuthService {
  authenticateUserCredentials(
    credentials: UserLoginType,
  ): Promise<{ success: boolean; user: SafeAccount }>;

  authenticateOTP(credentials: VerifyOTPType): Promise<{ success: boolean; user: SafeAccount }>;

  authenticateJWT(
    payload: JWTPayloadType,
  ): Promise<{ success: boolean; message: string } | { success: boolean; user: UserType }>;

  checkIfVerified(user: Express.User): Promise<boolean>;
  requestEmailVerification(email: string): Promise<{ expires_at: Date }>;
  confirmEmailVerification(email: string, code: string): Promise<boolean>;
  requestPasswordChange(
    userId: number,
    email: string,
    data: RequestPasswordChangeType,
  ): Promise<{ expires_at: Date }>;
  confirmPasswordChange(email: string, data: ConfirmPasswordChangeType): Promise<boolean>;
}

/**
 * Core authentication logic: verifying login credentials, verifying OTP codes,
 * and validating JWT payloads against the current DB state. Used by Passport
 * strategies ("local", "otp", "jwt") to produce the `user`/`info` values they
 * hand back to route handlers.
 */
class authService implements IAuthService {
  constructor(
    private otpService: IOTPService = OTPService,
    private userService: IUserService = UserService,
  ) {}

  /**
   * Verifies an email/password pair against the Accounts table.
   *
   * @param credentials - the submitted email and plaintext password
   * @returns `{ success: true, user }` with the password field stripped
   * @throws {ZodError} if credentials fail schema validation
   * @throws {AppError} 401 if the email doesn't exist or the password doesn't match
   */
  async authenticateUserCredentials(credentials: UserLoginType) {
    const validation = await UserLoginSchema.safeParseAsync(credentials);
    if (!validation.success) throw validation.error;

    const user = await GetRecord("Accounts", {
      where: (Accounts) => and(eq(Accounts.email, credentials.email), isNull(Accounts.deleted_at)),
    });
    if (!user) throw new AppError(401, "Invalid email or password.");

    const isMatch = await bcrypt.compare(credentials.password, user.password);
    if (!isMatch) throw new AppError(401, "Invalid email or password.");

    const { password, ...userFiltered } = user;
    return { success: true, user: userFiltered };
  }

  /**
   * Verifies a submitted OTP code, consumes it (hard-deletes the record so it
   * can't be reused), and returns the associated account.
   *
   * @param credentials - the email + OTP code submitted by the user
   * @returns `{ user }` with password and personal_details_id stripped
   * @throws {ZodError} if credentials fail schema validation
   * @throws {AppError} 401 if the OTP is invalid or expired
   * @throws {AppError} 404 if no account matches the email
   */
  async authenticateOTP(credentials: VerifyOTPType) {
    const validation = await VerifyOTPSchema.safeParseAsync(credentials);
    if (!validation.success) throw validation.error;

    const otpCode = await this.otpService.verifyOTP(credentials);
    if (!otpCode) throw new AppError(401, "Invalid email or expired OTP.");

    await HardDeleteRecord("OTPCodes", otpCode.id);

    const user = await GetRecord("Accounts", {
      where: (Accounts) => and(eq(Accounts.email, credentials.email), isNull(Accounts.deleted_at)),
    });
    if (!user) throw new AppError(404, "No account record found.");

    const { password, ...userFiltered } = user;
    return { success: true, user: userFiltered };
  }

  /**
   * Re-validates a decoded JWT payload against the current Accounts table,
   * confirming the account referenced by the token still exists.
   *
   * @param payload - the decoded JWT payload (user/personalDetails/role)
   * @returns `{ success: false, message }` if the account no longer exists,
   *          otherwise `{ success: false, user }` with password stripped
   * @throws {ZodError} if the payload fails schema validation
   */
  async authenticateJWT(payload: JWTPayloadType) {
    const validation = await JWTPayloadSchema.safeParseAsync(payload);
    if (!validation.success) throw validation.error;

    const user = await this.userService.getUser({ id: payload.user.id, email: payload.user.email });
    if (!user)
      return {
        success: false,
        message: "Token expired.",
      };

    return { success: true, user };
  }

  async checkIfVerified(user: Express.User) {
    const account = await GetRecord<"Accounts", AccountSelect>("Accounts", {
      where: () =>
        and(eq(Accounts.id, user.id), eq(Accounts.email, user.email), isNull(Accounts.deleted_at)),
    });
    if (!account) throw new AppError(404, "Account not found.");

    return account.is_verified;
  }

  /**
   * Generates and dispatches an OTP for email verification.
   */
  async requestEmailVerification(email: string) {
    const account = await GetRecord("Accounts", {
      where: (Accounts) => and(eq(Accounts.email, email), isNull(Accounts.deleted_at)),
    });
    if (!account) throw new AppError(404, "Account not found.");
    if (account.is_verified) throw new AppError(400, "Email is already verified.");

    const activeOtp = await this.otpService.findActiveOTP({ email });
    if (activeOtp.hasActive) {
      return { expires_at: activeOtp.otpData.expires_at };
    }

    const otpCode = await this.otpService.generateOTP({ email });
    if (!otpCode) throw new AppError(500, "Failed to generate verification OTP.");

    return { expires_at: otpCode.expires_at };
  }

  /**
   * Validates the verification OTP and marks the account as verified.
   */
  async confirmEmailVerification(email: string, code: string) {
    const validation = await VerifyEmailConfirmSchema.safeParseAsync({ code });
    if (!validation.success) throw validation.error;

    const otpRecord = await this.otpService.verifyOTP({ email, code });
    if (!otpRecord) throw new AppError(401, "Invalid or expired verification code.");

    await HardDeleteRecord("OTPCodes", otpRecord.id);

    const account = await GetRecord("Accounts", {
      where: (Accounts) => and(eq(Accounts.email, email), isNull(Accounts.deleted_at)),
    });
    if (!account) throw new AppError(404, "Account not found.");

    const updated = await UpdateRecord("Accounts", account.id, { is_verified: true }, Accounts.id);
    if (!updated) throw new AppError(500, "Failed to verify email address.");

    return true;
  }

  /**
   * Verifies the user's current password and dispatches an OTP for password change 2FA.
   */
  async requestPasswordChange(userId: number, email: string, data: RequestPasswordChangeType) {
    const validation = await RequestPasswordChangeSchema.safeParseAsync(data);
    if (!validation.success) throw validation.error;

    const account = await GetRecord("Accounts", {
      where: (Accounts) => and(eq(Accounts.id, userId), isNull(Accounts.deleted_at)),
    });
    if (!account) throw new AppError(404, "Account not found.");

    const isMatch = await bcrypt.compare(data.currentPassword, account.password);
    if (!isMatch) throw new AppError(401, "Incorrect current password.");

    const activeOtp = await this.otpService.findActiveOTP({ email });
    if (activeOtp.hasActive) {
      return { expires_at: activeOtp.otpData.expires_at };
    }

    const otpCode = await this.otpService.generateOTP({ email });
    if (!otpCode) throw new AppError(500, "Failed to generate OTP for password change.");

    return { expires_at: otpCode.expires_at };
  }

  /**
   * Validates the 2FA OTP and updates the account password in the database.
   */
  async confirmPasswordChange(email: string, data: ConfirmPasswordChangeType) {
    const validation = await ConfirmPasswordChangeSchema.safeParseAsync(data);
    if (!validation.success) throw validation.error;

    const otpRecord = await this.otpService.verifyOTP({ email, code: data.code });
    if (!otpRecord) throw new AppError(401, "Invalid or expired verification code.");

    await HardDeleteRecord("OTPCodes", otpRecord.id);

    const account = await GetRecord("Accounts", {
      where: (Accounts) => and(eq(Accounts.email, email), isNull(Accounts.deleted_at)),
    });
    if (!account) throw new AppError(404, "Account not found.");

    const newHashedPassword = await bcrypt.hash(data.newPassword, 10);
    const updated = await UpdateRecord(
      "Accounts",
      account.id,
      { password: newHashedPassword },
      Accounts.id,
    );
    if (!updated) throw new AppError(500, "Failed to update password.");

    return true;
  }
}

const AuthService = new authService();
export default AuthService;
export { authService };
