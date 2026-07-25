import AuthController from "@/controllers/auth.controller.js";
import { Router, type IRouter } from "express";

const AuthRouter: IRouter = Router();

AuthRouter.post("/login", AuthController.login);
AuthRouter.post("/verify-otp", AuthController.verifyOTP);
AuthRouter.get("/me", AuthController.verifyJWT, (req, res, next) => {
  AuthController.me(req, res, next);
});

export default AuthRouter;
