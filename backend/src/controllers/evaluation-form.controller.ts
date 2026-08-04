import type { IEvaluationFormService } from "@/services/evaluation-form.service.js";
import EvaluationFormService from "@/services/evaluation-form.service.js";
import { EvaluationTypeSchema, type EvaluationType } from "@/types/evaluation-form.type.js";
import { AppError } from "@/utils/error.util.js";
import { createAPIResponse } from "@/utils/response.util.js";
import type { NextFunction, Request, Response } from "express";
import z from "zod";

class EvaluationFormControllerClass {
  constructor(private evaluationFormService: IEvaluationFormService = EvaluationFormService) {}

  /**
   * Helper utility to safely coerce and validate route parameter IDs.
   *
   * @param id - the raw route parameter ID value
   * @param message - error message if validation fails
   * @returns the validated positive integer ID
   */
  private async extractId(id: unknown, message: string): Promise<number> {
    const validation = await z.coerce.number().int().positive(message).safeParseAsync(id);
    if (!validation.success) throw validation.error;
    return validation.data;
  }

  /**
   * Helper utility to safely validate evaluation form type parameters.
   *
   * @param type - the raw evaluation type route parameter
   * @returns the validated evaluation type ("student" | "supervisor")
   */
  private async extractType(type: unknown): Promise<EvaluationType> {
    const validation = await EvaluationTypeSchema.safeParseAsync(type);
    if (!validation.success) throw validation.error;
    return validation.data;
  }

  // --- Form Controllers ---

  /**
   * Initializes a new top-level evaluation form template.
   *
   * @param req - Express request object containing type params and body payload
   * @param res - Express response object
   * @param next - Express next function for error propagation
   */
  async createForm(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const type = await this.extractType(req.params.type);
      const { body } = req;
      if (!body) throw new AppError(400, "Request body cannot be empty.");

      const result = await this.evaluationFormService.createForm(type, body);
      const response = createAPIResponse<typeof result>(
        201,
        "Evaluation form record was successfully created.",
        result,
      );
      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetches an evaluation form and its complete relational tree.
   *
   * @param req - Express request object containing type and formId params
   * @param res - Express response object
   * @param next - Express next function for error propagation
   */
  async getFormTree(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const type = await this.extractType(req.params.type);
      const parsedFormId = await this.extractId(req.params.formId, "Valid Form ID is required.");

      const result = await this.evaluationFormService.getFormTree(parsedFormId, type);
      const response = createAPIResponse<typeof result>(
        200,
        "Evaluation form tree retrieved successfully.",
        result,
      );
      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }

  // --- Category Controllers ---

  /**
   * Retrieves all categories for a specific evaluation form.
   *
   * @param req - Express request object containing type and formId params
   * @param res - Express response object
   * @param next - Express next function for error propagation
   */
  async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const type = await this.extractType(req.params.type);
      const parsedFormId = await this.extractId(req.params.formId, "Valid Form ID is required.");

      const result = await this.evaluationFormService.getCategories(type, parsedFormId);
      const response = createAPIResponse<typeof result>(
        200,
        "Categories retrieved successfully.",
        result,
      );
      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Adds a new category to an evaluation form blueprint.
   *
   * @param req - Express request object containing type, formId, and body payload
   * @param res - Express response object
   * @param next - Express next function for error propagation
   */
  async addCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const type = await this.extractType(req.params.type);
      const parsedFormId = await this.extractId(req.params.formId, "Valid Form ID is required.");
      const { body } = req;
      if (!body) throw new AppError(400, "Request body cannot be empty.");

      const result = await this.evaluationFormService.addCategory(type, parsedFormId, body);
      const response = createAPIResponse<typeof result>(
        201,
        "Category record was successfully created.",
        result,
      );
      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Updates an existing evaluation category.
   *
   * @param req - Express request object containing type, categoryId, and body payload
   * @param res - Express response object
   * @param next - Express next function for error propagation
   */
  async updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const type = await this.extractType(req.params.type);
      const parsedCatId = await this.extractId(
        req.params.categoryId,
        "Valid Category ID is required.",
      );
      const { body } = req;
      if (!body) throw new AppError(400, "Request body cannot be empty.");

      const result = await this.evaluationFormService.updateCategory(type, parsedCatId, body);
      const response = createAPIResponse<typeof result>(
        200,
        "Category record was successfully updated.",
        result,
      );
      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Soft-deletes an evaluation category.
   *
   * @param req - Express request object containing type and categoryId params
   * @param res - Express response object
   * @param next - Express next function for error propagation
   */
  async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const type = await this.extractType(req.params.type);
      const parsedCatId = await this.extractId(
        req.params.categoryId,
        "Valid Category ID is required.",
      );

      await this.evaluationFormService.deleteCategory(type, parsedCatId);
      const response = createAPIResponse<null>(
        200,
        "Category record was successfully deleted.",
        null,
      );
      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }

