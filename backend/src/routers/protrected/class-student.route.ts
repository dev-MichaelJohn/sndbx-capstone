import { Router, type IRouter } from "express";
import ClassStudentController from "@/controllers/class-student.controller.js";
import { requirePermission } from "@/middlewares/rbac.middleware.js";
import { PERMISSIONS } from "@/types/seeder.type.js";

const ClassStudentRouter: IRouter = Router({ mergeParams: true });

ClassStudentRouter.get("/", requirePermission(PERMISSIONS.CLASS_STUDENT_READ), (req, res, next) =>
  ClassStudentController.getClassStudents(req, res, next),
);
ClassStudentRouter.get(
  "/:classStudentId",
  requirePermission(PERMISSIONS.CLASS_STUDENT_READ),
  (req, res, next) => ClassStudentController.getClassStudent(req, res, next),
);
ClassStudentRouter.post(
  "/",
  requirePermission(PERMISSIONS.CLASS_STUDENT_CREATE),
  (req, res, next) => ClassStudentController.enrollStudent(req, res, next),
);
ClassStudentRouter.delete(
  "/:classStudentId",
  requirePermission(PERMISSIONS.CLASS_STUDENT_DELETE),
  (req, res, next) => ClassStudentController.dropStudent(req, res, next),
);

export default ClassStudentRouter;
