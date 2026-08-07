import type { ICourseOfferingService } from "@/services/offerings.service.js";
import CourseOfferingService from "@/services/offerings.service.js";
import { CourseOfferingSearchSchema } from "@/types/offerings.type.js";
import { AppError } from "@/utils/error.util.js";
import { createAPIResponse } from "@/utils/response.util.js";
import type { NextFunction, Request, Response } from "express";
import z from "zod";

class courseOfferingController {
  constructor(private courseOfferingService: ICourseOfferingService = CourseOfferingService) {}

  private async extractId(id: unknown, message: string) {
    const validation = await z.coerce
      .number(message)
      .int(message)
      .positive(message)
      .safeParseAsync(id);
    if (!validation.success) throw validation.error;
    return validation.data;
  }

  async getCourseOfferings(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // Nested under /sys/classes/:id/course-offerings → id present, scope to it.
      // Called directly at /sys/course-offerings → id absent, fall back to query.
      const classId = id ? await this.extractId(id, "Class ID is required.") : undefined;

      const validation = await CourseOfferingSearchSchema.safeParseAsync({
        ...req.query,
        ...(classId !== undefined && { class_id: classId }),
      });
      if (!validation.success) throw validation.error;
      const searchQuery = validation.data;

      const result = await this.courseOfferingService.getCourseOfferings(
        searchQuery,
        req.supervisorScope,
      );
      const response = createAPIResponse<typeof result>(
        200,
        "Course offering records retrieved successfully.",
        result,
      );
      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getCourseOffering(req: Request, res: Response, next: NextFunction) {
    try {
      const { offeringId } = req.params;
      const parsedId = await this.extractId(offeringId, "Course offering ID is required.");

      const result = await this.courseOfferingService.getCourseOffering(parsedId);
      const response = createAPIResponse<typeof result>(
        200,
        "Course offering retrieved successfully.",
        result,
      );
      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }

  async createCourseOffering(req: Request, res: Response, next: NextFunction) {
    try {
      const { body } = req;
      if (!body) throw new AppError(400, "Request body cannot be empty.");

      const { offering, faculty } = body;
      if (!offering) throw new AppError(400, "Course offering details are required.");

      const result = await this.courseOfferingService.createCourseOffering({
        offering,
        faculty,
      });
      const response = createAPIResponse<typeof result>(
        201,
        "Course offering record was successfully created.",
        result,
      );
      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateCourseOffering(req: Request, res: Response, next: NextFunction) {
    try {
      const { offeringId } = req.params;
      const parsedId = await this.extractId(offeringId, "Course offering ID is required.");
      const { body } = req;
      if (!body) throw new AppError(400, "Request body cannot be empty.");

      const { offering, faculty } = body;

      const result = await this.courseOfferingService.updateCourseOffering({
        course_offering_id: parsedId,
        offering,
        faculty,
      });
      const response = createAPIResponse<typeof result>(
        200,
        "Course offering record was successfully updated.",
        result,
      );
      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }

  async deleteCourseOffering(req: Request, res: Response, next: NextFunction) {
    try {
      const { offeringId } = req.params;
      const parsedId = await this.extractId(offeringId, "Course offering ID is required.");

      await this.courseOfferingService.deleteCourseOffering(parsedId);
      const response = createAPIResponse<null>(
        200,
        "Course offering record was successfully deleted.",
        null,
      );
      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }
}

const CourseOfferingController = new courseOfferingController();
export default CourseOfferingController;
