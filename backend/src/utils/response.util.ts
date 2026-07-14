/**
 * Standard shape for every API response, used consistently across
 * controllers so the frontend can rely on a single response contract.
 *
 * @typeParam T - shape of the `data` payload, if any
 */
export interface APIResponse<T = unknown> {
  /** Derived from `status`: true for 2xx, false otherwise. */
  success: boolean,
  /** HTTP status code. */
  status: number,
  /** User-facing message describing the result. */
  message: string,
  /** Response payload, omitted entirely (not just `undefined`) when `data` is `null`. */
  data?: T,
  /** Structured error details (e.g. field validation errors), when applicable. */
  errors?: unknown,
};

/**
 * Builds a standardized {@link APIResponse} object.
 *
 * @param status - HTTP status code; also determines `success`
 * @param message - user-facing message
 * @param data - response payload; omitted from the response entirely if `null`
 * @param errors - structured error details; omitted from the response entirely if `null`
 * @returns an `APIResponse<T>` ready to be sent via `res.status(...).json(...)`
 */
export const createAPIResponse = <T>(status: number, message: string, data: T | null = null, errors: unknown = null) => {
  const response: APIResponse<T> = {
    success: status >= 200 && status < 300,
    status, message,
    ...(data !== null && { data }),
  };

  if (errors !== null) response.errors = errors;

  return response;
};
