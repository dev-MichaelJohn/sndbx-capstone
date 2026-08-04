import type { IEvaluationScheduleService } from "@/services/evaluation-schedule.service.js";
import EvaluationScheduleService from "@/services/evaluation-schedule.service.js";
import { EvaluationTypeSchema, type EvaluationType } from "@/types/evaluation-schedule.type.js";
import { createAPIResponse } from "@/utils/response.util.js";
import type { NextFunction, Request, Response } from "express";
import z from "zod";

export interface IEvaluationScheduleController {
  createSchedule(req: Request, res: Response, next: NextFunction): Promise<void>;
  getSchedules(req: Request, res: Response, next: NextFunction): Promise<void>;
  getSchedule(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateSchedule(req: Request, res: Response, next: NextFunction): Promise<void>;
  deleteSchedule(req: Request, res: Response, next: NextFunction): Promise<void>;
  getActiveSchedule(req: Request, res: Response, next: NextFunction): Promise<void>;
}

export class evaluationScheduleController implements IEvaluationScheduleController {
  constructor(private scheduleService: IEvaluationScheduleService = EvaluationScheduleService) {}

  private async extractId(id: unknown, message: string): Promise<number> {
    const validation = await z.coerce.number().int().positive(message).safeParseAsync(id);
    if (!validation.success) throw validation.error;
    return validation.data;
  }

  private async extractType(type: unknown): Promise<EvaluationType> {
    const validation = await EvaluationTypeSchema.safeParseAsync(type);
    if (!validation.success) throw validation.error;
    return validation.data;
  }

  async createSchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const type = await this.extractType(req.params.type);
      const result = await this.scheduleService.createSchedule(type, req.body);
      res.status(201).json(createAPIResponse(201, "Schedule created.", result));
    } catch (error) {
      next(error);
    }
  }

  async getSchedules(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const type = await this.extractType(req.params.type);
      const semesterId = req.query.semester_id
        ? await this.extractId(req.query.semester_id, "Valid semester ID required.")
        : undefined;

      const result = await this.scheduleService.getSchedules(type, semesterId);
      res.status(200).json(createAPIResponse(200, "Schedules retrieved.", result));
    } catch (error) {
      next(error);
    }
  }

  async getSchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const type = await this.extractType(req.params.type);
      const id = await this.extractId(req.params.id, "Valid Schedule ID required.");
      const result = await this.scheduleService.getSchedule(type, id);
      res.status(200).json(createAPIResponse(200, "Schedule retrieved.", result));
    } catch (error) {
      next(error);
    }
  }

  async updateSchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const type = await this.extractType(req.params.type);
      const id = await this.extractId(req.params.id, "Valid Schedule ID required.");
      const result = await this.scheduleService.updateSchedule(type, id, req.body);
      res.status(200).json(createAPIResponse(200, "Schedule updated.", result));
    } catch (error) {
      next(error);
    }
  }

  async deleteSchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const type = await this.extractType(req.params.type);
      const id = await this.extractId(req.params.id, "Valid Schedule ID required.");
      await this.scheduleService.deleteSchedule(type, id);
      res.status(200).json(createAPIResponse<null>(200, "Schedule deleted.", null));
    } catch (error) {
      next(error);
    }
  }

  async getActiveSchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const type = await this.extractType(req.params.type);
      const semesterId = await this.extractId(req.params.semesterId, "Valid semester ID required.");
      const result = await this.scheduleService.getActiveSchedule(type, semesterId);
      res
        .status(200)
        .json(createAPIResponse(200, "Active schedule check completed.", result ?? null));
    } catch (error) {
      next(error);
    }
  }
}

const EvaluationScheduleController = new evaluationScheduleController();
export default EvaluationScheduleController;
