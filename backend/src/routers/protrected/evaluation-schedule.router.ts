import { Router, type IRouter } from "express";
import EvaluationScheduleController from "@/controllers/evaluation-schedule.controller.js";
import { requirePermission, requireAnyPermission } from "@/middlewares/rbac.middleware.js";
import { PERMISSIONS } from "@/types/seeder.type.js";

const EvaluationScheduleRouter: IRouter = Router({ mergeParams: true });

EvaluationScheduleRouter.get(
  "/:type/schedules",
  requireAnyPermission(
    PERMISSIONS.EVALUATION_PERIOD_MANAGE,
    PERMISSIONS.EVALUATION_PERIOD_READ,
    PERMISSIONS.EVALUATION_SUBMIT_SET,
    PERMISSIONS.EVALUATION_SUBMIT_SEF,
  ),
  (req, res, next) => EvaluationScheduleController.getSchedules(req, res, next),
);

EvaluationScheduleRouter.get(
  "/:type/schedules/active/:semesterId",
  requireAnyPermission(
    PERMISSIONS.EVALUATION_PERIOD_MANAGE,
    PERMISSIONS.EVALUATION_PERIOD_READ,
    PERMISSIONS.EVALUATION_SUBMIT_SET,
    PERMISSIONS.EVALUATION_SUBMIT_SEF,
  ),
  (req, res, next) => EvaluationScheduleController.getActiveSchedule(req, res, next),
);

EvaluationScheduleRouter.get(
  "/:type/schedules/:id",
  requireAnyPermission(
    PERMISSIONS.EVALUATION_PERIOD_MANAGE,
    PERMISSIONS.EVALUATION_PERIOD_READ,
    PERMISSIONS.EVALUATION_SUBMIT_SET,
    PERMISSIONS.EVALUATION_SUBMIT_SEF,
  ),
  (req, res, next) => EvaluationScheduleController.getSchedule(req, res, next),
);

EvaluationScheduleRouter.post(
  "/:type/schedules",
  requirePermission(PERMISSIONS.EVALUATION_PERIOD_MANAGE),
  (req, res, next) => EvaluationScheduleController.createSchedule(req, res, next),
);

EvaluationScheduleRouter.patch(
  "/:type/schedules/:id",
  requirePermission(PERMISSIONS.EVALUATION_PERIOD_MANAGE),
  (req, res, next) => EvaluationScheduleController.updateSchedule(req, res, next),
);

EvaluationScheduleRouter.delete(
  "/:type/schedules/:id",
  requirePermission(PERMISSIONS.EVALUATION_PERIOD_MANAGE),
  (req, res, next) => EvaluationScheduleController.deleteSchedule(req, res, next),
);

export default EvaluationScheduleRouter;
