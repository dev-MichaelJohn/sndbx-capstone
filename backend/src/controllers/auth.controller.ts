import { AccountRoles, Roles } from "@/schemas/auth.schema.js";
import { GetRecord } from "@/services/db.service.js";
import EmailService from "@/services/email.service.js";
import OTPService from "@/services/otp.service.js";
import TokenService from "@/services/token.service.js";
import { GenerateOTPHtmlTemplate, GenerateOTPTextTemplate } from "@/utils/email.util.js";
import { AppError } from "@/utils/error.util.js";
import { createAPIResponse } from "@/utils/response.util.js";
import { and, eq, isNull } from "drizzle-orm";
import type { NextFunction, Request, Response } from "express";
import passport from "passport";
import type { IVerifyOptions } from "passport-local";
import z from "zod";

/**
 * Handles authentication flows: login (password + OTP two-factor),
 * OTP verification, and access-token refresh via the verifyJWT middleware.
 */
class authController {
  constructor(
    private otpService = OTPService,
    private tokenService = TokenService,
    private emailService = EmailService,
  ) {
    this.login = this.login.bind(this);
    this.verifyOTP = this.verifyOTP.bind(this);
    this.refresh = this.refresh.bind(this);
    this.verifyJWT = this.verifyJWT.bind(this);
  }

