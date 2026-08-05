import { Router, type IRouter } from "express";
import EvaluationAnalyticsController from "@/controllers/evaluation-analytics.controller.js";
import { requirePermission } from "@/middlewares/rbac.middleware.js";
import { PERMISSIONS } from "@/types/seeder.type.js";

const EvaluationAnalyticsRouter: IRouter = Router({ mergeParams: true });

// Institutional Evaluation Analytics Dashboard Endpoint
EvaluationAnalyticsRouter.get(
  "/",
  requirePermission(PERMISSIONS.EVALUATION_REPORT_VIEW_ALL),
  (req, res, next) => EvaluationAnalyticsController.getAnalytics(req, res, next),
);

export default EvaluationAnalyticsRouter;
