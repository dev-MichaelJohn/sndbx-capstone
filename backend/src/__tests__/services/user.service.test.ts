import { describe, it, expect, vi, beforeEach } from "vitest";
import { AppError } from "@/utils/error.util.js";

const mockDb = vi.hoisted(() => ({
  transaction: vi.fn(),
}));

vi.mock("@/configs/db.config.js", () => ({
  default: mockDb,
}));

vi.mock("@/services/db.service.js", () => ({
  CreateRecord: vi.fn(),
  GetRecord: vi.fn(),
  GetRecords: vi.fn(),
  SoftDeleteRecord: vi.fn(),
  HardDeleteRecord: vi.fn(),
}));

import UserService from "@/services/user.service.js";
import * as dbService from "@/services/db.service.js";
import bcrypt from "bcryptjs";

const mockPersonalDetails = {
  id: 1,
  institutional_id: "EMP-001",
  first_name: "John",
  last_name: "Doe",
  email: "john@example.com",
  created_at: new Date(),
  updated_at: new Date(),
  deleted_at: null,
};

const mockAccount = {
  id: 1,
  email: "john@example.com",
  password: "hashed-password",
  personal_details_id: 1,
  is_verified: true,
  created_at: new Date(),
  updated_at: new Date(),
  deleted_at: null,
};

const mockRole = {
  id: 1,
  system_role: "ADMIN",
  created_at: new Date(),
  updated_at: new Date(),
  deleted_at: null,
};

const mockAccountRole = {
  id: 1,
  account_id: 1,
  role_id: 1,
  created_at: new Date(),
  updated_at: new Date(),
  deleted_at: null,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("UserService", () => {
  describe("createUser", () => {
    it("creates a user with personal details, account, and role mapping", async () => {
      const mockTx = { insert: vi.fn(), select: vi.fn() };
      mockDb.transaction.mockImplementation(async (cb: any) => cb(mockTx));

      vi.spyOn(dbService, "CreateRecord")
        .mockResolvedValueOnce(mockPersonalDetails)
        .mockResolvedValueOnce(mockAccount)
        .mockResolvedValueOnce(mockAccountRole);

      vi.spyOn(dbService, "GetRecord").mockResolvedValueOnce(mockRole);

      vi.spyOn(bcrypt, "hash").mockResolvedValue("hashed-password" as never);

      const result = await UserService.createUser(
        { email: "john@example.com", password: "plain-password" },
        {
          institutional_id: "EMP-001",
          first_name: "John",
          last_name: "Doe",
        },
        "ADMIN",
      );

      expect(result.details).toEqual(mockPersonalDetails);
      expect(result.credentials).not.toHaveProperty("password");
      expect(result.role).toEqual(mockAccountRole);
    });

    it("throws AppError when personal details creation fails", async () => {
      mockDb.transaction.mockImplementation(async (cb: any) => cb({}));
      vi.spyOn(dbService, "CreateRecord").mockResolvedValueOnce(null);

      await expect(
        UserService.createUser(
          { email: "john@example.com", password: "pwd" },
          { institutional_id: "EMP-001", first_name: "John", last_name: "Doe" },
          "ADMIN",
        ),
      ).rejects.toThrow(AppError);
    });

    it("throws an error when the role is not found", async () => {
      const mockTx = { insert: vi.fn(), select: vi.fn() };
      mockDb.transaction.mockImplementation(async (cb: any) => cb(mockTx));

      vi.spyOn(dbService, "CreateRecord")
        .mockResolvedValueOnce(mockPersonalDetails)
        .mockResolvedValueOnce(mockAccount);

      vi.spyOn(dbService, "GetRecord").mockResolvedValueOnce(null);

      vi.spyOn(bcrypt, "hash").mockResolvedValue("hashed-password" as never);

      await expect(
        UserService.createUser(
          { email: "john@example.com", password: "pwd" },
          { institutional_id: "EMP-001", first_name: "John", last_name: "Doe" },
          "ADMIN",
        ),
      ).rejects.toThrow(AppError);
    });
  });

  describe("grantRole", () => {
    it("grants a role when the account does not already have it", async () => {
      vi.spyOn(dbService, "GetRecords").mockResolvedValueOnce([
        { id: 1, email: "john@example.com", system_role: "FACULTY" },
      ] as any);
      vi.spyOn(dbService, "GetRecord").mockResolvedValueOnce(mockRole);
      vi.spyOn(dbService, "CreateRecord").mockResolvedValueOnce(mockAccountRole);

      await UserService.grantRole(1, "ADMIN");

      expect(dbService.CreateRecord).toHaveBeenCalledOnce();
    });

    it("skips granting a role the account already has", async () => {
      vi.spyOn(dbService, "GetRecords").mockResolvedValueOnce([
        { system_role: "ADMIN" },
      ] as any);

      await UserService.grantRole(1, "ADMIN");

      expect(dbService.CreateRecord).not.toHaveBeenCalled();
    });
  });

  describe("revokeRole", () => {
    it("revokes a role the account currently holds", async () => {
      vi.spyOn(dbService, "GetRecords").mockResolvedValueOnce([
        { system_role: "ADMIN" },
      ] as any);
      vi.spyOn(dbService, "SoftDeleteRecord").mockResolvedValueOnce({} as any);

      await UserService.revokeRole(1, "ADMIN");

      expect(dbService.SoftDeleteRecord).toHaveBeenCalledOnce();
    });

    it("skips revoking a role the account does not have", async () => {
      vi.spyOn(dbService, "GetRecords").mockResolvedValueOnce([
        { system_role: "FACULTY" },
      ] as any);

      await UserService.revokeRole(1, "ADMIN");

      expect(dbService.SoftDeleteRecord).not.toHaveBeenCalled();
    });
  });
});
