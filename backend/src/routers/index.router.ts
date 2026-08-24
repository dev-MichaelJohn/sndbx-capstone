import { Router, type IRouter } from "express";
import AuthRouter from "./auth.router.js";
import ProtectedRouter from "./protrected/index.router.js";
import { createAPIResponse } from "@/utils/response.util.js";

const v1Router: IRouter = Router();

v1Router.get("/health", (_req, res, _next) => {
  const response = createAPIResponse(200, "Hello from PIT-FES V1 API!!");
  res.status(response.status).json(response);
});

v1Router.use("/auth", AuthRouter);
v1Router.use("/protected", ProtectedRouter);

export default v1Router;
