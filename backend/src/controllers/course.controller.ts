import type { ICourseService } from "@/services/course.service.js";
import CourseService from "@/services/course.service.js";
import { CourseSearchSchema } from "@/types/course.type.js";
import { AppError } from "@/utils/error.util.js";
import { createAPIResponse } from "@/utils/response.util.js";
import type { NextFunction, Request, Response } from "express";
import z from "zod";

class courseController {
  constructor(private courseService: ICourseService = CourseService) {}

  private async extractId(id: unknown, message: string) {
    const validation = await z.coerce
      .number(message)
      .int(message)
      .positive(message)
      .safeParseAsync(id);
    if (!validation.success) throw validation.error;
    return validation.data;
  }

  async getCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      let parsedId: number | undefined;

      if (id) parsedId = await this.extractId(id, "College ID is required.");

      const validation = await CourseSearchSchema.safeParseAsync({
        ...(parsedId && { program_id: parsedId }),
        ...req.query,
      });
      if (!validation.success) throw validation.error;
      const searchQuery = validation.data;

      const result = await this.courseService.getCourses(searchQuery);
      const response = createAPIResponse<typeof result>(
        200,
        "Course records retrieved successfully",
        result,
      );
      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const parsedId = await this.extractId(id, "Course ID is required.");

      const result = await this.courseService.getCourse(parsedId);
      const response = createAPIResponse<typeof result>(
        200,
        "Course record retrieved successfully",
        result,
      );
      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }

  async createCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { body } = req;
      if (!body) throw new AppError(400, "Request body cannot be empty.");

      const result = await this.courseService.createCourse(body);
      const response = createAPIResponse<typeof result>(
        200,
        "Course record created successfully",
        result,
      );
      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const parsedId = await this.extractId(id, "Course ID is required.");
      const { body } = req;
      if (!body) throw new AppError(400, "Request body cannot be empty.");

      const result = await this.courseService.updateCourse({ course_id: parsedId, ...body });
      const response = createAPIResponse<typeof result>(
        200,
        "Course record updated successfully",
        result,
      );
      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }

  async deleteCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const parsedId = await this.extractId(id, "Course ID is required.");

      await this.courseService.deleteCourse(parsedId);
      const response = createAPIResponse<null>(200, "Course record deleted successfully", null);
      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }
}

const CourseController = new courseController();
export default CourseController;
