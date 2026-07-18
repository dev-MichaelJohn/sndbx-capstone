import AuthService from "@/services/auth.service.js";
import { Strategy as LocalStrategy, type IVerifyOptions } from "passport-local";
import { Strategy as OTPStrategy } from "passport-custom";
import { ExtractJwt, Strategy as JWTStrategy } from "passport-jwt";
import type { Request } from "express";
import { VerifyOTPSchema } from "@/services/otp.service.js";
import env from "@/configs/env.config.js";
import { JWTPayloadSchema, type JWTPayloadType } from "@/types/token.type.js";

/**
 * Passport strategies for the app's three-stage auth flow:
 * - "local": email/password check (first factor)
 * - "otp": one-time password check (second factor)
 * - "jwt": access-token verification for protected routes
 *
 * These are registered with Passport in `passport.config.js` and invoked
 * via `passport.authenticate(...)` in the auth controller.
 */

/**
 * First-factor strategy: verifies email + password via `AuthService`.
 * On success, hands the authenticated (password-stripped) user to Passport.
 */
export const LocalAuthStrategy = new LocalStrategy(
  {
    usernameField: "email",
    passwordField: "password",
  },
  async (email, password, done) => {
    try {
      const result = await AuthService.authenticateUserCredentials({ email, password });
      return done(null, result.user);
    } catch (error) {
      return done(error);
    }
  },
);

/**
 * Second-factor strategy: verifies the OTP code submitted in the request
 * body via `AuthService`. Uses `passport-custom` since OTP verification
 * needs direct access to the request body/session rather than a fixed
 * username/password shape.
 */
export const OTPAuthStrategy = new OTPStrategy(
  async (
    req: Request,
    done: (error?: any, user?: Express.User | false, options?: IVerifyOptions) => void,
  ) => {
    try {
      const validation = await VerifyOTPSchema.safeParseAsync(req.body);
      if (!validation.success) throw validation.error;

      const result = await AuthService.authenticateOTP(req.body);
      return done(null, result.user);
    } catch (error) {
      return done(error);
    }
  },
);

/**
 * Access-token strategy: extracts a Bearer token from the `Authorization`
 * header and re-validates its payload against the current DB state via
 * `AuthService.authenticateJWT` (so a token for a deleted/changed account
 * fails even if the JWT signature itself is still valid).
 */
export const JWTAuthStrategy = new JWTStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: env.JWT_SECRET,
  },
  async (
    payload,
    done: (error?: any, user?: Express.User | false, options?: IVerifyOptions) => void,
  ) => {
    try {
      const parsedPayload: JWTPayloadType = {
        user: {
          id: payload.id,
          email: payload.email,
        },
        personalDetails: payload.personalDetails,
        roles: payload.roles,
      };
      const validation = await JWTPayloadSchema.safeParseAsync(parsedPayload);
      if (!validation.success) throw validation.error;
      const result = await AuthService.authenticateJWT(payload);
      if (!result.success)
        return done(null, false, {
          message: result.message || "Token expired.",
        });

      return done(null, result.user);
    } catch (error) {
      return done(error);
    }
  },
);
