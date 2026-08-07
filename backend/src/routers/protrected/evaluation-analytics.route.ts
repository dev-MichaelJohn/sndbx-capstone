import { Router, type IRouter } from "express";
import EvaluationAnalyticsController from "@/controllers/evaluation-analytics.controller.js";
import { requirePermission } from "@/middlewares/rbac.middleware.js";
import { PERMISSIONS } from "@/types/seeder.type.js";
import { resolveSupervisorScope } from "@/middlewares/supervisor-scope.middleware.js";

const EvaluationAnalyticsRouter: IRouter = Router({ mergeParams: true });

// Institutional Evaluation Analytics Dashboard Endpoint
EvaluationAnalyticsRouter.get(
  "/",
  requirePermission(PERMISSIONS.EVALUATION_REPORT_VIEW_ALL),
  resolveSupervisorScope,
  (req, res, next) => EvaluationAnalyticsController.getAnalytics(req, res, next),
);

export default EvaluationAnalyticsRouter;
