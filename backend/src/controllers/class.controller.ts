import type { IClassService } from "@/services/class.service.js";
import ClassService from "@/services/class.service.js";
import { ClassSearchSchema } from "@/types/class.type.js";
import { AppError } from "@/utils/error.util.js";
import { createAPIResponse } from "@/utils/response.util.js";
import type { NextFunction, Request, Response } from "express";
import z from "zod";

class classController {
  constructor(private classService: IClassService = ClassService) {}

  private async extractId(id: unknown, message: string) {
    const validation = await z.coerce
      .number(message)
      .int(message)
      .positive(message)
      .safeParseAsync(id);
    if (!validation.success) throw validation.error;
    return validation.data;
  }

  async getClasses(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const programId = id ? await this.extractId(id, "Program ID is required.") : undefined;

      const validation = await ClassSearchSchema.safeParseAsync({
        ...req.query,
        ...(programId !== undefined && { program_id: programId }),
      });
      if (!validation.success) throw validation.error;
      const searchQuery = validation.data;

      const result = await this.classService.getClasses(searchQuery, req.supervisorScope);
      const response = createAPIResponse<typeof result>(
        200,
        "Class records retrieved successfully",
        result,
      );
      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getClass(req: Request, res: Response, next: NextFunction) {
    try {
      const { classId } = req.params;
      const parsedId = await this.extractId(classId, "Class ID is required.");

      const result = await this.classService.getClass(parsedId);
      const response = createAPIResponse<typeof result>(
        200,
        "Class record retrieved successfully",
        result,
      );
      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }

  async createClass(req: Request, res: Response, next: NextFunction) {
    try {
      const { body } = req;
      if (!body) throw new AppError(400, "Request body cannot be empty.");

      const result = await this.classService.createClass(body);
      const response = createAPIResponse<typeof result>(
        200,
        "Class record created successfully",
        result,
      );
      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateClass(req: Request, res: Response, next: NextFunction) {
    try {
      const { classId } = req.params;
      const parsedId = await this.extractId(classId, "Class ID is required.");
      const { body } = req;
      if (!body) throw new AppError(400, "Request body cannot be empty.");

      const result = await this.classService.updateClass({ class_id: parsedId, ...body });
      const response = createAPIResponse<typeof result>(
        200,
        "Class record updated successfully",
        result,
      );
      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }

  async deleteClass(req: Request, res: Response, next: NextFunction) {
    try {
      const { classId } = req.params;
      const parsedId = await this.extractId(classId, "Class ID is required.");

      await this.classService.deleteClass(parsedId);
      const response = createAPIResponse<null>(200, "Class record deleted successfully", null);
      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }
}

const ClassController = new classController();
export default ClassController;
