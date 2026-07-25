import { GenerateZodSchemas } from "@/utils/schema.util.js";
import type { UserLoginType } from "@/types/user.type.js";
import { Accounts, OTPCodes } from "@/schemas/auth.schema.js";
import { generate } from "otp-generator";
import { CreateRecord, GetRecord, UpdateRecord } from "./db.service.js";
import { and, eq, gt, type InferSelectModel } from "drizzle-orm";
import { VerifyOTPSchema, type VerifyOTPType } from "@/types/otp.type.js";
import z from "zod";
import { AppError } from "@/utils/error.util.js";

/** Public surface of {@link otpService}, for dependency injection/mocking. */
export interface IOTPService {
  findActiveOTP(
    credentials: Omit<UserLoginType, "password">,
  ): Promise<
    { hasActive: true; otpData: InferSelectModel<typeof OTPCodes> } | { hasActive: false }
  >;
  generateOTP(
    credentials: Omit<UserLoginType, "password">,
  ): Promise<InferSelectModel<typeof OTPCodes>>;
  /**
   * Note: declared as possibly `undefined` here even though the
   * implementation currently casts its result to a non-undefined type —
   * see the flag on {@link otpService.verifyOTP} below.
   */
  verifyOTP(credentials: VerifyOTPType): Promise<InferSelectModel<typeof OTPCodes> | undefined>;
  deactivateOTP(id: number): Promise<void>;
}

/**
 * Generates, verifies, and rate-limits one-time password (OTP) codes used
 * as the second factor after a successful password login.
 */
class otpService implements IOTPService {
  constructor() {}

  /**
   * Checks whether an active (non-expired) OTP already exists for this
   * email, to prevent spamming new codes before the current one expires.
   *
   * @param credentials - the email to check for an existing active OTP
   * @returns `{ success: true, otpData }` if active OTP exists,
   *          `{ success: false }` if none
   */
  async findActiveOTP(
    credentials: Omit<UserLoginType, "password">,
  ): Promise<
    { hasActive: true; otpData: InferSelectModel<typeof OTPCodes> } | { hasActive: false }
  > {
    const existingOTP = await GetRecord("OTPCodes", {
      where: (OTPCodes) => and(eq(OTPCodes.email, credentials.email), eq(OTPCodes.is_active, true)),
    });

    if (!existingOTP) {
      return { hasActive: false };
    }

    const isExpired = existingOTP.expires_at <= new Date();

    if (isExpired) {
      await UpdateRecord("OTPCodes", existingOTP.id, { is_active: false });
      return { hasActive: false };
    }

    return { hasActive: true, otpData: existingOTP };
  }

  /**
   * Creates and stores a new 8-digit numeric OTP for the given email,
   * expiring 5 minutes from now.
   *
   * @param credentials - the email to generate an OTP for
   * @returns the newly created OTP record
   * @throws {ZodError} if `credentials` fails schema validation
   */
  async generateOTP(
    credentials: Omit<UserLoginType, "password">,
  ): Promise<InferSelectModel<typeof OTPCodes>> {
    const schema = GenerateZodSchemas(Accounts).insert.omit({
      password: true,
      personal_details_id: true,
    });

    const validation = await schema.safeParseAsync(credentials);
    if (!validation.success) throw validation.error;

    const otpCode = generate(8, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    const OTP_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes
    const expires_at = new Date(Date.now() + OTP_EXPIRY_TIME);

    const result = await CreateRecord("OTPCodes", {
      email: credentials.email,
      code: otpCode,
      expires_at,
    });

    return result;
  }

  /**
   * Looks up a matching, non-expired OTP record for the given email/code
   * pair. Does not consume/delete the record — callers are responsible for
   * that (see `authService.authenticateOTP`).
   *
   * @param credentials - the email and OTP code submitted by the user
   * @returns the matching OTP record, or `undefined` if none matches
   * @throws {ZodError} if `credentials` fails schema validation
   */
  async verifyOTP(
    credentials: VerifyOTPType,
  ): Promise<InferSelectModel<typeof OTPCodes> | undefined> {
    const validation = await VerifyOTPSchema.safeParseAsync(credentials);
    if (!validation.success) throw validation.error;

    const result = await GetRecord("OTPCodes", {
      where: (OTPCodes) =>
        and(
          eq(OTPCodes.email, credentials.email),
          eq(OTPCodes.code, credentials.code),
          gt(OTPCodes.expires_at, new Date()),
        ),
    });

    return result;
  }

  async deactivateOTP(id: number) {
    const validation = await z.number().int().positive().safeParseAsync(id);
    if (!validation.success) throw validation.error;

    const result = await GetRecord("OTPCodes", {
      where: (OTPCodes) => and(eq(OTPCodes.id, id), eq(OTPCodes.is_active, true)),
    });
    if (!result) throw new AppError(401, "Invalid or expired OTP.");

    const deactivated = await UpdateRecord("OTPCodes", id, {
      is_active: false,
    });
    if (!deactivated) throw new AppError(500, "Failed to deactivate OTP.");
  }
}

const OTPService = new otpService();
export default OTPService;
export { otpService };
