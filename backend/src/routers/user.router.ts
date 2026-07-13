import UserController from "@/controllers/user.service.js";
import { Router, type IRouter } from "express";

const UserRouter: IRouter = Router();

UserRouter.post("/", async (req, res, next) => {
  await UserController.createUser(req, res, next);
});

export default UserRouter;
