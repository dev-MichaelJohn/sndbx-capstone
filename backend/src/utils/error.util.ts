import { type ZodError } from "zod";

/**
 * Application-level HTTP error, thrown by controllers/services to signal a
 * specific status code and message that should be sent to the client
 * (as opposed to unexpected/internal errors, which should be normalized
 * before being exposed).
 */
export class AppError extends Error {
  /** HTTP status code to respond with. */
  public status: number;
  /** Optional structured error details (e.g. field-level validation errors). */
  public errors: unknown;

  /**
   * @param status - HTTP status code
   * @param message - user-facing error message
   * @param errors - optional structured details (e.g. from `parseZodError`)
   */
  constructor(status: number, message: string, errors: unknown = null) {
    super(message);
    this.status = status;
    this.errors = errors;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
};

/**
 * Converts a ZodError into an {@link AppError} with a 400 status, flattening
 * issues into a `{ field: message }` map (keeping only the first issue per
 * field).
 *
 * @param error - the ZodError to convert
 * @returns an AppError with `errors` set to the field/message map
 */
export const parseZodError = (error: ZodError) => {
  const errors: Record<string, string> = {};

  for (const issue of error.issues) {
    const field = issue.path.join(".");
    if (!errors[field]) errors[field] = issue.message;
  }

  return new AppError(400, "Validation failed.", errors);
};

/** Shape of a node-postgres error, including Postgres's error `code`. */
export interface DatabaseError extends Error {
  code?: string,
  detail: string,
};

/**
 * Converts a raw Postgres error into an {@link AppError} with an
 * appropriate status and user-facing message, based on the Postgres error
 * code (e.g. unique violation, foreign key violation).
 *
 * @param error - the raw database error, as thrown by the pg driver
 * @returns an AppError with a status/message matching the known error code,
 *   or a generic 500 AppError if the code isn't recognized
 */
export const parseDatabaseError = (error: DatabaseError) => {
  switch (error.code) {
    case '23505':
      return new AppError(409, 'A record with this value already exists.');
    case '23503':
      return new AppError(400, 'Referenced record does not exist.');
    case '23502':
      return new AppError(400, 'Missing a required field.');
    case '22P02':
      return new AppError(400, 'Invalid data format provided.');
    default:
      return new AppError(500, 'Database operation failed.');
  };
};
