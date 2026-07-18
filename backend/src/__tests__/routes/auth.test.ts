import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createTestApp } from "../helpers/test-app.js";

vi.mock("@/services/auth.service.js", () => ({
  default: {
    authenticateUserCredentials: vi.fn(),
    authenticateOTP: vi.fn(),
    authenticateJWT: vi.fn(),
  },
}));

vi.mock("@/services/otp.service.js", () => ({
  default: {
    stopDuplicateOTPResend: vi.fn(),
    generateOTP: vi.fn(),
    verifyOTP: vi.fn(),
  },
  VerifyOTPSchema: { safeParseAsync: vi.fn() },
}));

vi.mock("@/services/email.service.js", () => ({
  default: { sendEmail: vi.fn() },
}));

vi.mock("@/services/token.service.js", () => ({
  default: {
    generateWebToken: vi.fn(),
    generateRefreshToken: vi.fn(),
    saveRefreshToken: vi.fn(),
    generateCookieOptions: vi.fn(),
    verifyToken: vi.fn(),
  },
}));

vi.mock("@/services/db.service.js", () => ({
  GetRecord: vi.fn(),
  GetRecords: vi.fn(),
}));

import AuthService from "@/services/auth.service.js";
import OTPService from "@/services/otp.service.js";
import TokenService from "@/services/token.service.js";
import * as dbService from "@/services/db.service.js";
import { AppError } from "@/utils/error.util.js";

const app = createTestApp();

const mockUser = {
  id: 1,
  email: "john@example.com",
  password: "hashed-password",
  personal_details_id: 1,
  is_verified: true,
  created_at: new Date(),
  updated_at: new Date(),
  deleted_at: null,
};

const mockPersonalDetails = {
  id: 1,
  institutional_id: "EMP-001",
  first_name: "John",
  last_name: "Doe",
  created_at: new Date(),
  updated_at: new Date(),
  deleted_at: null,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/v1/auth/login", () => {
  it("returns 201 and sends OTP on valid credentials", async () => {
    vi.mocked(AuthService.authenticateUserCredentials).mockResolvedValue({
      user: mockUser,
    } as any);

    vi.mocked(OTPService.stopDuplicateOTPResend).mockResolvedValue({
      success: false,
    } as any);

    vi.mocked(OTPService.generateOTP).mockResolvedValue({ code: "123456" } as any);

    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "john@example.com", password: "valid-password" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("email", "john@example.com");
  });

  it("returns 400 when credentials are invalid", async () => {
    vi.mocked(AuthService.authenticateUserCredentials).mockImplementation(() => {
      throw new AppError(400, "Invalid email or password.");
    });

    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "wrong@example.com", password: "wrong-password" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("returns 200 with resend cooldown when OTP was already sent", async () => {
    vi.mocked(AuthService.authenticateUserCredentials).mockResolvedValue({
      user: mockUser,
    } as any);

    vi.mocked(OTPService.stopDuplicateOTPResend).mockResolvedValue({
      success: true,
    } as any);

    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "john@example.com", password: "valid-password" });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("resendAt");
  });
});

describe("POST /api/v1/auth/verify-otp", () => {
  it("returns 200 with tokens on valid OTP", async () => {
    const { VerifyOTPSchema } = await import("@/services/otp.service.js");

    vi.mocked(VerifyOTPSchema.safeParseAsync).mockResolvedValue({
      success: true,
      data: { email: "john@example.com", code: "123456" },
    } as any);

    vi.mocked(AuthService.authenticateOTP).mockResolvedValue({
      user: mockUser,
    } as any);

    vi.mocked(dbService.GetRecord).mockResolvedValue(mockPersonalDetails);
    vi.mocked(dbService.GetRecords).mockResolvedValue([
      { system_role: "ADMIN" },
    ] as any);

    vi.mocked(TokenService.generateWebToken).mockResolvedValue("mock-jwt-token");
    vi.mocked(TokenService.generateRefreshToken).mockReturnValue("mock-refresh-token");
    vi.mocked(TokenService.saveRefreshToken).mockResolvedValue(true);
    vi.mocked(TokenService.generateCookieOptions).mockReturnValue({
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    } as any);

    const res = await request(app)
      .post("/api/v1/auth/verify-otp")
      .send({ email: "john@example.com", code: "123456" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("token");
    expect(res.body.data.user).toHaveProperty("email", "john@example.com");
  });

  it("returns 400 when OTP is invalid", async () => {
    const { VerifyOTPSchema } = await import("@/services/otp.service.js");

    vi.mocked(VerifyOTPSchema.safeParseAsync).mockResolvedValue({
      success: true,
      data: { email: "john@example.com", code: "wrong-code" },
    } as any);

    vi.mocked(AuthService.authenticateOTP).mockImplementation(() => {
      throw new AppError(400, "Invalid or expired OTP.");
    });

    const res = await request(app)
      .post("/api/v1/auth/verify-otp")
      .send({ email: "john@example.com", code: "wrong-code" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
