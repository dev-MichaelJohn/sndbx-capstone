import z from "zod";
import type { InferSelectModel } from "drizzle-orm";
import {
  IndividualFacultyEvaluationReports,
  IferClassSummaries,
} from "@/schemas/evaluation-report.schema.js";

export const IferStatusSchema = z.enum(["DRAFT", "FINALIZED", "ACKNOWLEDGED"]);
export type IferStatus = z.infer<typeof IferStatusSchema>;

export const ScaleModeSchema = z.enum(["GPA_5", "PERCENTAGE_100"]);
export type ScaleMode = z.infer<typeof ScaleModeSchema>;

/** CHED CMO 19 Series 2025 Batch Generation Request Schema */
export const GenerateBatchIferReqSchema = z.object({
  semester_id: z.number().int().positive("Valid semester_id required."),
  min_rating: z.number().int().min(0).default(1),
  max_rating: z.number().int().min(1).default(5),
  scale_mode: ScaleModeSchema.default("PERCENTAGE_100"),
  set_weight: z.number().min(0).max(1).optional(),
  sef_weight: z.number().min(0).max(1).optional(),
});

export type GenerateBatchIferReq = z.infer<typeof GenerateBatchIferReqSchema>;

export const UpdateDevelopmentPlanReqSchema = z.object({
  areas_for_improvement: z.string().min(1, "Areas for improvement required."),
  proposed_activities: z.string().min(1, "Proposed learning activities required."),
  action_plan: z.string().min(1, "Action plan required."),
});
export type UpdateDevelopmentPlanReq = z.infer<typeof UpdateDevelopmentPlanReqSchema>;

export const UpdateIferStatusReqSchema = z.object({
  status: IferStatusSchema,
});
export type UpdateIferStatusReq = z.infer<typeof UpdateIferStatusReqSchema>;

export type IferSelect = InferSelectModel<typeof IndividualFacultyEvaluationReports>;
export type IferClassSummarySelect = InferSelectModel<typeof IferClassSummaries>;

export interface UnifiedFacultyReportDetail {
  report: IferSelect;
  faculty: {
    id: number;
    name: string;
    department: string;
    rank?: string;
  };
  semester: {
    id: number;
    academic_year: string;
    term: string;
  };
  class_summaries: Array<
    IferClassSummarySelect & {
      course_code: string;
      course_title: string;
      section: string;
    }
  >;
  combined_weighted_rating: number | null;
  student_comments: string[];
  supervisor_comments: string[];
}
