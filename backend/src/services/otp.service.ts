import { GenerateZodSchemas } from "@/utils/schema.util.js";
import type { UserLoginType } from "./auth.service.js";
import { Accounts, OTPCodes } from "@/schemas/auth.schema.js";
import { generate } from "otp-generator";
import { CreateRecord, GetRecord } from "./db.service.js";
import { and, eq, gt, type InferSelectModel } from "drizzle-orm";
import z from "zod";

export const VerifyOTPSchema = GenerateZodSchemas(OTPCodes).insert.omit({
  expires_at: true,
});
export type VerifyOTPType = z.infer<typeof VerifyOTPSchema>

/**
 * Generates, verifies, and rate-limits one-time password (OTP) codes used
 * as the second factor after a successful password login.
 */
class otpService {
  constructor() { }

  /**
   * Checks whether an active (non-expired) OTP already exists for this
   * email, to prevent spamming new codes before the current one expires.
   *
   *
   * @param credentials - the email to check for an existing active OTP
   * @returns `{ success: true, otpData }` if active OTP exists,
   *          `{ success: false }` if none
   */
  async stopDuplicateOTPResend(credentials: Omit<UserLoginType, "password">) {
    const existingOTP = await GetRecord("OTPCodes", {
      where: (OTPCodes) => and(
        eq(OTPCodes.email, credentials.email),
        gt(OTPCodes.expires_at, new Date()),
      ),
    });

    if (existingOTP) return {
      success: true,
      otpData: existingOTP,
    };

    return { success: false };
  };

  /**
   * Creates and stores a new 8-digit numeric OTP for the given email,
   * expiring 5 minutes from now.
   *
   * @param credentials - the email to generate an OTP for
   * @returns the newly created OTP record
   * @throws {ZodError} if `credentials` fails schema validation
   */
  async generateOTP(credentials: Omit<UserLoginType, "password">) {
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

    const OTP_EXPIRY_TIME = 5 * 60 * 1000;  // 5 minutes
    const expires_at = new Date(Date.now() + OTP_EXPIRY_TIME);

    const result = await CreateRecord("OTPCodes", {
      email: credentials.email,
      code: otpCode,
      expires_at,
    });

    return result as InferSelectModel<typeof OTPCodes>;
  };

  /**
   * Looks up a matching, non-expired OTP record for the given email/code
   * pair. Does not consume/delete the record — callers are responsible for
   * that (see `authService.authenticateOTP`).
   *
   * @param credentials - the email and OTP code submitted by the user
   * @returns the matching OTP record, or `undefined` if none matches
   * @throws {ZodError} if `credentials` fails schema validation
   */
  async verifyOTP(credentials: VerifyOTPType) {
    const validation = await VerifyOTPSchema.safeParseAsync(credentials);
    if (!validation.success) throw validation.error;

    const result = await GetRecord("OTPCodes", {
      where: (OTPCodes) => and(
        eq(OTPCodes.email, credentials.email),
        eq(OTPCodes.code, credentials.code),
        gt(OTPCodes.expires_at, new Date()),
      ),
    });

    return result as InferSelectModel<typeof OTPCodes>;
  };
};

const OTPService = new otpService();
export default OTPService;
