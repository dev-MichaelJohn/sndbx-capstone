import type { IEvaluationExecutionService } from "@/services/evaluation-execution.service.js";
import EvaluationExecutionService from "@/services/evaluation-execution.service.js";
import { AppError } from "@/utils/error.util.js";
import { createAPIResponse } from "@/utils/response.util.js";
import type { NextFunction, Request, Response } from "express";
import z from "zod";

export interface IEvaluationExecutionController {
  submitStudentEvaluation(req: Request, res: Response, next: NextFunction): Promise<void>;
  submitSupervisorEvaluation(req: Request, res: Response, next: NextFunction): Promise<void>;
  getStudentEvaluation(req: Request, res: Response, next: NextFunction): Promise<void>;
  getSupervisorEvaluation(req: Request, res: Response, next: NextFunction): Promise<void>;
}

export class evaluationExecutionController implements IEvaluationExecutionController {
  constructor(private executionService: IEvaluationExecutionService = EvaluationExecutionService) {}

  private async extractId(id: unknown, message: string): Promise<number> {
    const validation = await z.coerce.number().int().positive(message).safeParseAsync(id);
    if (!validation.success) throw validation.error;
    return validation.data;
  }

  async submitStudentEvaluation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.executionService.submitStudentEvaluation(req.body);
      res.status(200).json(createAPIResponse(200, "Student evaluation saved.", result));
    } catch (error) {
      next(error);
    }
  }

  async submitSupervisorEvaluation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError(401, "Authentication required.");

      const result = await this.executionService.submitSupervisorEvaluation(userId, req.body);
      res.status(200).json(createAPIResponse(200, "Supervisor evaluation saved.", result));
    } catch (error) {
      next(error);
    }
  }

  async getStudentEvaluation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const scheduleId = await this.extractId(req.params.scheduleId, "Valid scheduleId required.");
      const studentClassId = await this.extractId(
        req.params.studentClassId,
        "Valid studentClassId required.",
      );

      const result = await this.executionService.getStudentEvaluation(scheduleId, studentClassId);
      res.status(200).json(createAPIResponse(200, "Student evaluation retrieved.", result ?? null));
    } catch (error) {
      next(error);
    }
  }

  async getSupervisorEvaluation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError(401, "Authentication required.");

      const scheduleId = await this.extractId(req.params.scheduleId, "Valid scheduleId required.");
      const courseOfferingId = await this.extractId(
        req.params.courseOfferingId,
        "Valid courseOfferingId required.",
      );

      const result = await this.executionService.getSupervisorEvaluation(
        userId,
        scheduleId,
        courseOfferingId,
      );
      res
        .status(200)
        .json(createAPIResponse(200, "Supervisor evaluation retrieved.", result ?? null));
    } catch (error) {
      next(error);
    }
  }
}

const EvaluationExecutionController = new evaluationExecutionController();
export default EvaluationExecutionController;
