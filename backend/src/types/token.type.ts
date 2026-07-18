import { SystemRoles } from "@/schemas/auth.schema.js";
import { AccountSchema, PersonalDetailsSchema } from "./user.type.js";
import z from "zod";
import jwt from "jsonwebtoken";

export const ONE_DAY = 24 * 60 * 60 * 1000;

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
    is_verified: true,
  }),
  personalDetails: PersonalDetailsSchema.select.omit({
    created_at: true,
    deleted_at: true,
    updated_at: true,
  }),
  roles: z.array(z.enum(SystemRoles.enumValues)),
});
export type JWTPayloadType = z.infer<typeof JWTPayloadSchema>;
