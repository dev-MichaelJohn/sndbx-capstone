import { Router, type IRouter } from "express";
import StudentClassController from "@/controllers/student-class.controller.js";
import { requirePermission } from "@/middlewares/rbac.middleware.js";
import { PERMISSIONS } from "@/types/seeder.type.js";

const StudentClassRouter: IRouter = Router({ mergeParams: true });

StudentClassRouter.get("/", requirePermission(PERMISSIONS.STUDENT_READ), (req, res, next) =>
  StudentClassController.getStudentClasses(req, res, next),
);
StudentClassRouter.get(
  "/:studentClassId",
  requirePermission(PERMISSIONS.STUDENT_READ),
  (req, res, next) => StudentClassController.getStudentClass(req, res, next),
);
StudentClassRouter.post("/", requirePermission(PERMISSIONS.STUDENT_CREATE), (req, res, next) =>
  StudentClassController.createStudentClass(req, res, next),
);
StudentClassRouter.delete(
  "/:studentClassId",
  requirePermission(PERMISSIONS.STUDENT_DELETE),
  (req, res, next) => StudentClassController.deleteStudentClass(req, res, next),
);

export default StudentClassRouter;
