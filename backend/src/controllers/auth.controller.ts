import { AccountRoles, Roles } from "@/schemas/auth.schema.js";
import { GetRecord, GetRecords } from "@/services/db.service.js";
import EmailService, { type IEmailService } from "@/services/email.service.js";
import OTPService, { type IOTPService } from "@/services/otp.service.js";
import TokenService, { type ITokenService } from "@/services/token.service.js";
import type { IUserService } from "@/services/user.service.js";
import UserService from "@/services/user.service.js";
import {
  AccountSchema,
  type AccountSelect,
  type PersonalDetailsSelect,
  type SystemRole,
} from "@/types/user.type.js";
import { GenerateOTPHtmlTemplate, GenerateOTPTextTemplate } from "@/utils/email.util.js";
import { AppError } from "@/utils/error.util.js";
import { createAPIResponse } from "@/utils/response.util.js";
import { and, eq, isNull } from "drizzle-orm";
import type { NextFunction, Request, Response } from "express";
import passport from "passport";
import type { IVerifyOptions } from "passport-local";
import z from "zod";

/** Shape of the data returned by {@link authController.refresh}. Hoisted to
 * module scope so {@link IAuthController} can reference it. */
type RefreshTokenResponseData = {
  token: string;
  info: {
    user: Pick<AccountSelect, "id" | "email">;
    personalDetails: PersonalDetailsSelect;
    roles: Array<SystemRole>;
  };
};

/**
 * Handles authentication flows: login (password + OTP two-factor),
 * OTP verification, and access-token refresh via the verifyJWT middleware.
 */
class authController {
  constructor(
    private otpService: IOTPService = OTPService,
    private tokenService: ITokenService = TokenService,
    private emailService: IEmailService = EmailService,
    private userService: IUserService = UserService,
  ) {
    this.login = this.login.bind(this);
    this.verifyOTP = this.verifyOTP.bind(this);
    this.refresh = this.refresh.bind(this);
    this.verifyJWT = this.verifyJWT.bind(this);
  }
  generateResendTime(expires_at: Date) {
    const OTP_LIFESPAN_MS = 5 * 60 * 1000; // 5 minutes
    const OTP_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

    const expiryTime = new Date(expires_at).getTime();
    const createdAt = expiryTime - OTP_LIFESPAN_MS;

    return createdAt + OTP_COOLDOWN_MS;
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
    passport.authenticate(
      "local",
      { session: false },
      async (err?: any, user?: any, info?: IVerifyOptions) => {
        if (err) return next(err);
        if (!user) return next(new AppError(400, info?.message || "Invalid email or password."));

        try {
          const validation = await AccountSchema.select
            .omit({
              password: true,
            })
            .safeParseAsync(user);
          if (!validation.success) throw validation.error;

          const parsedUser = validation.data;

          const flag = await this.otpService.findActiveOTP({ email: parsedUser.email });
          if (flag.hasActive) {
            const resendAt = this.generateResendTime(flag.otpData.expires_at);

            const response = createAPIResponse(
              200,
              "An OTP was already sent. Please wait before requesting another.",
              {
                email: user?.email,
                resendAt,
              },
            );
            return res.status(response.status).json(response);
          }

          const otpCode = await this.otpService.generateOTP({ email: parsedUser.email });
          if (!otpCode) throw new AppError(500, "Failed to generate OTP. Please try again");

          await this.emailService.sendEmail({
            to: user?.email,
            options: {
              subject: "Verification Code",
              text: GenerateOTPTextTemplate(otpCode.code),
              html: GenerateOTPHtmlTemplate(otpCode.code),
            },
          });

          const resendAt = this.generateResendTime(otpCode.expires_at);
          const response = createAPIResponse(
            201,
            "Please enter the code sent to your email address. Code will expire in 5 minutes.",
            { email: parsedUser.email, resendAt },
          );
          res.status(response.status).json(response);
        } catch (error) {
          next(error);
        }
      },
    )(req, res, next);
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
    passport.authenticate(
      "otp",
      { session: false },
      async (err?: any, user?: any, info?: IVerifyOptions) => {
        if (err) return next(err);
        if (!user) return next(new AppError(400, info?.message || "Invalid email or expired OTP."));

        try {
          const validation = await AccountSchema.select
            .omit({
              password: true,
            })
            .safeParseAsync(user);
          if (!validation.success) throw validation.error;

          const parsedUser = validation.data;

          const personalDetails = await GetRecord("PersonalDetails", {
            where: (PersonalDetails) =>
              and(
                eq(PersonalDetails.id, parsedUser.personal_details_id),
                isNull(PersonalDetails.deleted_at),
              ),
          });
          if (!personalDetails) throw new AppError(404, "Account details not found.");

          const systemRoles = await GetRecords<
            "AccountRoles",
            {
              system_role: SystemRole;
            }
          >("AccountRoles", {
            where: (AccountRoles) =>
              and(eq(AccountRoles.account_id, parsedUser.id), isNull(AccountRoles.deleted_at)),
            join: (query) => query.innerJoin(Roles, eq(AccountRoles.role_id, Roles.id)),
            select: () => ({
              system_role: Roles.system_role,
            }),
          });
          if (!systemRoles) throw new AppError(403, "No role assigned to this account.");

          const roles = systemRoles.map((role) => role.system_role);
          const token = await this.tokenService.generateWebToken({
            user: {
              id: parsedUser.id,
              email: parsedUser.email,
            },
            personalDetails,
            roles,
          });
          const refreshToken = this.tokenService.generateRefreshToken({
            id: parsedUser.id,
            email: parsedUser.email,
          });

          // TODO: attach the "remember-me" here
          const result = await this.tokenService.saveRefreshToken(
            { id: parsedUser.id, email: parsedUser.email },
            refreshToken,
          );
          if (!result) throw new AppError(500, "Failed to save refresh token. Please try again.");

          const cookieOptions = this.tokenService.generateCookieOptions();
          res.cookie("refresh", refreshToken, cookieOptions);

          const response = createAPIResponse(200, "Authentication successful.", {
            token: `bearer ${token}`,
            user: {
              id: parsedUser.id,
              email: parsedUser.email,
              personalDetails: personalDetails,
              roles: roles,
            },
          });
          res.status(response.status).json(response);
        } catch (error) {
          next(error);
        }
      },
    )(req, res, next);
  };