  // --- Question Controllers ---

  /**
   * Retrieves all questions belonging to a specific category.
   *
   * @param req - Express request object containing type and categoryId params
   * @param res - Express response object
   * @param next - Express next function for error propagation
   */
  async getQuestions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const type = await this.extractType(req.params.type);
      const parsedCatId = await this.extractId(
        req.params.categoryId,
        "Valid Category ID is required.",
      );

      const result = await this.evaluationFormService.getQuestions(type, parsedCatId);
      const response = createAPIResponse<typeof result>(
        200,
        "Questions retrieved successfully.",
        result,
      );
      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Adds a new question item to a category.
   *
   * @param req - Express request object containing type, categoryId, and body payload
   * @param res - Express response object
   * @param next - Express next function for error propagation
   */
  async addQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const type = await this.extractType(req.params.type);
      const parsedCatId = await this.extractId(
        req.params.categoryId,
        "Valid Category ID is required.",
      );
      const { body } = req;
      if (!body) throw new AppError(400, "Request body cannot be empty.");

      const result = await this.evaluationFormService.addQuestion(type, parsedCatId, body);
      const response = createAPIResponse<typeof result>(
        201,
        "Question record was successfully created.",
        result,
      );
      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Updates an existing evaluation question.
   *
   * @param req - Express request object containing type, questionId, and body payload
   * @param res - Express response object
   * @param next - Express next function for error propagation
   */
  async updateQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const type = await this.extractType(req.params.type);
      const parsedQId = await this.extractId(
        req.params.questionId,
        "Valid Question ID is required.",
      );
      const { body } = req;
      if (!body) throw new AppError(400, "Request body cannot be empty.");

      const result = await this.evaluationFormService.updateQuestion(type, parsedQId, body);
      const response = createAPIResponse<typeof result>(
        200,
        "Question record was successfully updated.",
        result,
      );
      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Soft-deletes an evaluation question.
   *
   * @param req - Express request object containing type and questionId params
   * @param res - Express response object
   * @param next - Express next function for error propagation
   */
  async deleteQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const type = await this.extractType(req.params.type);
      const parsedQId = await this.extractId(
        req.params.questionId,
        "Valid Question ID is required.",
      );

      await this.evaluationFormService.deleteQuestion(type, parsedQId);
      const response = createAPIResponse<null>(
        200,
        "Question record was successfully deleted.",
        null,
      );
      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }

  // --- Supervisor Means Controllers ---

  /**
   * Retrieves all supervisor mean descriptors for a specific question.
   *
   * @param req - Express request object containing questionId param
   * @param res - Express response object
   * @param next - Express next function for error propagation
   */
  async getMeans(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsedQId = await this.extractId(
        req.params.questionId,
        "Valid Question ID is required.",
      );

      const result = await this.evaluationFormService.getSupervisorMeans(parsedQId);
      const response = createAPIResponse<typeof result>(
        200,
        "Mean descriptors retrieved successfully.",
        result,
      );
      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Adds a new mean descriptor to a supervisor question.
   *
   * @param req - Express request object containing questionId param and body payload
   * @param res - Express response object
   * @param next - Express next function for error propagation
   */
  async addMean(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsedQId = await this.extractId(
        req.params.questionId,
        "Valid Question ID is required.",
      );
      const { body } = req;
      if (!body) throw new AppError(400, "Request body cannot be empty.");

      const result = await this.evaluationFormService.addSupervisorMean(parsedQId, body);
      const response = createAPIResponse<typeof result>(
        201,
        "Mean descriptor record was successfully created.",
        result,
      );
      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Updates an existing supervisor mean descriptor.
   *
   * @param req - Express request object containing meanId param and body payload
   * @param res - Express response object
   * @param next - Express next function for error propagation
   */
  async updateMean(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsedMeanId = await this.extractId(req.params.meanId, "Valid Mean ID is required.");
      const { body } = req;
      if (!body) throw new AppError(400, "Request body cannot be empty.");

      const result = await this.evaluationFormService.updateSupervisorMean(parsedMeanId, body);
      const response = createAPIResponse<typeof result>(
        200,
        "Mean descriptor record was successfully updated.",
        result,
      );
      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Permanently deletes a supervisor mean descriptor.
   *
   * @param req - Express request object containing meanId param
   * @param res - Express response object
   * @param next - Express next function for error propagation
   */
  async deleteMean(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsedMeanId = await this.extractId(req.params.meanId, "Valid Mean ID is required.");

      await this.evaluationFormService.deleteSupervisorMean(parsedMeanId);
      const response = createAPIResponse<null>(
        200,
        "Mean descriptor record was successfully deleted.",
        null,
      );
      res.status(response.status).json(response);
    } catch (error) {
      next(error);
    }
  }
}

const EvaluationFormController = new EvaluationFormControllerClass();
export default EvaluationFormController;
