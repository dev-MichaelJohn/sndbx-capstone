import CollegeService, { type ICollegeService } from "@/services/college.service.js";
import { AppError } from "@/utils/error.util.js";
import { extractSearchParams } from "@/utils/request.util.js";
import { createAPIResponse } from "@/utils/response.util.js";
import type { NextFunction, Request, Response } from "express";
import z from "zod";

class collegeController {
  constructor(private collegeService: ICollegeService = CollegeService) {}

  private async extractCollegeId(req: Request) {
    const { id } = req.params;
    if (!id) throw new AppError(400, "College ID is required.");

    const validation = await z.coerce.number().int().positive().safeParseAsync(id);
    if (!validation.success) throw validation.error;

    return validation.data;
  }

  async getColleges(req: Request, res: Response, next: NextFunction) {
    try {
      const searchParams = await extractSearchParams("Colleges", req);
      const result = await this.collegeService.getColleges(searchParams);
      const response = createAPIResponse<typeof result>(
        200,
        "College records retrieved successfully.",
        result,
      );

      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getCollege(req: Request, res: Response, next: NextFunction) {
    try {
      const id = await this.extractCollegeId(req);
      const result = await this.collegeService.getCollege(id);
      const response = createAPIResponse<typeof result>(
        200,
        "College record retrieved successfully.",
        result,
      );

      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }

  async searchAvailableDeanCandidates(req: Request, res: Response, next: NextFunction) {
    try {
      req.query.page = "1";
      const searchParams = await extractSearchParams("Colleges", req);
      const result = await this.collegeService.searchAvailableDeanCandidates(searchParams.search);
      const response = createAPIResponse<typeof result>(
        200,
        "Available dean candidates retrieved successfully",
        result,
      );

      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }

  async createCollegeRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const { body } = req;
      if (!body) throw new AppError(400, "Request body cannot be empty.");

      const { college, dean } = body;
      if (!college) throw new AppError(400, "College information is required.");
      const result = await this.collegeService.createCollegeRecord({ college, dean });
      const response = createAPIResponse<typeof result>(
        201,
        "College record was successfully created.",
      );

      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }

  async createCollegeDeanRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const { body } = req;
      if (!body) throw new AppError(400, "Request body cannot be empty.");

      const { dean } = body;
      if (!dean) throw new AppError(400, "College dean information is required.");
      const result = await this.collegeService.createCollegeDeanRecord(dean);
      const response = createAPIResponse<typeof result>(
        201,
        "College dean record was successfully created.",
      );

      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateCollegeRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const { body } = req;
      if (!body) throw new AppError(400, "Request body cannot be empty.");

      const id = await this.extractCollegeId(req);
      const { college, dean } = body;
      const result = await this.collegeService.updateCollegeRecord({
        collegeId: id,
        college,
        dean,
      });
      const response = createAPIResponse<typeof result>(
        201,
        "College record was successfully updated.",
      );

      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }

  async deleteCollegeRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const id = await this.extractCollegeId(req);
      const result = await this.collegeService.deleteCollegeRecord(id);
      const response = createAPIResponse<typeof result>(
        201,
        "College record was successfully deleted.",
      );

      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }
}

const CollegeController = new collegeController();
export default CollegeController;
