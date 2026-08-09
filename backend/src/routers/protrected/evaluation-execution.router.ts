import { Router, type IRouter } from "express";
import EvaluationExecutionController from "@/controllers/evaluation-execution.controller.js";
import { requirePermission } from "@/middlewares/rbac.middleware.js";
import { PERMISSIONS } from "@/types/seeder.type.js";
import { evaluationExecutionLimiter } from "@/utils/rate-limiter.util.js";

const EvaluationExecutionRouter: IRouter = Router({ mergeParams: true });

EvaluationExecutionRouter.use(evaluationExecutionLimiter);

// Live activity feed endpoint
EvaluationExecutionRouter.get("/recent-submissions", (req, res, next) =>
  EvaluationExecutionController.getRecentAnonymousSubmissions(req, res, next),
);

// Student execution endpoints
EvaluationExecutionRouter.get(
  "/student/schedule/:scheduleId/class/:studentClassId",
  requirePermission(PERMISSIONS.EVALUATION_SUBMIT_SET),
  (req, res, next) => EvaluationExecutionController.getStudentEvaluation(req, res, next),
);

EvaluationExecutionRouter.post(
  "/student/submit",
  requirePermission(PERMISSIONS.EVALUATION_SUBMIT_SET),
  (req, res, next) => EvaluationExecutionController.submitStudentEvaluation(req, res, next),
);

// Supervisor summary & execution endpoints
EvaluationExecutionRouter.get(
  "/supervisor/schedule/:scheduleId/summary",
  requirePermission(PERMISSIONS.EVALUATION_SUBMIT_SEF),
  (req, res, next) => EvaluationExecutionController.getSupervisorEvaluationsSummary(req, res, next),
);

EvaluationExecutionRouter.get(
  "/supervisor/schedule/:scheduleId/course/:courseOfferingId",
  requirePermission(PERMISSIONS.EVALUATION_SUBMIT_SEF),
  (req, res, next) => EvaluationExecutionController.getSupervisorEvaluation(req, res, next),
);

EvaluationExecutionRouter.post(
  "/supervisor/submit",
  requirePermission(PERMISSIONS.EVALUATION_SUBMIT_SEF),
  (req, res, next) => EvaluationExecutionController.submitSupervisorEvaluation(req, res, next),
);

export default EvaluationExecutionRouter;
