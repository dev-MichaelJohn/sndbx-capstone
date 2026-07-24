import { OTPCodes } from "../schemas/auth.schema.js";
import { GenerateZodSchemas } from "../utils/schema.util.js";
import z from "zod";

export const OTPCodeSchema = GenerateZodSchemas(OTPCodes, {
  code: (schema) =>
    schema
      .trim()
      .length(8, "OTP code must be exactly 8 digits.")
      .regex(/^\d+$/, "OTP code must contain numbers only."),
  email: (schema) => schema.trim().toLowerCase().pipe(z.email("Invalid email address format.")),
});

export const VerifyOTPSchema = OTPCodeSchema.insert.omit({
  expires_at: true,
});
export type VerifyOTPType = z.infer<typeof VerifyOTPSchema>;
