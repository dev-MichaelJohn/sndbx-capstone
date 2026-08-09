import type { NextFunction, Request, Response } from "express";
import BulkImportService, { type IBulkImportService } from "@/services/bulk-import.service.js";
import { BulkEntitySchema } from "@/types/bulk-import.type.js";
import { createAPIResponse } from "@/utils/response.util.js";

export class bulkImportController {
  constructor(private importService: IBulkImportService = BulkImportService) {}

  async executeImport(req: Request, res: Response, next: NextFunction) {
    try {
      const entityValidation = await BulkEntitySchema.safeParseAsync(req.params.entity);
      if (!entityValidation.success) throw entityValidation.error;

      const result = await this.importService.executeImport(entityValidation.data, req.body.rows);
      res.status(200).json(createAPIResponse(200, "Bulk import execution completed.", result));
    } catch (error) {
      next(error);
    }
  }
}

const BulkImportController = new bulkImportController();
export default BulkImportController;
