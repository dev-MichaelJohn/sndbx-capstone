import type { IStudentClassService } from "@/services/student-class.service.js";
import StudentClassService from "@/services/student-class.service.js";
import { StudentClassSearchSchema } from "@/types/student-class.type.js";
import { AppError } from "@/utils/error.util.js";
import { createAPIResponse } from "@/utils/response.util.js";
import type { NextFunction, Request, Response } from "express";
import z from "zod";

class studentClassController {
  constructor(private studentClassService: IStudentClassService = StudentClassService) {}

  private async extractId(id: unknown, message: string) {
    const validation = await z.coerce
      .number(message)
      .int(message)
      .positive(message)
      .safeParseAsync(id);
    if (!validation.success) throw validation.error;
    return validation.data;
  }

  async getStudentClasses(req: Request, res: Response, next: NextFunction) {
    try {
      // When nested under /:id/student-classes, scope to that offering
      const { id } = req.params;
      const courseOfferingId = id
        ? await this.extractId(id, "Course offering ID is required.")
        : undefined;

      const validation = await StudentClassSearchSchema.safeParseAsync({
        ...req.query,
        ...(courseOfferingId !== undefined && { course_offering_id: courseOfferingId }),
      });
      if (!validation.success) throw validation.error;

      const result = await this.studentClassService.getStudentClasses(validation.data);
      const response = createAPIResponse<typeof result>(
        200,
        "Student class records retrieved successfully",
        result,
      );
      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getStudentClass(req: Request, res: Response, next: NextFunction) {
    try {
      const { studentClassId } = req.params;
      const parsedId = await this.extractId(studentClassId, "Student class ID is required.");

      const result = await this.studentClassService.getStudentClass(parsedId);
      const response = createAPIResponse<typeof result>(
        200,
        "Student class record retrieved successfully",
        result,
      );
      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }

  async createStudentClass(req: Request, res: Response, next: NextFunction) {
    try {
      const { body } = req;
      if (!body) throw new AppError(400, "Request body cannot be empty.");

      const result = await this.studentClassService.createStudentClass(body);
      const response = createAPIResponse<typeof result>(
        200,
        "Student enrolled successfully",
        result,
      );
      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }

  async deleteStudentClass(req: Request, res: Response, next: NextFunction) {
    try {
      const { studentClassId } = req.params;
      const parsedId = await this.extractId(studentClassId, "Student class ID is required.");

      await this.studentClassService.deleteStudentClass(parsedId);
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

const StudentClassController = new studentClassController();
export default StudentClassController;
