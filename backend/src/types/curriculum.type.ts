import z from "zod";
import { CourseCurriculums } from "../schemas/institution.schema.js";
import { GenerateZodSchemas } from "../utils/schema.util.js";
import { CourseSchema } from "./course.type.js";
import { YearLevelEnum, SemeterTermEnum } from "../schemas/institution.schema.js";
import { createSearchSchema } from "@/utils/request.util.js";

export const CurriculumSchema = GenerateZodSchemas(CourseCurriculums, {
  course_id: (schema) =>
    schema.int("Course ID must be an integer").positive("Please select a valid course."),
  program_id: (schema) =>
    schema.int("Program ID must be an integer").positive("Please select a valid program."),
  year_level: (schema) =>
    schema.refine((val) => val != null && String(val).trim() !== "", {
      message: "Please select a valid year level.",
    }),
  semester_term: (schema) =>
    schema.refine((val) => val != null && String(val).trim() !== "", {
      message: "Please select a valid semester term.",
    }),
});

export type CurriculumSelect = z.infer<typeof CurriculumSchema.select>;
export type CurriculumInsert = z.infer<typeof CurriculumSchema.insert>;
export type CurriculumUpdate = z.infer<typeof CurriculumSchema.update>;

export const CurriculumWithDetailsSchema = CurriculumSchema.select
  .partial({
    program_id: true,
  })
  .extend({
    ...CourseSchema.select.pick({
      name: true,
      initialism: true,
    }).shape,
  });
export type CurriculumWithDetails = z.infer<typeof CurriculumWithDetailsSchema>;

export const CurriculumSearchSchema = createSearchSchema("CourseCurriculums").extend({
  program_id: z.number().int().positive().optional(),
  year_level: z.enum(YearLevelEnum.enumValues).optional(),
  semester_term: z.enum(SemeterTermEnum.enumValues).optional(),
});
export type CurriculumSearch = z.infer<typeof CurriculumSearchSchema>;
