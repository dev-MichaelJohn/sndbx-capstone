import { describe, it, expect } from "vitest";
import { createAPIResponse, createPaginatedData } from "@/utils/response.util.js";

describe("createAPIResponse", () => {
  it("returns success=true for 2xx status codes", () => {
    const result = createAPIResponse(200, "OK");
    expect(result.success).toBe(true);
  });

  it("returns success=false for non-2xx status codes", () => {
    const result = createAPIResponse(400, "Bad request");
    expect(result.success).toBe(false);
  });

  it("includes data when provided", () => {
    const payload = { id: 1, name: "test" };
    const result = createAPIResponse(201, "Created", payload);
    expect(result.data).toEqual(payload);
  });

  it("omits data when null", () => {
    const result = createAPIResponse(200, "OK", null);
    expect(result).not.toHaveProperty("data");
  });

  it("includes errors when provided", () => {
    const errors = { field: "Something went wrong" };
    const result = createAPIResponse(400, "Validation failed", null, errors);
    expect(result.errors).toEqual(errors);
  });

  it("omits errors when null", () => {
    const result = createAPIResponse(200, "OK");
    expect(result).not.toHaveProperty("errors");
  });

  it("sets status and message correctly", () => {
    const result = createAPIResponse(404, "Not found");
    expect(result.status).toBe(404);
    expect(result.message).toBe("Not found");
  });
});

describe("createPaginatedData", () => {
  const items = [{ id: 1 }, { id: 2 }];
  const baseArgs = {
    data: items,
    currentPage: 1,
    pageSize: 10,
    totalItems: 2,
  };

  it("returns data and pagination structure", () => {
    const result = createPaginatedData(baseArgs);
    expect(result.data).toEqual(items);
    expect(result.pagination).toBeDefined();
  });

  it("computes totalPage correctly", () => {
    const result = createPaginatedData(baseArgs);
    expect(result.pagination.totalPage).toBe(1);
  });

  it("sets hasPrev=false on first page", () => {
    const result = createPaginatedData(baseArgs);
    expect(result.pagination.hasPrev).toBe(false);
  });

  it("sets hasPrev=true when not on first page", () => {
    const result = createPaginatedData({ ...baseArgs, currentPage: 2 });
    expect(result.pagination.hasPrev).toBe(true);
  });

  it("sets hasNext=true when more pages exist", () => {
    const result = createPaginatedData({ ...baseArgs, currentPage: 1, pageSize: 1, totalItems: 2 });
    expect(result.pagination.hasNext).toBe(true);
  });

  it("sets hasNext=false on last page", () => {
    const result = createPaginatedData(baseArgs);
    expect(result.pagination.hasNext).toBe(false);
  });

  it("rounds totalPage up", () => {
    const result = createPaginatedData({
      data: items,
      currentPage: 1,
      pageSize: 3,
      totalItems: 5,
    });
    expect(result.pagination.totalPage).toBe(2);
  });
});
