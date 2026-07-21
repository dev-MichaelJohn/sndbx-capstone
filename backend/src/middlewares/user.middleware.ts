import { CreateUserReqSchema } from "@/types/user.type.js";
import { AppError } from "@/utils/error.util.js";
import type { NextFunction, Request, Response } from "express";

export const preventSysAdminCreation = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const validation = await CreateUserReqSchema.shape.role.safeParseAsync(req.body?.role);
    if (!validation.success) throw validation.error;

    const role = validation.data;
    if (role === "SYS_ADMIN")
      throw new AppError(
        403,
        "Forbidden. System Administrator accounts cannot be created via this route.",
      );

    next();
  } catch (error) {
    next(error);
  }
};
