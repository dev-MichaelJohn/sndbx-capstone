import ProgramController from "@/controllers/program.controller.js";
import { Router, type IRouter } from "express";
import CourseRouter from "./course.route.js";
import CurriculumRouter from "./curriculum.route.js";
import ClassRouter from "./class.route.js";
import { requirePermission } from "@/middlewares/rbac.middleware.js";
import { PERMISSIONS } from "@/types/seeder.type.js";
import { resolveSupervisorScope } from "@/middlewares/supervisor-scope.middleware.js";

const ProgramRouter: IRouter = Router({ mergeParams: true });

ProgramRouter.get(
  "/available-chairs",
  requirePermission(PERMISSIONS.PROGRAM_READ),
  (req, res, next) => {
    ProgramController.searchAvailableChairCandidates(req, res, next);
  },
);

ProgramRouter.get(
  "/",
  requirePermission(PERMISSIONS.PROGRAM_READ),
  resolveSupervisorScope,
  (req, res, next) => {
    ProgramController.getPrograms(req, res, next);
  },
);

ProgramRouter.get("/:program_id", requirePermission(PERMISSIONS.PROGRAM_READ), (req, res, next) => {
  ProgramController.getProgram(req, res, next);
});

ProgramRouter.post("/", requirePermission(PERMISSIONS.PROGRAM_CREATE), (req, res, next) => {
  ProgramController.createProgramRecord(req, res, next);
});

ProgramRouter.put(
  "/:program_id",
  requirePermission(PERMISSIONS.PROGRAM_UPDATE),
  (req, res, next) => {
    ProgramController.updateProgramRecord(req, res, next);
  },
);

ProgramRouter.delete(
  "/:program_id",
  requirePermission(PERMISSIONS.PROGRAM_DELETE),
  (req, res, next) => {
    ProgramController.deleteProgramRecord(req, res, next);
  },
);

ProgramRouter.use("/:id/courses", requirePermission(PERMISSIONS.COURSE_READ), CourseRouter);
ProgramRouter.use(
  "/:id/curriculum",
  requirePermission(PERMISSIONS.COURSE_CURRICULUM_READ),
  CurriculumRouter,
);
ProgramRouter.use("/:id/classes", requirePermission(PERMISSIONS.CLASS_READ), ClassRouter);

export default ProgramRouter;
