import SystemLogController from "@/controllers/system-log.controller.js";
import { requirePermission } from "@/middlewares/rbac.middleware.js";
import { PERMISSIONS } from "@/types/seeder.type.js";
import { Router, type IRouter } from "express";

const SystemLogRouter: IRouter = Router();

SystemLogRouter.get("/", requirePermission(PERMISSIONS.SYSTEM_LOG_READ), (req, res, next) =>
  SystemLogController.getLogs(req, res, next),
);

SystemLogRouter.get("/live", requirePermission(PERMISSIONS.SYSTEM_LOG_READ), (req, res) =>
  SystemLogController.streamLogs(req, res),
);

export default SystemLogRouter;
