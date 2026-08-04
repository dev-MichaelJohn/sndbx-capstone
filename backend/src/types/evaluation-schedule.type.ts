import z from "zod";
import type { InferSelectModel } from "drizzle-orm";
import {
  StudentEvaluationSchedules,
  SupervisorEvaluationSchedules,
} from "../schemas/evaluation-execution.schema.js";
import { GenerateZodSchemas } from "../utils/schema.util.js";
import { createSearchSchema } from "../utils/request.util.js";

export const StudentEvaluationScheduleSchema = GenerateZodSchemas(StudentEvaluationSchedules);
export type StudentEvaluationScheduleSelect = z.infer<
  typeof StudentEvaluationScheduleSchema.select
>;

export const SupervisorEvaluationScheduleSchema = GenerateZodSchemas(SupervisorEvaluationSchedules);
export type SupervisorEvaluationScheduleSelect = z.infer<
  typeof SupervisorEvaluationScheduleSchema.select
>;

export const StudentEvaluationScheduleSearchSchema = createSearchSchema(
  "StudentEvaluationSchedules",
);
export type StudentEvaluationScheduleSearch = z.infer<typeof StudentEvaluationScheduleSearchSchema>;

export const SupervisorEvaluationScheduleSearchSchema = createSearchSchema(
  "SupervisorEvaluationSchedules",
);
export type SupervisorEvaluationScheduleSearch = z.infer<
  typeof SupervisorEvaluationScheduleSearchSchema
>;

export const EvaluationTypeSchema = z.enum(["student", "supervisor"]);
export type EvaluationType = z.infer<typeof EvaluationTypeSchema>;

export const UpsertScheduleReqSchema = z
  .object({
    semester_id: z.number().int().positive("Valid semester ID required"),
    form_id: z.number().int().positive("Valid form ID required"),
    open_at: z.coerce.date({ message: "Valid open_at date required" }),
    close_at: z.coerce.date({ message: "Valid close_at date required" }),
  })
  .refine((data) => data.close_at > data.open_at, {
    message: "close_at must be strictly after open_at",
    path: ["close_at"],
  });

export type UpsertScheduleReq = z.infer<typeof UpsertScheduleReqSchema>;

export type ScheduleSelect =
  | InferSelectModel<typeof StudentEvaluationSchedules>
  | InferSelectModel<typeof SupervisorEvaluationSchedules>;
