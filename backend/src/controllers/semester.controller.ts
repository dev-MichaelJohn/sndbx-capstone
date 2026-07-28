import type { ISemesterService } from "@/services/semester.service.js";
import SemesterService from "@/services/semester.service.js";
import { SemesterSearchSchema } from "@/types/semester.type.js";
import { AppError } from "@/utils/error.util.js";
import { createAPIResponse } from "@/utils/response.util.js";
import type { NextFunction, Request, Response } from "express";
import z from "zod";

class semesterController {
  constructor(private semesterService: ISemesterService = SemesterService) {}

  private async extractId(id: unknown, message: string) {
    const validation = await z.coerce
      .number(message)
      .int(message)
      .positive(message)
      .safeParseAsync(id);
    if (!validation.success) throw validation.error;

    return validation.data;
  }

  async getSemesters(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = await SemesterSearchSchema.safeParseAsync(req.query);
      if (!validation.success) throw validation.error;

      const searchQuery = validation.data;
      const result = await this.semesterService.getSemesters(searchQuery);
      const response = createAPIResponse<typeof result>(
        200,
        "Semester records retrieved successfully",
        result,
      );

      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getSemester(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const parsedId = await this.extractId(id, "Semester ID is required.");

      const result = await this.semesterService.getSemester(parsedId);
      const response = createAPIResponse<typeof result>(
        200,
        "Semester record retrieved successfully",
        result,
      );

      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }

  async createSemester(req: Request, res: Response, next: NextFunction) {
    try {
      const { body } = req;
      if (!body) throw new AppError(400, "Request body cannot be empty.");

      const result = await this.semesterService.createSemester(body);
      const response = createAPIResponse<typeof result>(
        200,
        "Semester record created successfully",
        result,
      );

      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateSemester(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const parsedId = await this.extractId(id, "Semester ID is required.");

      const { body } = req;
      if (!body) throw new AppError(400, "Request body cannot be empty.");

      const result = await this.semesterService.updateSemester({ semester_id: parsedId, ...body });
      const response = createAPIResponse<typeof result>(
        200,
        "Semester record updated successfully",
        result,
      );

      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }

  async deleteSemester(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const parsedId = await this.extractId(id, "Semester ID is required.");

      const result = await this.semesterService.deleteSemester(parsedId);
      const response = createAPIResponse<typeof result>(
        200,
        "Semester record deleted successfully",
        result,
      );

      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }
}

const SemesterController = new semesterController();
export default SemesterController;
