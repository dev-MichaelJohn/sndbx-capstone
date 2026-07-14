import AuthController from "@/controllers/auth.controller.js";
import { createAPIResponse } from "@/utils/response.util.js";
import { Router, type IRouter, type NextFunction, type Request, type Response } from "express";

const AuthRouter: IRouter = Router();

AuthRouter.post("/login", AuthController.login);
AuthRouter.post("/verify-otp", AuthController.verifyOTP);

//AuthRouter.post("/verify-jwt", AuthController.verifyJWT, (_req: Request, res: Response, _next: NextFunction) => {
//  const response = createAPIResponse(200, "Token is valid.");
//  res.status(response.status).json(response);
//});

export default AuthRouter;
