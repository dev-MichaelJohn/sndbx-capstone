import { Accounts } from "@/schemas/auth.schema.js";
import { GenerateZodSchemas } from "@/utils/schema.util.js";
import type z from "zod";
import { GetRecord, HardDeleteRecord } from "./db.service.js";
import { and, eq, isNull } from "drizzle-orm";
import { AppError } from "@/utils/error.util.js";
import bcrypt from "bcryptjs";
import OTPService, {
  VerifyOTPSchema,
  type IOTPService,
  type VerifyOTPType,
} from "./otp.service.js";
import { JWTPayloadSchema, type JWTPayloadType } from "@/types/token.type.js";
import type { AccountSelect, UserType } from "@/types/user.type.js";
import type { IUserService } from "./user.service.js";
import UserService from "./user.service.js";

export const UserLoginSchema = GenerateZodSchemas(Accounts).insert.omit({
  personal_details_id: true,
});
export type UserLoginType = z.infer<typeof UserLoginSchema>;

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
}

const AuthService = new authService();
export default AuthService;
export { authService };
