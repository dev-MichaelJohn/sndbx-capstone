import z from "zod";
import { AccountSchema } from "./user.type.js";

// ==========================================
// 1. Email Verification Schemas
// ==========================================

/** Payload to confirm email address via the 8-character OTP code sent to user. */
export const VerifyEmailConfirmSchema = z.object({
  code: z.string().trim().length(8, "Verification code must be exactly 8 characters."),
});
export type VerifyEmailConfirmType = z.infer<typeof VerifyEmailConfirmSchema>;

// ==========================================
// 2. Password Change (2FA) Schemas
// ==========================================

/**
 * Step 1: Initial password update request.
 * Validates current credentials and ensures new password meets complexity rules.
 */
export const RequestPasswordChangeSchema = z.object({
  currentPassword: z.string().trim().min(1, "Current password is required."),
});
export type RequestPasswordChangeType = z.infer<typeof RequestPasswordChangeSchema>;

/**
 * Step 2: Final confirmation of password update.
 * Requires the OTP code sent during Step 1 alongside the new password.
 */
export const ConfirmPasswordChangeSchema = z.object({
  code: z.string().trim().length(8, "Verification code must be exactly 8 characters."),
  newPassword: AccountSchema.insert.shape.password,
});
export type ConfirmPasswordChangeType = z.infer<typeof ConfirmPasswordChangeSchema>;
