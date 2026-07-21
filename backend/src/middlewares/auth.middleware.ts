import { JWTPayloadSchema } from "@/types/token.type.js";
import type { SystemRole } from "@/types/user.type.js";
import { AppError } from "@/utils/error.util.js";
import type { RequestHandler } from "express";

export const authorizeHandler = (allowedRole: SystemRole): RequestHandler => {
  return async (req, _res, next) => {
    try {
      const user = req.user;
      if (!user) throw new AppError(401, "Authentication required.");
      const validation = await JWTPayloadSchema.safeParseAsync(user);
      if (!validation.success) throw validation.error;

      const parsed = validation.data;

      if (!parsed.roles.includes(allowedRole))
        throw new AppError(
          403,
          "Access denied. You do not have permission to perform this action.",
        );

      next();
    } catch (error) {
      next(error);
    }
  };
};
