import { describe, it, expect } from "vitest";
import { AppError, parseZodError, parseDatabaseError } from "@/utils/error.util.js";
import { z } from "zod";

describe("AppError", () => {
  it("creates an error with status, message, and name", () => {
    const error = new AppError(404, "Not found");
    expect(error.status).toBe(404);
    expect(error.message).toBe("Not found");
    expect(error.name).toBe("AppError");
  });

  it("attaches structured errors when provided", () => {
    const details = { field: "email", message: "Invalid format" };
    const error = new AppError(400, "Validation failed", details);
    expect(error.errors).toEqual(details);
  });

  it("defaults errors to null", () => {
    const error = new AppError(500, "Internal error");
    expect(error.errors).toBeNull();
  });
});

describe("parseZodError", () => {
  it("converts a ZodError to an AppError with 400 status", () => {
    const schema = z.object({ name: z.string().min(1) });
    const result = schema.safeParse({ name: "" });
    if (result.success) throw new Error("Expected validation failure");

    const appError = parseZodError(result.error);
    expect(appError).toBeInstanceOf(AppError);
    expect(appError.status).toBe(400);
    expect(appError.message).toBe("Validation failed.");
  });

  it("flattens issues into a field-to-message map", () => {
    const schema = z.object({
      email: z.string().email(),
      age: z.number().min(18),
    });
    const result = schema.safeParse({ email: "bad", age: 10 });
    if (result.success) throw new Error("Expected validation failure");

    const appError = parseZodError(result.error);
    expect(appError.errors).toEqual({
      email: expect.any(String),
      age: expect.any(String),
    });
  });

  it("keeps only the first issue per field", () => {
    const schema = z.object({
      name: z
        .string()
        .min(5, "Too short")
        .max(10, "Too long"),
    });
    const result = schema.safeParse({ name: "ab" });
    if (result.success) throw new Error("Expected validation failure");

    const appError = parseZodError(result.error);
    expect(appError.errors).toEqual({ name: "Too short" });
  });
});

describe("parseDatabaseError", () => {
  it("returns 409 for unique violation (23505)", () => {
    const error = { code: "23505", message: "duplicate key" } as any;
    const result = parseDatabaseError(error);
    expect(result.status).toBe(409);
    expect(result.message).toMatch(/already exists/);
  });

  it("returns 400 for foreign key violation (23503)", () => {
    const error = { code: "23503", message: "fk violation" } as any;
    const result = parseDatabaseError(error);
    expect(result.status).toBe(400);
    expect(result.message).toMatch(/does not exist/);
  });

  it("returns 400 for not-null violation (23502)", () => {
    const error = { code: "23502", message: "null value" } as any;
    const result = parseDatabaseError(error);
    expect(result.status).toBe(400);
    expect(result.message).toMatch(/Missing/);
  });

  it("returns 400 for invalid data format (22P02)", () => {
    const error = { code: "22P02", message: "invalid input" } as any;
    const result = parseDatabaseError(error);
    expect(result.status).toBe(400);
    expect(result.message).toMatch(/Invalid data format/);
  });

  it("returns 500 for unknown error codes", () => {
    const error = { code: "XX000", message: "internal error" } as any;
    const result = parseDatabaseError(error);
    expect(result.status).toBe(500);
    expect(result.message).toMatch(/Database operation failed/);
  });
});
