import type { IProgramService } from "@/services/program.service.js";
import ProgramService from "@/services/program.service.js";
import { AppError } from "@/utils/error.util.js";
import { extractSearchParams } from "@/utils/request.util.js";
import { createAPIResponse } from "@/utils/response.util.js";
import { type NextFunction, type Request, type Response } from "express";
import z from "zod";

class programController {
  constructor(private programService: IProgramService = ProgramService) {}

  private async extractId(id: unknown, message: string) {
    const validation = await z.coerce
      .number(message)
      .int(message)
      .positive(message)
      .safeParseAsync(id);
    if (!validation.success) throw validation.error;

    return validation.data;
  }

  async getPrograms(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      let parsedId: number | undefined;

      if (id) parsedId = await this.extractId(id, "College ID is required.");

      const searchParams = await extractSearchParams("Programs", req);
      const result = await this.programService.getPrograms({
        ...(parsedId && { college_id: parsedId }),
        ...searchParams,
      });
      const response = createAPIResponse<typeof result>(
        200,
        "Program records retrieved successfully.",
        result,
      );

      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getProgram(req: Request, res: Response, next: NextFunction) {
    try {
      const { program_id } = req.params;
      if (!program_id) throw new AppError(400, "Program ID is required.");
      const parsedId = await this.extractId(program_id, "Program ID is required.");

      const result = await this.programService.getProgram(parsedId);
      const response = createAPIResponse<typeof result>(
        200,
        "Program record retrieved successfully.",
        result,
      );

      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }

  async searchAvailableChairCandidates(req: Request, res: Response, next: NextFunction) {
    try {
      req.query.page = "1";
      const searchParams = await extractSearchParams("Colleges", req);
      const result = await this.programService.searchAvailableChairCandidates(searchParams.search);
      const response = createAPIResponse<typeof result>(
        200,
        "Available chair candidates retrieved successfully",
        result,
      );

      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }

  async createProgramRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const { body } = req;
      if (!body) throw new AppError(400, "Request body cannot be empty.");

      const { program, chair } = body;
      if (!program) throw new AppError(400, "Program information is required.");
      const result = await this.programService.createProgramRecord({ program, chair });
      const response = createAPIResponse<typeof result>(
        201,
        "Program record was successfully created.",
      );

      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateProgramRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const { body } = req;
      if (!body) throw new AppError(400, "Request body cannot be empty.");

      const { program_id } = req.params;
      if (!program_id) throw new AppError(400, "Program ID is required.");
      const parsedId = await this.extractId(program_id, "Program ID is required.");

      const { program, chair } = body;
      const result = await this.programService.updateProgramRecord({
        program_id: parsedId,
        program,
        chair,
      });
      const response = createAPIResponse<typeof result>(
        201,
        "Program record was successfully updated.",
      );

      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }

  async deleteProgramRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const { program_id } = req.params;
      if (!program_id) throw new AppError(400, "Program ID is required.");
      const parsedId = await this.extractId(program_id, "Program ID is required.");
      const result = await this.programService.deleteProgramRecord(parsedId);
      const response = createAPIResponse<typeof result>(
        201,
        "Program record was successfully deleted.",
      );

      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }
}

const ProgramController = new programController();
export default ProgramController;
