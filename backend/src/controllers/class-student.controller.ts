import type { IClassStudentService } from "@/services/class-student.service.js";
import ClassStudentService from "@/services/class-student.service.js";
import { ClassStudentSearchSchema } from "@/types/class-student.type.js";
import { AppError } from "@/utils/error.util.js";
import { createAPIResponse } from "@/utils/response.util.js";
import type { NextFunction, Request, Response } from "express";
import z from "zod";

class classStudentController {
  constructor(private classStudentService: IClassStudentService = ClassStudentService) {}

  private async extractId(id: unknown, message: string) {
    const validation = await z.coerce
      .number(message)
      .int(message)
      .positive(message)
      .safeParseAsync(id);
    if (!validation.success) throw validation.error;
    return validation.data;
  }

  async getClassStudents(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const classId = id ? await this.extractId(id, "Class ID is required.") : undefined;

      const validation = await ClassStudentSearchSchema.safeParseAsync({
        ...req.query,
        ...(classId !== undefined && { class_id: classId }),
      });
      if (!validation.success) throw validation.error;

      const result = await this.classStudentService.getClassStudents(validation.data);
      const response = createAPIResponse<typeof result>(
        200,
        "Class students retrieved successfully",
        result,
      );
      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getClassStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const { classStudentId } = req.params;
      const parsedId = await this.extractId(classStudentId, "Class student ID is required.");

      const result = await this.classStudentService.getClassStudent(parsedId);
      const response = createAPIResponse<typeof result>(
        200,
        "Class student record retrieved successfully",
        result,
      );
      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }

  async enrollStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const { body } = req;
      if (!body) throw new AppError(400, "Request body cannot be empty.");

      const result = await this.classStudentService.enrollStudent(body);
      const response = createAPIResponse<typeof result>(
        200,
        "Student enrolled in class successfully",
        result,
      );
      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }

  async dropStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const { classStudentId } = req.params;
      const parsedId = await this.extractId(classStudentId, "Class student ID is required.");

      await this.classStudentService.dropStudent(parsedId);
      const response = createAPIResponse<null>(
        200,
        "Student dropped from class successfully",
        null,
      );
      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }
}

const ClassStudentController = new classStudentController();
export default ClassStudentController;
