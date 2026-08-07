import z from "zod";
import type { InferSelectModel } from "drizzle-orm";
import {
  StudentEvaluations,
  SupervisorEvaluations,
} from "../schemas/evaluation-execution.schema.js";

export const RatingItemSchema = z.object({
  question_id: z.number().int().positive("Valid question_id required"),
  rating: z.number().int().min(1, "Rating min 1"),
});

export const SubmitStudentEvalReqSchema = z
  .object({
    schedule_id: z.number().int().positive("Valid schedule_id required"),
    student_class_id: z.number().int().positive("Valid student_class_id required"),
    comment: z.string().optional(),
    is_draft: z.boolean().default(false),
    ratings: z.array(RatingItemSchema).default([]),
  })
  .refine((data) => data.is_draft || data.ratings.length > 0, {
    message: "Ratings are required for final submission.",
    path: ["ratings"],
  });

export type SubmitStudentEvalReq = z.infer<typeof SubmitStudentEvalReqSchema>;

export const SubmitSupervisorEvalReqSchema = z
  .object({
    schedule_id: z.number().int().positive("Valid schedule_id required"),
    course_offering_id: z.number().int().positive("Valid course_offering_id required"),
    comment: z.string().optional(),
    is_draft: z.boolean().default(false),
    ratings: z.array(RatingItemSchema).default([]),
  })
  .refine((data) => data.is_draft || data.ratings.length > 0, {
    message: "Ratings are required for final submission.",
    path: ["ratings"],
  });

export type SubmitSupervisorEvalReq = z.infer<typeof SubmitSupervisorEvalReqSchema>;

export type StudentEvalSelect = InferSelectModel<typeof StudentEvaluations>;
export type SupervisorEvalSelect = InferSelectModel<typeof SupervisorEvaluations>;
