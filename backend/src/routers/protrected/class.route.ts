import { Router, type IRouter } from "express";
import ClassController from "@/controllers/class.controller.js";
import { requirePermission } from "@/middlewares/rbac.middleware.js";
import { PERMISSIONS } from "@/types/seeder.type.js";

const ClassRouter: IRouter = Router({ mergeParams: true });

ClassRouter.get("/", requirePermission(PERMISSIONS.CLASS_READ), (req, res, next) =>
  ClassController.getClasses(req, res, next),
);
ClassRouter.get("/:classId", requirePermission(PERMISSIONS.CLASS_READ), (req, res, next) =>
  ClassController.getClass(req, res, next),
);
ClassRouter.post("/", requirePermission(PERMISSIONS.CLASS_CREATE), (req, res, next) =>
  ClassController.createClass(req, res, next),
);
ClassRouter.patch("/:classId", requirePermission(PERMISSIONS.CLASS_UPDATE), (req, res, next) =>
  ClassController.updateClass(req, res, next),
);
ClassRouter.delete("/:classId", requirePermission(PERMISSIONS.CLASS_DELETE), (req, res, next) =>
  ClassController.deleteClass(req, res, next),
);

export default ClassRouter;
