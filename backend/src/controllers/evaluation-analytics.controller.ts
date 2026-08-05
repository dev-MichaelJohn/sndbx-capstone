import type { NextFunction, Request, Response } from "express";
import z from "zod";
import type { IEvaluationAnalyticsService } from "@/services/evaluation-analytics.service.js";
import EvaluationAnalyticsService from "@/services/evaluation-analytics.service.js";
import { createAPIResponse } from "@/utils/response.util.js";

export interface IEvaluationAnalyticsController {
  getAnalytics(req: Request, res: Response, next: NextFunction): Promise<void>;
}

export class evaluationAnalyticsController implements IEvaluationAnalyticsController {
  constructor(private analyticsService: IEvaluationAnalyticsService = EvaluationAnalyticsService) {}

  private async extractSemesterId(semesterId: unknown): Promise<number | undefined> {
    if (semesterId === undefined) return undefined;
    const validation = await z.coerce
      .number()
      .int()
      .positive("Valid semester ID required.")
      .safeParseAsync(semesterId);
    if (!validation.success) throw validation.error;
    return validation.data;
  }

  async getAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const semesterId = await this.extractSemesterId(req.query.semester_id);
      const result = await this.analyticsService.getAnalytics(semesterId);

      res
        .status(200)
        .json(createAPIResponse(200, "Evaluation analytics retrieved successfully.", result));
    } catch (error) {
      next(error);
    }
  }
}

const EvaluationAnalyticsController = new evaluationAnalyticsController();
export default EvaluationAnalyticsController;
