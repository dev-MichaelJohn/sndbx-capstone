import type { NextFunction, Request, Response } from "express";
import z from "zod";
import type { IEvaluationReportService } from "@/services/evaluation-report.service.js";
import EvaluationReportService from "@/services/evaluation-report.service.js";
import { SYSTEM_ROLES } from "@/types/seeder.type.js";
import { AppError } from "@/utils/error.util.js";
import { createAPIResponse } from "@/utils/response.util.js";

export interface IEvaluationReportController {
  getAllReports(req: Request, res: Response, next: NextFunction): Promise<void>;
  generateBatchReports(req: Request, res: Response, next: NextFunction): Promise<void>;
  getReportDetail(req: Request, res: Response, next: NextFunction): Promise<void>;
  getFacultyReports(req: Request, res: Response, next: NextFunction): Promise<void>;
  saveDevelopmentPlan(req: Request, res: Response, next: NextFunction): Promise<void>;
  acknowledgeReport(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateReportStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
  downloadIferPdf(req: Request, res: Response, next: NextFunction): Promise<void>;
  downloadFedafPdf(req: Request, res: Response, next: NextFunction): Promise<void>;
}

export class evaluationReportController implements IEvaluationReportController {
  constructor(private reportService: IEvaluationReportService = EvaluationReportService) {}

  private async extractId(id: unknown, message: string): Promise<number> {
    const validation = await z.coerce.number().int().positive(message).safeParseAsync(id);
    if (!validation.success) throw validation.error;
    return validation.data;
  }

  private isFacultySelfView(req: Request): boolean {
    return req.user?.roles?.includes(SYSTEM_ROLES.FACULTY) ?? false;
  }

  async getAllReports(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.reportService.getAllReports();
      res
        .status(200)
        .json(createAPIResponse(200, "All evaluation reports retrieved successfully.", result));
    } catch (error) {
      next(error);
    }
  }

  async generateBatchReports(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.reportService.generateBatchReports(req.body);
      res
        .status(201)
        .json(createAPIResponse(201, "Batch evaluation reports generated successfully.", result));
    } catch (error) {
      next(error);
    }
  }

  async getReportDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = await this.extractId(req.params.id, "Valid report ID required.");
      const isSelfView = this.isFacultySelfView(req);
      const result = await this.reportService.getReportDetail(id, isSelfView);

      res.status(200).json(createAPIResponse(200, "Report detail retrieved successfully.", result));
    } catch (error) {
      next(error);
    }
  }

  async getFacultyReports(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const facultyId = req.params.facultyId
        ? await this.extractId(req.params.facultyId, "Valid faculty ID required.")
        : req.user?.id;

      if (!facultyId) throw new AppError(401, "Authentication required.");

      const result = await this.reportService.getFacultyReports(facultyId);
      res
        .status(200)
        .json(createAPIResponse(200, "Faculty evaluation reports retrieved successfully.", result));
    } catch (error) {
      next(error);
    }
  }

  async saveDevelopmentPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = await this.extractId(req.params.id, "Valid report ID required.");
      const result = await this.reportService.saveDevelopmentPlan(id, req.body);
      res
        .status(200)
        .json(createAPIResponse(200, "FEDAF development plan updated successfully.", result));
    } catch (error) {
      next(error);
    }
  }

  async acknowledgeReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = await this.extractId(req.params.id, "Valid report ID required.");
      const facultyId = req.user?.id;
      if (!facultyId) throw new AppError(401, "Authentication required.");

      const result = await this.reportService.acknowledgeReport(id, facultyId);
      res
        .status(200)
        .json(createAPIResponse(200, "Report acknowledged by faculty successfully.", result));
    } catch (error) {
      next(error);
    }
  }

  async updateReportStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = await this.extractId(req.params.id, "Valid report ID required.");
      const result = await this.reportService.updateReportStatus(id, req.body);
      res.status(200).json(createAPIResponse(200, "Report status updated successfully.", result));
    } catch (error) {
      next(error);
    }
  }

  async downloadIferPdf(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = await this.extractId(req.params.id, "Valid report ID required.");
      const isSelfView = this.isFacultySelfView(req);
      const pdfBuffer = await this.reportService.renderIferPdf(id, isSelfView);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="IFER-Report-${id}.pdf"`);
      res.status(200).send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }

  async downloadFedafPdf(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = await this.extractId(req.params.id, "Valid report ID required.");
      const pdfBuffer = await this.reportService.renderFedafPdf(id);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="FEDAF-Report-${id}.pdf"`);
      res.status(200).send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }
}

const EvaluationReportController = new evaluationReportController();
export default EvaluationReportController;
