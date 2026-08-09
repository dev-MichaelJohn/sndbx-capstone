import { Router, type IRouter } from "express";
import BulkImportController from "@/controllers/bulk-import.controller.js";
import { requirePermission } from "@/middlewares/rbac.middleware.js";
import { PERMISSIONS } from "@/types/seeder.type.js";

const BulkImportRouter: IRouter = Router({ mergeParams: true });

BulkImportRouter.post(
  "/:entity",
  requirePermission(PERMISSIONS.BULK_IMPORT_EXECUTE),
  (req, res, next) => BulkImportController.executeImport(req, res, next),
);

export default BulkImportRouter;
