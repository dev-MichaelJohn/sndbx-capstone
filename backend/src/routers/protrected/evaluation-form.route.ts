import { Router, type IRouter } from "express";
import EvaluationFormController from "@/controllers/evaluation-form.controller.js";
import { requirePermission } from "@/middlewares/rbac.middleware.js";
import { PERMISSIONS } from "@/types/seeder.type.js";

const EvaluationFormRouter: IRouter = Router({ mergeParams: true });

// ==========================================
// FORM ROOT ENDPOINTS
// ==========================================
EvaluationFormRouter.post(
  "/:type/forms",
  requirePermission(PERMISSIONS.EVALUATION_FORM_MANAGE),
  (req, res, next) => EvaluationFormController.createForm(req, res, next),
);
EvaluationFormRouter.get(
  "/:type/forms/:formId",
  requirePermission(PERMISSIONS.EVALUATION_FORM_MANAGE),
  (req, res, next) => EvaluationFormController.getFormTree(req, res, next),
);

// ==========================================
// CATEGORY ENDPOINTS
// ==========================================
EvaluationFormRouter.get(
  "/:type/forms/:formId/categories",
  requirePermission(PERMISSIONS.EVALUATION_FORM_MANAGE),
  (req, res, next) => EvaluationFormController.getCategories(req, res, next),
);
EvaluationFormRouter.post(
  "/:type/forms/:formId/categories",
  requirePermission(PERMISSIONS.EVALUATION_FORM_MANAGE),
  (req, res, next) => EvaluationFormController.addCategory(req, res, next),
);
EvaluationFormRouter.patch(
  "/:type/categories/:categoryId",
  requirePermission(PERMISSIONS.EVALUATION_FORM_MANAGE),
  (req, res, next) => EvaluationFormController.updateCategory(req, res, next),
);
EvaluationFormRouter.delete(
  "/:type/categories/:categoryId",
  requirePermission(PERMISSIONS.EVALUATION_FORM_MANAGE),
  (req, res, next) => EvaluationFormController.deleteCategory(req, res, next),
);

// ==========================================
// QUESTION ENDPOINTS
// ==========================================
EvaluationFormRouter.get(
  "/:type/categories/:categoryId/questions",
  requirePermission(PERMISSIONS.EVALUATION_FORM_MANAGE),
  (req, res, next) => EvaluationFormController.getQuestions(req, res, next),
);
EvaluationFormRouter.post(
  "/:type/categories/:categoryId/questions",
  requirePermission(PERMISSIONS.EVALUATION_FORM_MANAGE),
  (req, res, next) => EvaluationFormController.addQuestion(req, res, next),
);
EvaluationFormRouter.patch(
  "/:type/questions/:questionId",
  requirePermission(PERMISSIONS.EVALUATION_FORM_MANAGE),
  (req, res, next) => EvaluationFormController.updateQuestion(req, res, next),
);
EvaluationFormRouter.delete(
  "/:type/questions/:questionId",
  requirePermission(PERMISSIONS.EVALUATION_FORM_MANAGE),
  (req, res, next) => EvaluationFormController.deleteQuestion(req, res, next),
);

// ==========================================
// SUPERVISOR MEANS (DESCRIPTORS) ENDPOINTS
// ==========================================
EvaluationFormRouter.get(
  "/supervisor/questions/:questionId/means",
  requirePermission(PERMISSIONS.EVALUATION_FORM_MANAGE),
  (req, res, next) => EvaluationFormController.getMeans(req, res, next),
);
EvaluationFormRouter.post(
  "/supervisor/questions/:questionId/means",
  requirePermission(PERMISSIONS.EVALUATION_FORM_MANAGE),
  (req, res, next) => EvaluationFormController.addMean(req, res, next),
);
EvaluationFormRouter.patch(
  "/supervisor/means/:meanId",
  requirePermission(PERMISSIONS.EVALUATION_FORM_MANAGE),
  (req, res, next) => EvaluationFormController.updateMean(req, res, next),
);
EvaluationFormRouter.delete(
  "/supervisor/means/:meanId",
  requirePermission(PERMISSIONS.EVALUATION_FORM_MANAGE),
  (req, res, next) => EvaluationFormController.deleteMean(req, res, next),
);

export default EvaluationFormRouter;
