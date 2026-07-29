import type { ICurriculumService } from "@/services/curriculum.service.js";
import CurriculumService from "@/services/curriculum.service.js";
import { CurriculumSearchSchema } from "@/types/curriculum.type.js";
import { AppError } from "@/utils/error.util.js";
import { createAPIResponse } from "@/utils/response.util.js";
import type { NextFunction, Request, Response } from "express";
import z from "zod";

class curriculumController {
  constructor(private curriculumService: ICurriculumService = CurriculumService) {}

  private async extractId(id: unknown, message: string) {
    const validation = await z.coerce
      .number(message)
      .int(message)
      .positive(message)
      .safeParseAsync(id);
    if (!validation.success) throw validation.error;
    return validation.data;
  }

  async getCurriculums(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      let parsedId: number | undefined;

      if (id) parsedId = await this.extractId(id, "Program ID is required.");

      const validation = await CurriculumSearchSchema.safeParseAsync({
        ...req.query,
        ...(parsedId && { program_id: parsedId }),
      });
      if (!validation.success) throw validation.error;
      const searchQuery = validation.data;

      const result = await this.curriculumService.getCurriculums(searchQuery);
      const response = createAPIResponse<typeof result>(
        200,
        "Curriculum records retrieved successfully",
        result,
      );
      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getCurriculum(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const parsedId = await this.extractId(id, "Curriculum ID is required.");

      const result = await this.curriculumService.getCurriculum(parsedId);
      const response = createAPIResponse<typeof result>(
        200,
        "Curriculum record retrieved successfully",
        result,
      );
      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }

  async createCurriculum(req: Request, res: Response, next: NextFunction) {
    try {
      const { body } = req;
      if (!body) throw new AppError(400, "Request body cannot be empty.");

      const result = await this.curriculumService.createCurriculum(body);
      const response = createAPIResponse<typeof result>(
        200,
        "Curriculum record created successfully",
        result,
      );
      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateCurriculum(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const parsedId = await this.extractId(id, "Curriculum ID is required.");
      const { body } = req;
      if (!body) throw new AppError(400, "Request body cannot be empty.");

      const result = await this.curriculumService.updateCurriculum({
        curriculum_id: parsedId,
        ...body,
      });
      const response = createAPIResponse<typeof result>(
        200,
        "Curriculum record updated successfully",
        result,
      );
      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }

  async deleteCurriculum(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const parsedId = await this.extractId(id, "Curriculum ID is required.");

      await this.curriculumService.deleteCurriculum(parsedId);
      const response = createAPIResponse<null>(200, "Curriculum record deleted successfully", null);
      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }
}

const CurriculumController = new curriculumController();
export default CurriculumController;
