import z from "zod";
import type { InferSelectModel } from "drizzle-orm";
import {
  StudentEvaluationForms,
  SupervisorEvaluationForms,
  StudentEvaluationCategories,
  SupervisorEvaluationCategories,
  StudentEvaluationQuestions,
  SupervisorEvaluationQuestions,
  SupervisorEvaluationMeans,
} from "../schemas/evaluation-form.schema.js";
import { GenerateZodSchemas } from "../utils/schema.util.js";
import { createSearchSchema } from "../utils/request.util.js";

export const StudentEvaluationFormSchema = GenerateZodSchemas(StudentEvaluationForms);
export type StudentEvaluationFormSelect = z.infer<typeof StudentEvaluationFormSchema.select>;

export const SupervisorEvaluationFormSchema = GenerateZodSchemas(SupervisorEvaluationForms);
export type SupervisorEvaluationFormSelect = z.infer<typeof SupervisorEvaluationFormSchema.select>;

export const StudentEvaluationFormSearchSchema = createSearchSchema("StudentEvaluationForms");
export type StudentEvaluationFormSearch = z.infer<typeof StudentEvaluationFormSearchSchema>;

export const SupervisorEvaluationFormSearchSchema = createSearchSchema("SupervisorEvaluationForms");
export type SupervisorEvaluationFormSearch = z.infer<typeof SupervisorEvaluationFormSearchSchema>;

export const EvaluationTypeSchema = z.enum(["student", "supervisor"]);
export type EvaluationType = z.infer<typeof EvaluationTypeSchema>;

export const UpsertCategoryReqSchema = z.object({
  name: z.string().min(1, "Category name required"),
  description: z.string().optional(),
  order: z.number().int().nonnegative(),
});
export type UpsertCategoryReq = z.infer<typeof UpsertCategoryReqSchema>;

export const UpsertQuestionReqSchema = z.object({
  question: z.string().min(1, "Question required"),
  max_rating: z.number().int().positive().default(5),
  order: z.number().int().nonnegative(),
});
export type UpsertQuestionReq = z.infer<typeof UpsertQuestionReqSchema>;

export const UpsertMeanReqSchema = z.object({
  descriptor: z.string().min(1, "Descriptor required"),
});
export type UpsertMeanReq = z.infer<typeof UpsertMeanReqSchema>;

export const CreateFormReqSchema = z.object({
  title: z.string().min(1, "Title required"),
  description: z.string().optional(),
});
export type CreateFormReq = z.infer<typeof CreateFormReqSchema>;

export type FormSelect = StudentEvaluationFormSelect | SupervisorEvaluationFormSelect;
export type CategorySelect =
  | InferSelectModel<typeof StudentEvaluationCategories>
  | InferSelectModel<typeof SupervisorEvaluationCategories>;
export type QuestionSelect =
  | InferSelectModel<typeof StudentEvaluationQuestions>
  | InferSelectModel<typeof SupervisorEvaluationQuestions>;
export type MeanSelect = InferSelectModel<typeof SupervisorEvaluationMeans>;

export type EvaluationCategoryNode = CategorySelect & {
  questions: QuestionSelect[];
};

export type EvaluationFormTree = FormSelect & {
  categories: EvaluationCategoryNode[];
};

export type FormTreeJoinRow = FormSelect & {
  category_id: number | null;
  category_parent_id: number | null;
  category_name: string | null;
  category_description: string | null;
  category_order: number | null;
  category_version: number | null;
  category_created_at: Date | null;
  category_updated_at: Date | null;
  category_deleted_at: Date | null;
  question_id: number | null;
  question_parent_id: number | null;
  question_text: string | null;
  max_rating: number | null;
  question_order: number | null;
  question_version: number | null;
  question_created_at: Date | null;
  question_updated_at: Date | null;
  question_deleted_at: Date | null;
};