  /**
   * Validates a refresh token and issues a new access token for the associated account.
   * Re-fetches the user, personal details, and role fresh from the DB (rather than
   * trusting the token's original payload) so role/account changes take effect immediately.
   *
   * @param refreshToken - the raw refresh token string, typically read from a cookie
   * @returns an APIResponse containing the new Bearer token and refreshed user data
   * @throws {AppError} 400 if the token fails schema validation
   * @throws {AppError} 404 if the account or its personal details no longer exist
   * @throws {AppError} 403 if the account has no assigned role
   */
  refresh = async (refreshToken: string, res: Response) => {
    const RefreshJWTSchema = z
      .string()
      .trim()
      .min(32)
      .nonempty("Refresh token is invalid or expired");
    const validation = await RefreshJWTSchema.safeParseAsync(refreshToken);
    if (!validation.success) throw new AppError(400, "Validation failed", validation.error);

    const result = await this.tokenService.verifyToken(refreshToken);
    const info = await this.userService.getUser({ id: result.accountId, email: result.email });

    const newToken = await this.tokenService.generateWebToken(info);
    const newRefreshToken = this.tokenService.generateRefreshToken({
      id: result.accountId,
      email: result.email,
    });
    const saveResult = await this.tokenService.rotateRefreshToken(
      { id: result.accountId, email: result.email },
      refreshToken,
      newRefreshToken,
    );
    if (!saveResult) throw new AppError(500, "Failed to save refresh token. Please try again.");

    const cookieOptions = this.tokenService.generateCookieOptions();
    res.cookie("refresh", newRefreshToken, cookieOptions);

    return createAPIResponse<RefreshTokenResponseData>(201, "New token issued.", {
      token: `bearer ${newToken}`,
      info,
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
    passport.authenticate(
      "jwt",
      { session: false },
      async (err?: any, user?: any, _info?: IVerifyOptions) => {
        if (err) return next(err);

        try {
          if (!user) {
            const refreshToken = req.cookies?.refresh;
            if (!refreshToken) {
              throw new AppError(
                401,
                "Session expired or access token invalid. Please log in again.",
              );
            }

            const result = await this.refresh(refreshToken, res);
            if (!result || !result.data) {
              throw new AppError(401, "Your session has expired. Please log in again.");
            }

            res.setHeader("x-access-token", result.data.token);
            req.user = result.data.info;
          } else {
            req.user = user;
          }

          next();
        } catch (error) {
          next(error);
        }
      },
    )(req, res, next);
  };

  me = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new AppError(401, "Token expired. Please log in again");
      const response = createAPIResponse(200, "Session valid.", req.user);
      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  };
}

const AuthController = new authController();
export default AuthController;
