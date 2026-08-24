import { RefreshToken, SystemRoles } from "@/schemas/auth.schema.js";
import { AccountSchema, PersonalDetailsSchema } from "./user.type.js";
import z from "zod";
import jwt from "jsonwebtoken";
import { GenerateZodSchemas } from "@/utils/schema.util.js";

export const ONE_DAY = 24 * 60 * 60 * 1000;

export const RefreshTokenSchema = GenerateZodSchemas(RefreshToken, {
  account_id: (schema) => schema.int().positive(),
  email: (schema) => schema.trim().toLowerCase().pipe(z.email("Invalid email address format.")),
  token_hash: (schema) =>
    schema
      .trim()
      .min(1, "Token hash is required")
      .regex(/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/, "Invalid bcrypt hash structure"),
  expires_at: (schema) =>
    schema.refine((date) => date > new Date(), {
      message: "Expiration date must be in the future",
    }),
});
export type RefreshTokenInsert = z.infer<typeof RefreshTokenSchema.insert>;
export type RefreshTokenSelect = z.infer<typeof RefreshTokenSchema.select>;

/** Decoded shape of a refresh token's JWT payload. */
export interface JWTRefreshToken extends jwt.JwtPayload {
  id: number;
  email: string;
}

/** Shape of the payload embedded in an access (web) token. */
export const JWTPayloadSchema = z.object({
  user: AccountSchema.select.omit({
    personal_details_id: true,
    password: true,
    created_at: true,
    deleted_at: true,
    updated_at: true,
  }),
  personalDetails: PersonalDetailsSchema.select.omit({
    created_at: true,
    deleted_at: true,
    updated_at: true,
  }),
  roles: z.array(z.enum(SystemRoles.enumValues)),
});
export type JWTPayloadType = z.infer<typeof JWTPayloadSchema>;
