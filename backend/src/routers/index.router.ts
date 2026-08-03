import { Router, type IRouter } from "express";
import AuthRouter from "./auth.router.js";
import ProtectedRouter from "./protrected/index.router.js";

const v1Router: IRouter = Router();

v1Router.use("/auth", AuthRouter);
v1Router.use("/protected", ProtectedRouter);

export default v1Router;
