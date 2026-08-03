import UserController from "@/controllers/user.controller.js";
import { requirePermission } from "@/middlewares/rbac.middleware.js";
import { preventSysAdminCreation } from "@/middlewares/user.middleware.js";
import { PERMISSIONS } from "@/types/seeder.type.js";
import { Router, type IRouter } from "express";

const UserRouter: IRouter = Router();

UserRouter.post(
  "/",
  requirePermission(PERMISSIONS.ACCOUNT_CREATE),
  preventSysAdminCreation,
  async (req, res, next) => {
    await UserController.createUser(req, res, next);
  },
);

export default UserRouter;
