import type { IEvaluationFormService } from "@/services/evaluation-form.service.js";
import EvaluationFormService from "@/services/evaluation-form.service.js";
import { EvaluationTypeSchema, type EvaluationType } from "@/types/evaluation-form.type.js";
import { createAPIResponse } from "@/utils/response.util.js";
import type { NextFunction, Request, Response } from "express";
import z from "zod";

export interface IEvaluationFormController {
  getForms(req: Request, res: Response, next: NextFunction): Promise<void>;
  createForm(req: Request, res: Response, next: NextFunction): Promise<void>;
  getFormTree(req: Request, res: Response, next: NextFunction): Promise<void>;
  getCategories(req: Request, res: Response, next: NextFunction): Promise<void>;
  addCategory(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateCategory(req: Request, res: Response, next: NextFunction): Promise<void>;
  deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void>;
  getQuestions(req: Request, res: Response, next: NextFunction): Promise<void>;
  addQuestion(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateQuestion(req: Request, res: Response, next: NextFunction): Promise<void>;
  deleteQuestion(req: Request, res: Response, next: NextFunction): Promise<void>;
  getMeans(req: Request, res: Response, next: NextFunction): Promise<void>;
  addMean(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateMean(req: Request, res: Response, next: NextFunction): Promise<void>;
  deleteMean(req: Request, res: Response, next: NextFunction): Promise<void>;
}

export class evaluationFormController implements IEvaluationFormController {
  constructor(private evaluationFormService: IEvaluationFormService = EvaluationFormService) {}

  private async extractId(id: unknown, message: string): Promise<number> {
    const validation = await z.coerce.number().int().positive(message).safeParseAsync(id);
    if (!validation.success) throw validation.error;
    return validation.data;
  }

  private async extractType(type: unknown): Promise<EvaluationType> {
    const validation = await EvaluationTypeSchema.safeParseAsync(type);
    if (!validation.success) throw validation.error;
    return validation.data;
  }

  async getForms(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const type = await this.extractType(req.params.type);
      const result = await this.evaluationFormService.getForms(type);
      res.status(200).json(createAPIResponse(200, "Evaluation forms retrieved.", result));
    } catch (error) {
      next(error);
    }
  }

  async createForm(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const type = await this.extractType(req.params.type);
      const result = await this.evaluationFormService.createForm(type, req.body);
      res.status(201).json(createAPIResponse(201, "Form created.", result));
    } catch (error) {
      next(error);
    }
  }

  async getFormTree(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const type = await this.extractType(req.params.type);
      const formId = await this.extractId(req.params.formId, "Valid Form ID required.");
      const result = await this.evaluationFormService.getFormTree(formId, type);
      res.status(200).json(createAPIResponse(200, "Form tree retrieved.", result));
    } catch (error) {
      next(error);
    }
  }

  async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const type = await this.extractType(req.params.type);
      const formId = await this.extractId(req.params.formId, "Valid Form ID required.");
      const result = await this.evaluationFormService.getCategories(type, formId);
      res.status(200).json(createAPIResponse(200, "Categories retrieved.", result));
    } catch (error) {
      next(error);
    }
  }

  async addCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const type = await this.extractType(req.params.type);
      const formId = await this.extractId(req.params.formId, "Valid Form ID required.");
      const result = await this.evaluationFormService.addCategory(type, formId, req.body);
      res.status(201).json(createAPIResponse(201, "Category created.", result));
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const type = await this.extractType(req.params.type);
      const catId = await this.extractId(req.params.categoryId, "Valid Category ID required.");
      const result = await this.evaluationFormService.updateCategory(type, catId, req.body);
      res.status(200).json(createAPIResponse(200, "Category updated.", result));
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const type = await this.extractType(req.params.type);
      const catId = await this.extractId(req.params.categoryId, "Valid Category ID required.");
      await this.evaluationFormService.deleteCategory(type, catId);
      res.status(200).json(createAPIResponse<null>(200, "Category deleted.", null));
    } catch (error) {
      next(error);
    }
  }

  async getQuestions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const type = await this.extractType(req.params.type);
      const catId = await this.extractId(req.params.categoryId, "Valid Category ID required.");
      const result = await this.evaluationFormService.getQuestions(type, catId);
      res.status(200).json(createAPIResponse(200, "Questions retrieved.", result));
    } catch (error) {
      next(error);
    }
  }

  async addQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const type = await this.extractType(req.params.type);
      const catId = await this.extractId(req.params.categoryId, "Valid Category ID required.");
      const result = await this.evaluationFormService.addQuestion(type, catId, req.body);
      res.status(201).json(createAPIResponse(201, "Question created.", result));
    } catch (error) {
      next(error);
    }
  }

  async updateQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const type = await this.extractType(req.params.type);
      const qId = await this.extractId(req.params.questionId, "Valid Question ID required.");
      const result = await this.evaluationFormService.updateQuestion(type, qId, req.body);
      res.status(200).json(createAPIResponse(200, "Question updated.", result));
    } catch (error) {
      next(error);
    }
  }

  async deleteQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const type = await this.extractType(req.params.type);
      const qId = await this.extractId(req.params.questionId, "Valid Question ID required.");
      await this.evaluationFormService.deleteQuestion(type, qId);
      res.status(200).json(createAPIResponse<null>(200, "Question deleted.", null));
    } catch (error) {
      next(error);
    }
  }

  async getMeans(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const qId = await this.extractId(req.params.questionId, "Valid Question ID required.");
      const result = await this.evaluationFormService.getSupervisorMeans(qId);
      res.status(200).json(createAPIResponse(200, "Means retrieved.", result));
    } catch (error) {
      next(error);
    }
  }

  async addMean(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const qId = await this.extractId(req.params.questionId, "Valid Question ID required.");
      const result = await this.evaluationFormService.addSupervisorMean(qId, req.body);
      res.status(201).json(createAPIResponse(201, "Mean created.", result));
    } catch (error) {
      next(error);
    }
  }

  async updateMean(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const meanId = await this.extractId(req.params.meanId, "Valid Mean ID required.");
      const result = await this.evaluationFormService.updateSupervisorMean(meanId, req.body);
      res.status(200).json(createAPIResponse(200, "Mean updated.", result));
    } catch (error) {
      next(error);
    }
  }

  async deleteMean(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const meanId = await this.extractId(req.params.meanId, "Valid Mean ID required.");
      await this.evaluationFormService.deleteSupervisorMean(meanId);
      res.status(200).json(createAPIResponse<null>(200, "Mean deleted.", null));
    } catch (error) {
      next(error);
    }
  }
}

const EvaluationFormController = new evaluationFormController();
export default EvaluationFormController;