  /**
   * Authenticates a user's email/password via the "local" Passport strategy,
   * then sends a one-time password (OTP) to their email as a second factor.
   * Does not issue a token yet — that happens after verifyOTP succeeds.
   *
   * @throws {AppError} 400 if credentials are invalid
   * @throws {AppError} 500 if OTP generation fails
   */
  login = async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("local", { session: false }, async (err?: any, user?: any, info?: IVerifyOptions) => {
      if (err) return next(err);
      if (!user) return next(new AppError(400, info?.message || "Invalid email or password."));

      try {
        const flag = await this.otpService.stopDuplicateOTPResend({ email: user?.email });
        if (flag.success) {
          const OTP_COOLDOWN_MS = 120_000;
          const resend = Date.now() + OTP_COOLDOWN_MS;

          const response = createAPIResponse(200, "An OTP was already sent. Please wait before requesting another.", {
            email: user?.email,
            resendAt: resend,
          });
          return res.status(response.status).json(response);
        }

        const otpCode = await this.otpService.generateOTP({ email: user?.email });
        if (!otpCode) throw new AppError(500, "Failed to generate OTP. Please try again");

        await this.emailService.sendEmail({
          to: user?.email,
          options: {
            subject: "Verification Code",
            text: GenerateOTPTextTemplate(otpCode.code),
            html: GenerateOTPHtmlTemplate(otpCode.code),
          }
        });

        const response = createAPIResponse(201, "Please enter the code sent to your email address. Code will expire in 5 minutes.", { email: user?.email });
        res.status(response.status).json(response);
      } catch (error) {
        next(error);
      }
    })(req, res, next);
  };

  /**
   * Verifies the OTP submitted by the user via the "otp" Passport strategy.
   * On success, issues an access token (Bearer) and a refresh token (httpOnly cookie),
   * and returns the authenticated user's profile and role.
   *
   * @throws {AppError} 400 if the OTP is invalid or expired
   * @throws {AppError} 404 if personal details are missing
   * @throws {AppError} 403 if no role is assigned to the account
   * @throws {AppError} 500 if the refresh token fails to save
   */
  verifyOTP = async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("otp", { session: false }, async (err?: any, user?: any, info?: IVerifyOptions) => {
      if (err) return next(err);
      if (!user) return next(new AppError(400, info?.message || "Invalid email or expired OTP."));

      try {
        const personalDetails = await GetRecord("PersonalDetails", {
          where: (PersonalDetails) => and(
            eq(PersonalDetails.id, user?.personal_details_id),
            isNull(PersonalDetails.deleted_at),
          ),
        });
        if (!personalDetails) throw new AppError(404, "Account details not found.");

        const role = await GetRecord<"AccountRoles", {
          system_role: "SYS_ADMIN" | "ADMIN" | "SUPERVISOR" | "FACULTY" | "STUDENT",
        }>("AccountRoles", {
          where: (AccountRoles) => and(
            eq(AccountRoles.account_id, user?.id),
            isNull(AccountRoles.deleted_at),
          ),
          join: (query) =>
            query.innerJoin(Roles, eq(AccountRoles.role_id, Roles.id)),
          select: () => ({
            system_role: Roles.system_role,
          }),
        });
        if (!role) throw new AppError(403, "No role assigned to this account.");

        const token = await this.tokenService.generateWebToken(user, personalDetails, role.system_role);
        const refreshToken = this.tokenService.generateRefreshToken(user);

        // TODO: attach the "remember-me" here
        const result = await this.tokenService.saveRefreshToken(user, refreshToken);
        if (!result) throw new AppError(500, "Failed to save refresh token. Please try again.");

        const cookieOptions = this.tokenService.generateCookieOptions();
        res.cookie("refresh", refreshToken, cookieOptions);

        const response = createAPIResponse(200, "Authentication successful.", {
          token: `Bearer ${token}`,
          user: {
            id: user?.id,
            email: user?.email,
            personalDetails: personalDetails,
            role: role.system_role,
          }
        });
        res.status(response.status).json(response);
      } catch (error) {
        next(error);
      }
    })(req, res, next);
  };

  /**
   * Validates a refresh token and issues a new access token for the associated account.
   * Re-fetches the user, personal details, and role fresh from the DB (rather than
   * trusting the token's original payload) so role/account changes take effect immediately.
   *
   * @param resfreshToken - the raw refresh token string, typically read from a cookie
   * @returns an APIResponse containing the new Bearer token and refreshed user data
   * @throws {AppError} 400 if the token fails schema validation
   * @throws {AppError} 404 if the account or its personal details no longer exist
   * @throws {AppError} 403 if the account has no assigned role
   */
  refresh = async (resfreshToken: string) => {
    const RefreshJWTSchema = z.string().trim().min(32).nonempty("Refresh token is invalid or expired");
    const validation = await RefreshJWTSchema.safeParseAsync(resfreshToken);
    if (!validation.success) throw new AppError(400, "Validation failed", validation.error);

    const result = await this.tokenService.verifyToken(resfreshToken);
    const user = await GetRecord("Accounts", {
      where: (Accounts) => and(
        eq(Accounts.id, result.accountId),
        eq(Accounts.email, result.email),
        isNull(Accounts.deleted_at),
      ),
    });
    if (!user) throw new AppError(404, "Account not found.");
    const { personal_details_id, password, ...userFiltered } = user;

    const personalDetails = await GetRecord("PersonalDetails", {
      where: (PersonalDetails) => and(
        eq(PersonalDetails.id, user?.personal_details_id),
        isNull(PersonalDetails.deleted_at),
      ),
    });
    if (!personalDetails) throw new AppError(404, "Account details not found.");

    const role = await GetRecord<"AccountRoles", {
      system_role: "SYS_ADMIN" | "ADMIN" | "SUPERVISOR" | "FACULTY" | "STUDENT",
    }>("AccountRoles", {
      where: (AccountRoles) => and(
        eq(AccountRoles.account_id, user?.id),
        isNull(AccountRoles.deleted_at),
      ),
      join: (query) =>
        query.innerJoin(Roles, eq(AccountRoles.role_id, Roles.id)),
      select: () => ({
        system_role: Roles.system_role,
      }),
    });
    if (!role) throw new AppError(403, "No role assigned to this account.");
    const token = await this.tokenService.generateWebToken(userFiltered, personalDetails, role.system_role);

    type RefreshTokenResponseData = {
      token: string;
      user: Omit<typeof userFiltered, never> & {
        personalDetails: typeof personalDetails;
        role: "SYS_ADMIN" | "ADMIN" | "SUPERVISOR" | "FACULTY" | "STUDENT";
      };
    };

    return createAPIResponse<RefreshTokenResponseData>(201, "New token issued.", {
      token: `Bearer ${token}`,
      user: { ...userFiltered, personalDetails, role: role.system_role }
    });
  };

  /**
   * Middleware: verifies the request's access token via the "jwt" strategy.
   * If the access token is missing/expired, attempts a silent refresh using the
   * refresh-token cookie — on success, attaches the refreshed user to req.user
   * and returns the new token via the "x-access-token" response header, then
   * continues to the original route (no client retry needed).
   *
   * @throws {AppError} 500 if the refresh attempt returns no data
   */
  verifyJWT = async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("jwt", { session: false }, async (err?: any, user?: any, info?: IVerifyOptions) => {
      if (err) return next(err);

      try {
        if (!user) {
          const refreshToken = req.cookies?.refresh;
          if (!refreshToken) {
            throw new AppError(401, "Session expired or access token invalid. Please log in again.");
          }

          const result = await this.refresh(refreshToken);
          if (!result || !result.data) {
            throw new AppError(401, "Your session has expired. Please log in again.");
          }

          res.setHeader("x-access-token", result.data.token);
          req.user = result.data.user;
        } else {
          req.user = user;
        }

        next();
      } catch (error) {
        next(error);
      }
    })(req, res, next);
  };
};

const AuthController = new authController();
export default AuthController;
