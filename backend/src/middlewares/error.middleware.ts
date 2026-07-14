import { AppError, parseDatabaseError, parseZodError, type DatabaseError } from "@/utils/error.util.js";
import { logger } from "@/utils/logger.util.js";
import { createAPIResponse } from "@/utils/response.util.js";
import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

/**
 * Centralized Express error-handling middleware. Normalizes any error
 * thrown/passed via `next(error)` into a consistent {@link AppError} shape,
 * logs it, and sends a standardized {@link APIResponse} to the client.
 *
 * Register this last, after all routes, so Express treats it as an error
 * handler (4-argument signature):
 * ```ts
 * app.use(errorHandler);
 * ```
 *
 * Recognizes three error shapes and falls back to a generic 500 otherwise:
 * - `ZodError` → converted via {@link parseZodError} (400, field-level messages)
 * - errors with a `.code` (Postgres/pg errors) → converted via {@link parseDatabaseError}
 * - `AppError` → used as-is
 * - anything else → wrapped as a generic 500 `AppError`
 */
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
