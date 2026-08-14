import SemesterController from "@/controllers/semester.controller.js";
import { requireAnyPermission, requirePermission } from "@/middlewares/rbac.middleware.js";
import { PERMISSIONS } from "@/types/seeder.type.js";
import { Router, type IRouter } from "express";

const SemesterRouter: IRouter = Router();

SemesterRouter.get(
  "/",
  requireAnyPermission(PERMISSIONS.SEMESTER_READ, PERMISSIONS.EVALUATION_PERIOD_READ),
  (req, res, next) => {
    SemesterController.getSemesters(req, res, next);
  },
);

SemesterRouter.get(
  "/:id",
  requireAnyPermission(PERMISSIONS.SEMESTER_READ, PERMISSIONS.EVALUATION_PERIOD_READ),
  (req, res, next) => {
    SemesterController.getSemester(req, res, next);
  },
);

SemesterRouter.post("/", requirePermission(PERMISSIONS.SEMESTER_CREATE), (req, res, next) => {
  SemesterController.createSemester(req, res, next);
});

SemesterRouter.put("/:id", requirePermission(PERMISSIONS.SEMESTER_UPDATE), (req, res, next) => {
  SemesterController.updateSemester(req, res, next);
});

SemesterRouter.delete("/:id", requirePermission(PERMISSIONS.SEMESTER_DELETE), (req, res, next) => {
  SemesterController.deleteSemester(req, res, next);
});

export default SemesterRouter;
