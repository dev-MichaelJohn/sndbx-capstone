import { Router, type IRouter } from "express";
import UserRouter from "./user.router.js";

const v1Router: IRouter = Router();

v1Router.use("/users", UserRouter);

export default v1Router;
