import CurriculumController from "@/controllers/curriculum.controller.js";
import { requirePermission } from "@/middlewares/rbac.middleware.js";
import { PERMISSIONS } from "@/types/seeder.type.js";
import { Router, type IRouter } from "express";

const CurriculumRouter: IRouter = Router({ mergeParams: true });

CurriculumRouter.get("/", requirePermission(PERMISSIONS.COURSE_CURRICULUM_READ), (req, res, next) =>
  CurriculumController.getCurriculums(req, res, next),
);
CurriculumRouter.get(
  "/:id",
  requirePermission(PERMISSIONS.COURSE_CURRICULUM_READ),
  (req, res, next) => CurriculumController.getCurriculum(req, res, next),
);
CurriculumRouter.post(
  "/",
  requirePermission(PERMISSIONS.COURSE_CURRICULUM_CREATE),
  (req, res, next) => CurriculumController.createCurriculum(req, res, next),
);
CurriculumRouter.put(
  "/:id",
  requirePermission(PERMISSIONS.COURSE_CURRICULUM_UPDATE),
  (req, res, next) => CurriculumController.updateCurriculum(req, res, next),
);
CurriculumRouter.delete(
  "/:id",
  requirePermission(PERMISSIONS.COURSE_CURRICULUM_DELETE),
  (req, res, next) => CurriculumController.deleteCurriculum(req, res, next),
);

export default CurriculumRouter;
