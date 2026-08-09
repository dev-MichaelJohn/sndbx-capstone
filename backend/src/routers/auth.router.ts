import AuthController from "@/controllers/auth.controller.js";
import { requirePermission } from "@/middlewares/rbac.middleware.js";
import { PERMISSIONS } from "@/types/seeder.type.js";
import { Router, type IRouter } from "express";

const AuthRouter: IRouter = Router();

AuthRouter.post("/login", AuthController.login);
AuthRouter.post("/verify-otp", AuthController.verifyOTP);
AuthRouter.post("/logout", AuthController.logout);
AuthRouter.get("/me", AuthController.verifyJWT, (req, res, next) => {
  AuthController.me(req, res, next);
});

// Email Verification Status Check
AuthRouter.get(
  "/verification-status",
  AuthController.verifyJWT,
  requirePermission(PERMISSIONS.ACCOUNT_UPDATE_OWN),
  AuthController.getVerificationStatus,
);

// Dispatch Email Verification OTP
AuthRouter.post(
  "/verify-email/request",
  AuthController.verifyJWT,
  requirePermission(PERMISSIONS.ACCOUNT_UPDATE_OWN),
  AuthController.requestEmailVerification,
);

// Confirm Email Verification
AuthRouter.post(
  "/verify-email/confirm",
  AuthController.verifyJWT,
  requirePermission(PERMISSIONS.ACCOUNT_UPDATE_OWN),
  AuthController.confirmEmailVerification,
);

// Request Password Change (Triggers 2FA OTP)
AuthRouter.post(
  "/change-password/request",
  AuthController.verifyJWT,
  requirePermission(PERMISSIONS.ACCOUNT_UPDATE_OWN),
  AuthController.requestPasswordChange,
);

// Confirm Password Change (Verify 2FA OTP & Update Password)
AuthRouter.post(
  "/change-password/confirm",
  AuthController.verifyJWT,
  requirePermission(PERMISSIONS.ACCOUNT_UPDATE_OWN),
  AuthController.confirmPasswordChange,
);

AuthRouter.post("/forgot-password/request", AuthController.requestPasswordReset);

AuthRouter.post("/forgot-password/confirm", AuthController.confirmPasswordReset);

export default AuthRouter;
