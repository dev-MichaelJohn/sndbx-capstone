import {
  AppError,
  isDatabaseError,
  parseDatabaseError,
  parseZodError,
} from "@/utils/error.util.js";
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
 * - `AppError` → used as-is
 * - anything {@link isDatabaseError} recognizes (a Drizzle-wrapped error, a
 *   bare `pg.DatabaseError`, or a connection failure) → converted via
 *   {@link parseDatabaseError}
 * - anything else → wrapped as a generic 500 `AppError`
 */
export const errorHandler = (error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  let finalError: AppError;

  if (error instanceof ZodError) finalError = parseZodError(error);
  else if (error instanceof AppError) finalError = error;
  else if (isDatabaseError(error)) finalError = parseDatabaseError(error);
  else
    finalError = new AppError(
      500,
      error instanceof Error ? error.message : "Something went wrong.",
    );

  logger.error(
    `${finalError.message} - Stack: ${error instanceof Error ? error.stack : String(error)}`,
  );

  res
    .status(finalError.status)
    .json(createAPIResponse<null>(finalError.status, finalError.message, null, finalError.errors));
};
