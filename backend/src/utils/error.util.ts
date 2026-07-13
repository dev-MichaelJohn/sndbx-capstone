import { z, type ZodError } from "zod";

export class AppError extends Error {
  public status: number;
  public errors: unknown;

  constructor(status: number, message: string, errors: unknown = null) {
    super(message);
    this.status = status;
    this.errors = errors;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
};

export const parseZodError = (error: ZodError) => {
  const { fieldErrors } = z.flattenError(error);

  return new AppError(400, "Validation failed.", fieldErrors);
};

export interface DatabaseError extends Error {
  code?: string,
  detail: string,
};

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
