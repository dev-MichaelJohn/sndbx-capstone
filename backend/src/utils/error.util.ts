import { type ZodError } from "zod";
import pg from "pg";
import { DrizzleQueryError } from "drizzle-orm";

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
}

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
  code?: string;
  detail: string;
}

// pg attaches `DatabaseError` dynamically at runtime (inside its Client
// constructor), not as a static export — `import { DatabaseError } from
// "pg"` type-checks fine (via @types/pg) but throws at runtime in ESM:
// "The requested module 'pg' does not provide an export named
// 'DatabaseError'". Destructuring off the default import works instead.
const { DatabaseError } = pg;

const CONNECTION_ERROR_CODES = new Set([
  "ECONNREFUSED", // nothing listening on the configured host/port
  "ENOTFOUND", // DNS lookup for the host failed
  "ETIMEDOUT", // connection attempt timed out
  "ECONNRESET", // connection was open, then dropped
]);

/**
 * Checks whether `error` is something {@link parseDatabaseError} knows how
 * to translate: a Drizzle-wrapped query error, a raw `pg.DatabaseError`
 * (e.g. from a raw query made outside Drizzle), or a Node-level connection
 * failure (Postgres unreachable). Useful as a routing check in error
 * middleware, alongside `instanceof ZodError`/`instanceof AppError`.
 */
export function isDatabaseError(error: unknown): boolean {
  if (error instanceof DrizzleQueryError) return true;
  if (error instanceof DatabaseError) return true;
  return (
    error instanceof Error &&
    "code" in error &&
    typeof (error as NodeJS.ErrnoException).code === "string" &&
    CONNECTION_ERROR_CODES.has((error as NodeJS.ErrnoException).code!)
  );
}

/**
 * Extracts the field/value pair from a Postgres constraint violation's
 * `detail` message, e.g. `Key (name)=(COTE) already exists.` →
 * `{ field: "name", value: "COTE" }`. Returns `undefined` if `detail` is
 * missing or doesn't match that format.
 */
function parseDetail(detail?: string) {
  const match = detail?.match(/^Key \(([^)]+)\)=\(([^)]*)\)/);
  if (!match) return undefined;
  return { field: match[1], value: match[2] };
}

/**
 * Converts a raw error thrown by a Drizzle query/transaction — or by a raw
 * `pg` client, or by the connection itself failing — into an
 * {@link AppError} with an appropriate status and user-facing message.
 *
 * Handles three shapes:
 * - `DrizzleQueryError` — unwraps `.cause` to the real `pg.DatabaseError`
 *   underneath, then maps its Postgres error code
 * - a bare `pg.DatabaseError` — mapped directly (e.g. a raw query made
 *   outside Drizzle)
 * - a Node-level connection failure (`ECONNREFUSED`, `ETIMEDOUT`, etc.) —
 *   the database was unreachable, so this never became a `DatabaseError`
 *   at all; reported as a 503 instead of a 500
 *
 * Anything else falls back to a generic 500 — check {@link isDatabaseError}
 * first if you need to distinguish "not database-related" from "database
 * error I don't have a specific message for".
 *
 * @param error - the error caught around a Drizzle query, raw pg query, or connection attempt
 * @returns an AppError with a status/message matching the known case
 */
export const parseDatabaseError = (error: unknown): AppError => {
  const cause = error instanceof DrizzleQueryError ? error.cause : error;

  if (cause instanceof DatabaseError) {
    const detail = parseDetail(cause.detail);

    switch (cause.code) {
      case "23505": // unique_violation
        return new AppError(
          409,
          detail
            ? `A record with ${detail.field} "${detail.value}" already exists.`
            : "A record with this value already exists.",
        );
      case "23503": // foreign_key_violation
        return new AppError(400, "Referenced record does not exist.");
      case "23502": // not_null_violation
        return new AppError(
          400,
          cause.column ? `Missing required field: ${cause.column}.` : "Missing a required field.",
        );
      case "22P02": // invalid_text_representation
        return new AppError(400, "Invalid data format provided.");
      default:
        return new AppError(500, "Database operation failed.");
    }
  }

  if (
    cause instanceof Error &&
    "code" in cause &&
    typeof (cause as NodeJS.ErrnoException).code === "string" &&
    CONNECTION_ERROR_CODES.has((cause as NodeJS.ErrnoException).code!)
  ) {
    return new AppError(503, "Database is currently unavailable. Please try again shortly.");
  }

  return new AppError(500, "Database operation failed.");
};
