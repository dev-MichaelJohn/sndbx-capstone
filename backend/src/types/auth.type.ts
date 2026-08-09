import z from "zod";
import { AccountSchema } from "./user.type.js";

// ==========================================
// 1. Email Verification Schemas
// ==========================================

export const VerifyEmailConfirmSchema = z.object({
  code: z.string().trim().length(8, "Verification code must be exactly 8 characters."),
});
export type VerifyEmailConfirmType = z.infer<typeof VerifyEmailConfirmSchema>;

// ==========================================
// 2. Password Change (2FA) & Reset Schemas
// ==========================================

export const RequestPasswordChangeSchema = z.object({
  currentPassword: z.string().trim().min(1, "Current password is required."),
});
export type RequestPasswordChangeType = z.infer<typeof RequestPasswordChangeSchema>;

export const ConfirmPasswordChangeSchema = z.object({
  code: z.string().trim().length(8, "Verification code must be exactly 8 characters."),
  newPassword: AccountSchema.insert.shape.password,
});
export type ConfirmPasswordChangeType = z.infer<typeof ConfirmPasswordChangeSchema>;

export const RequestPasswordResetSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Invalid email address format.")),
});
export type RequestPasswordResetType = z.infer<typeof RequestPasswordResetSchema>;

export const ConfirmPasswordResetSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Invalid email address format.")),
  code: z.string().trim().length(8, "Verification code must be exactly 8 characters."),
  newPassword: AccountSchema.insert.shape.password,
});
export type ConfirmPasswordResetType = z.infer<typeof ConfirmPasswordResetSchema>;
