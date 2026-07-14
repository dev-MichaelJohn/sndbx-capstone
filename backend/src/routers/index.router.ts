import { Router, type IRouter } from "express";
import UserRouter from "./user.router.js";
import AuthRouter from "./auth.router.js";

const v1Router: IRouter = Router();

v1Router.use("/users", UserRouter);
v1Router.use("/auth", AuthRouter);

export default v1Router;
