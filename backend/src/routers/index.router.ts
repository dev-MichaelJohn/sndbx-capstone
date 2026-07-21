import { Router, type IRouter } from "express";
import AuthRouter from "./auth.router.js";
import SysRouter from "./sys/index.router.js";

const v1Router: IRouter = Router();

v1Router.use("/auth", AuthRouter);
v1Router.use("/sys", SysRouter);

export default v1Router;
