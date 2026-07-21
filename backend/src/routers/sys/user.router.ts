import UserController from "@/controllers/user.controller.js";
import { preventSysAdminCreation } from "@/middlewares/user.middleware.js";
import { Router, type IRouter } from "express";

const UserRouter: IRouter = Router();

UserRouter.post("/", preventSysAdminCreation, async (req, res, next) => {
  await UserController.createUser(req, res, next);
});

export default UserRouter;
