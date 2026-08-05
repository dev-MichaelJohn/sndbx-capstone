import { Router, type IRouter } from "express";
import EvaluationReportController from "@/controllers/evaluation-report.controller.js";
import { requirePermission } from "@/middlewares/rbac.middleware.js";
import { PERMISSIONS } from "@/types/seeder.type.js";

const EvaluationReportRouter: IRouter = Router({ mergeParams: true });

// System-wide Read Operation (Admin / Supervisor Dashboard)
EvaluationReportRouter.get(
  "/",
  requirePermission(PERMISSIONS.EVALUATION_REPORT_VIEW_ALL),
  (req, res, next) => EvaluationReportController.getAllReports(req, res, next),
);

// Batch Operations
EvaluationReportRouter.post(
  "/batch-generate",
  requirePermission(PERMISSIONS.EVALUATION_REPORT_GENERATE),
  (req, res, next) => EvaluationReportController.generateBatchReports(req, res, next),
);

// Faculty Self & Managed Read Operations
EvaluationReportRouter.get(
  "/my-reports",
  requirePermission(PERMISSIONS.EVALUATION_REPORT_VIEW_SELF),
  (req, res, next) => EvaluationReportController.getFacultyReports(req, res, next),
);

EvaluationReportRouter.get(
  "/faculty/:facultyId",
  requirePermission(PERMISSIONS.EVALUATION_REPORT_VIEW_ALL),
  (req, res, next) => EvaluationReportController.getFacultyReports(req, res, next),
);

// Single Report Detail (Accessible by Faculty for own report or Supervisors/Admins)
EvaluationReportRouter.get(
  "/:id",
  requirePermission(
    PERMISSIONS.EVALUATION_REPORT_VIEW_SELF,
    PERMISSIONS.EVALUATION_REPORT_VIEW_ALL,
  ),
  (req, res, next) => EvaluationReportController.getReportDetail(req, res, next),
);

// CHED Compliant Document Rendering (PDF Streams)
EvaluationReportRouter.get(
  "/:id/ifer/pdf",
  requirePermission(
    PERMISSIONS.EVALUATION_REPORT_VIEW_SELF,
    PERMISSIONS.EVALUATION_REPORT_VIEW_ALL,
  ),
  (req, res, next) => EvaluationReportController.downloadIferPdf(req, res, next),
);

EvaluationReportRouter.get(
  "/:id/fedaf/pdf",
  requirePermission(
    PERMISSIONS.EVALUATION_REPORT_VIEW_SELF,
    PERMISSIONS.EVALUATION_REPORT_VIEW_ALL,
  ),
  (req, res, next) => EvaluationReportController.downloadFedafPdf(req, res, next),
);

// Development Planning & Acknowledgment Lifecycles
EvaluationReportRouter.patch(
  "/:id/development-plan",
  requirePermission(PERMISSIONS.EVALUATION_REPORT_MANAGE_STATUS),
  (req, res, next) => EvaluationReportController.saveDevelopmentPlan(req, res, next),
);

EvaluationReportRouter.patch(
  "/:id/acknowledge",
  requirePermission(PERMISSIONS.EVALUATION_REPORT_VIEW_SELF),
  (req, res, next) => EvaluationReportController.acknowledgeReport(req, res, next),
);

EvaluationReportRouter.patch(
  "/:id/status",
  requirePermission(PERMISSIONS.EVALUATION_REPORT_MANAGE_STATUS),
  (req, res, next) => EvaluationReportController.updateReportStatus(req, res, next),
);

export default EvaluationReportRouter;
