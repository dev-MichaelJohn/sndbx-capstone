import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createTestApp } from "../helpers/test-app.js";

vi.mock("@/services/db.service.js", () => ({
  GetRecord: vi.fn(),
  GetRecords: vi.fn(),
  CreateRecord: vi.fn(),
  UpdateRecord: vi.fn(),
  SoftDeleteRecord: vi.fn(),
  HardDeleteRecord: vi.fn(),
}));

import * as dbService from "@/services/db.service.js";

const mockDb = vi.hoisted(() => ({
  transaction: vi.fn(),
}));

vi.mock("@/configs/db.config.js", () => ({
  default: mockDb,
}));

const app = createTestApp();

beforeEach(() => {
  vi.clearAllMocks();
});

const validUserPayload = {
  credentials: {
    email: "jane.doe@example.com",
    password: "SecurePass123!",
  },
  personalDetails: {
    institutional_id: "EMP-002",
    first_name: "Jane",
    last_name: "Doe",
    middle_name: "M",
    suffix: null,
    profile_image_url: null,
  },
  role: "FACULTY",
};

describe("POST /api/v1/users", () => {
  it("creates a user and returns 201", async () => {
    const mockPersonalDetails = {
      id: 1,
      institutional_id: "EMP-002",
      first_name: "Jane",
      last_name: "Doe",
      middle_name: "M",
      suffix: null,
      profile_image_url: null,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
    };

    const mockAccount = {
      id: 1,
      email: "jane.doe@example.com",
      password: "hashed-password",
      personal_details_id: 1,
      is_verified: false,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
    };

    const mockRole = {
      id: 2,
      system_role: "FACULTY",
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
    };

    const mockAccountRole = {
      id: 1,
      account_id: 1,
      role_id: 2,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
    };

    const mockTx = { insert: vi.fn(), select: vi.fn() };
    mockDb.transaction.mockImplementation(async (cb: any) => cb(mockTx));

    vi.spyOn(dbService, "CreateRecord")
      .mockResolvedValueOnce(mockPersonalDetails)
      .mockResolvedValueOnce(mockAccount)
      .mockResolvedValueOnce(mockAccountRole);

    vi.spyOn(dbService, "GetRecord").mockResolvedValueOnce(mockRole);

    const res = await request(app)
      .post("/api/v1/users")
      .send(validUserPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("User account was successfully created.");
    expect(res.body.data).toBeDefined();
  });

  it("returns 400 for empty request body", async () => {
    const res = await request(app)
      .post("/api/v1/users")
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("returns 400 for invalid role", async () => {
    const res = await request(app)
      .post("/api/v1/users")
      .send({
        ...validUserPayload,
        role: "INVALID_ROLE",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
