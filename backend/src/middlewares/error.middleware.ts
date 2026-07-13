import { AppError, parseDatabaseError, parseZodError, type DatabaseError } from "@/utils/error.util.js";
import { logger } from "@/utils/logger.util.js";
import { createAPIResponse } from "@/utils/response.util.js";
import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export const errorHandler = (error: any, _req: Request, res: Response, _next: NextFunction) => {
  let finalError: AppError;

  if (error instanceof ZodError) finalError = parseZodError(error);
  else if (error.code) finalError = parseDatabaseError(error as DatabaseError);
  else if (error instanceof AppError) finalError = error
  else finalError = new AppError(500, error.message || "Something went wrong.");

  logger.error(`${finalError.message} - Stack: ${error.stack || error}`);

  res.status(finalError.status).json(
    createAPIResponse<null>(finalError.status, finalError.message, null, finalError.errors),
  );
};
