import env from "@/configs/env.config.js";
import bcrypt from "bcryptjs";
import { and, eq, gt } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { CreateRecord, GetRecord } from "./db.service.js";
import { AppError } from "@/utils/error.util.js";
import {
  ONE_DAY,
  type JWTRefreshToken,
  JWTPayloadSchema,
  type JWTPayloadType,
} from "@/types/token.type.js";
import type { AccountSelect } from "@/types/user.type.js";

/** Cookie options shape returned by {@link tokenService.generateCookieOptions}. */
type RefreshCookieOptions = {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "strict";
  maxAge?: number;
};

/** Public surface of {@link tokenService}, for dependency injection/mocking. */
export interface ITokenService {
  generateWebToken(payload: JWTPayloadType): Promise<string>;
  generateRefreshToken(user: Pick<AccountSelect, "id" | "email">): string;
  generateCookieOptions(rememberMe?: boolean): RefreshCookieOptions;
  saveRefreshToken(
    user: Pick<AccountSelect, "id" | "email">,
    token: string,
    rememberMe?: boolean,
  ): ReturnType<typeof CreateRecord<"RefreshToken">>;
  verifyToken(token: string): Promise<{ accountId: number; email: string }>;
}

/**
 * Issues, stores, and verifies access and refresh tokens. Access tokens are
 * short-lived JWTs carrying the user's profile/role; refresh tokens are
 * longer-lived, hashed and stored in the DB so they can be looked up,
 * revoked, and checked for expiry independently of the JWT's own claims.
 */
class tokenService implements ITokenService {
  constructor() {}

  /**
   * Signs a short-lived (15m) access token embedding the user's id, email,
   * personal details, and roles.
   *
   * @param user - the account record (or filtered subset) to embed
   * @param personalDetails - the account's personal details record
   * @param roles - the account's assigned system roles
   * @returns a signed JWT string
   * @throws {ZodError} if the combined payload fails {@link JWTPayloadSchema}
   */
  async generateWebToken({ user, personalDetails, roles }: JWTPayloadType): Promise<string> {
    const validation = await JWTPayloadSchema.safeParseAsync({ user, personalDetails, roles });
    if (!validation.success) throw validation.error;

    return jwt.sign(
      {
        user: {
          id: user.id,
          email: user.email,
        },
        personalDetails: personalDetails,
        roles: roles,
      },
      env.JWT_SECRET,
      {
        expiresIn: "15m",
      },
    );
  }

  /**
   * Signs a long-lived (7d) refresh token containing only the account's id
   * and email. The returned token is not stored anywhere by this method —
   * pair with {@link saveRefreshToken} to persist its hash for later
   * verification/revocation.
   *
   * @param user - the account to generate a refresh token for
   * @returns a signed JWT string
   */
  generateRefreshToken(user: Pick<AccountSelect, "id" | "email">): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      env.REFRESH_SECRET,
      {
        expiresIn: "7d",
      },
    );
  }

  /**
   * Builds the cookie options used when setting the refresh-token cookie.
   *
   * @param rememberMe - if true, sets a 7-day `maxAge` (persistent cookie);
   *   if false, omits `maxAge` (session cookie, cleared when the browser closes)
   * @returns an options object for `res.cookie(...)`
   */
  generateCookieOptions(rememberMe: boolean = false): RefreshCookieOptions {
    return {
      httpOnly: true,
      secure: env.NODE_ENV !== "development",
      sameSite: "strict" as const,
      ...(rememberMe
        ? {
            maxAge: 7 * ONE_DAY,
          }
        : {}),
    };
  }

  /**
   * Hashes and stores a refresh token so it can later be verified and
   * revoked independently of the JWT's own signature/expiry.
   *
   * @param user - the account the token belongs to
   * @param token - the raw (unhashed) refresh token string
   * @param rememberMe - if true, stores a 7-day expiry; otherwise 1 day
   * @returns the newly created RefreshToken record
   */
  async saveRefreshToken(
    user: Pick<AccountSelect, "id" | "email">,
    token: string,
    rememberMe: boolean = false,
  ) {
    const expires_at = rememberMe
      ? new Date(Date.now() + 7 * ONE_DAY)
      : new Date(Date.now() + ONE_DAY);

    const hash = await bcrypt.hash(token, 10);

    const refreshToken = await CreateRecord("RefreshToken", {
      account_id: user.id,
      email: user.email,
      token_hash: hash,
      expires_at: expires_at,
    });

    return refreshToken;
  }

  /**
   * Verifies a refresh token's signature/expiry, then confirms it matches
   * a stored, non-revoked, non-expired RefreshToken record.
   *
   * @param token - the raw refresh token string to verify
   * @returns the decoded account id and email
   * @throws {JsonWebTokenError | TokenExpiredError} if the JWT itself is
   *   invalid or expired (thrown by `jwt.verify`)
   * @throws {AppError} 400 if no matching, active RefreshToken record is
   *   found, or if the token doesn't match the stored hash
   */
  async verifyToken(token: string): Promise<{ accountId: number; email: string }> {
    const decoded = jwt.verify(token, env.REFRESH_SECRET) as JWTRefreshToken;

    const refreshToken = await GetRecord("RefreshToken", {
      where: (RefreshToken) =>
        and(
          eq(RefreshToken.account_id, decoded.id),
          eq(RefreshToken.email, decoded.email),
          eq(RefreshToken.is_revoked, false),
          gt(RefreshToken.expires_at, new Date()),
        ),
    });
    if (!refreshToken) throw new AppError(400, "Refresh token has been revoked or expired.");

    const verified = await bcrypt.compare(token, refreshToken.token_hash);
    if (!verified) throw new AppError(400, "Refresh token has been revoked or expired.");

    return {
      accountId: decoded.id,
      email: decoded.email,
    };
  }
}

const TokenService = new tokenService();
export default TokenService;
