import z from "zod";
import {
  StudentEvaluationForms,
  SupervisorEvaluationForms,
} from "../schemas/evaluation-form.schema.js";
import { GenerateZodSchemas } from "../utils/schema.util.js";
import { createSearchSchema } from "../utils/request.util.js";

/**
 * Zod schema generation for Student Evaluation Forms based on the Drizzle table definition.
 */
export const StudentEvaluationFormSchema = GenerateZodSchemas(StudentEvaluationForms);

export type StudentEvaluationFormSelect = z.infer<typeof StudentEvaluationFormSchema.select>;
export type StudentEvaluationFormInsert = z.infer<typeof StudentEvaluationFormSchema.insert>;
export type StudentEvaluationFormUpdate = z.infer<typeof StudentEvaluationFormSchema.update>;

/**
 * Zod schema generation for Supervisor Evaluation Forms based on the Drizzle table definition.
 */
export const SupervisorEvaluationFormSchema = GenerateZodSchemas(SupervisorEvaluationForms);

export type SupervisorEvaluationFormSelect = z.infer<typeof SupervisorEvaluationFormSchema.select>;
export type SupervisorEvaluationFormInsert = z.infer<typeof SupervisorEvaluationFormSchema.insert>;
export type SupervisorEvaluationFormUpdate = z.infer<typeof SupervisorEvaluationFormSchema.update>;

/**
 * Generates a standard search and pagination schema for Student Evaluation Forms.
 *
 * @returns A Zod object schema containing search, page, orderBy, and orderDir parameters.
 */
export const StudentEvaluationFormSearchSchema = createSearchSchema("StudentEvaluationForms");
export type StudentEvaluationFormSearch = z.infer<typeof StudentEvaluationFormSearchSchema>;

/**
 * Generates a standard search and pagination schema for Supervisor Evaluation Forms.
 *
 * @returns A Zod object schema containing search, page, orderBy, and orderDir parameters.
 */
export const SupervisorEvaluationFormSearchSchema = createSearchSchema("SupervisorEvaluationForms");
export type SupervisorEvaluationFormSearch = z.infer<typeof SupervisorEvaluationFormSearchSchema>;

// ==========================================
// EVALUATION TYPE SCHEMAS & TYPES
// ==========================================

/**
 * Zod validation schema for evaluation form types ('student' or 'supervisor').
 */
export const EvaluationTypeSchema = z.enum(["student", "supervisor"], {
  error: "Invalid evaluation type. Must be either 'student' or 'supervisor'.",
});

export type EvaluationType = z.infer<typeof EvaluationTypeSchema>;

// ==========================================
// CATEGORY SCHEMAS & TYPES
// ==========================================

/**
 * Validation schema for creating or updating an evaluation category (Student or Supervisor).
 */
export const UpsertCategoryReqSchema = z.object({
  name: z.string().min(1, "Category name is required."),
  description: z.string().optional(),
  order: z.number().int().nonnegative("Order must be a non-negative integer."),
});

export type UpsertCategoryReq = z.infer<typeof UpsertCategoryReqSchema>;

// ==========================================
// QUESTION SCHEMAS & TYPES
// ==========================================

/**
 * Validation schema for creating or updating an evaluation question.
 */
export const UpsertQuestionReqSchema = z.object({
  question: z.string().min(1, "Question text cannot be empty."),
  max_rating: z.number().int().positive().default(5),
  order: z.number().int().nonnegative("Order must be a non-negative integer."),
});

export type UpsertQuestionReq = z.infer<typeof UpsertQuestionReqSchema>;

// ==========================================
// SUPERVISOR MEANS (DESCRIPTORS) SCHEMAS & TYPES
// ==========================================

/**
 * Validation schema for creating or updating a supervisor evaluation mean descriptor.
 */
export const UpsertMeanReqSchema = z.object({
  descriptor: z.string().min(1, "Mean descriptor is required."),
});

export type UpsertMeanReq = z.infer<typeof UpsertMeanReqSchema>;

// ==========================================
// FORM ROOT CREATION PAYLOADS
// ==========================================

/**
 * Validation schema for initializing a top-level blank evaluation form template.
 */
export const CreateFormReqSchema = z.object({
  title: z.string().min(1, "Form title is required."),
  description: z.string().optional(),
});

export type CreateFormReq = z.infer<typeof CreateFormReqSchema>;

// ==========================================
// COMPOUND & RETURN TYPES FOR FRONTEND
// ==========================================

export type FormSelect = StudentEvaluationFormSelect | SupervisorEvaluationFormSelect;

export type QuestionSelect = {
  id: number;
  category_id: number;
  question: string;
  max_rating: number;
  order: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};

export type CategorySelect = {
  id: number;
  form_id: number;
  name: string;
  description: string | null;
  order: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};

export type EvaluationCategoryNode = CategorySelect & {
  questions: QuestionSelect[];
};

export type EvaluationFormTree = FormSelect & {
  categories: EvaluationCategoryNode[];
};

export type MeanSelect = {
  id: number;
  question_id: number;
  descriptor: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};

export type FormTreeJoinRow = {
  id: number;
  title: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  category_id: number | null;
  category_name: string | null;
  category_description: string | null;
  category_order: number | null;
  category_created_at: Date | null;
  category_updated_at: Date | null;
  category_deleted_at: Date | null;
  question_id: number | null;
  question_text: string | null;
  max_rating: number | null;
  question_order: number | null;
  question_created_at: Date | null;
  question_updated_at: Date | null;
  question_deleted_at: Date | null;
};
