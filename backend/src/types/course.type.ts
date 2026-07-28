import z from "zod";
import { Courses } from "../schemas/institution.schema.js";
import { GenerateZodSchemas } from "../utils/schema.util.js";
import { createSearchSchema } from "../utils/request.util.js";

export const CourseSchema = GenerateZodSchemas(Courses, {
  name: (schema) =>
    schema
      .trim()
      .min(1, "Course name is required.")
      .max(128, "Course name must be 128 characters or fewer."),
  initialism: (schema) =>
    schema
      .trim()
      .min(1, "Initialism is required.")
      .max(16, "Initialism must be 16 characters or fewer.")
      .toUpperCase(),
});

export type CourseSelect = z.infer<typeof CourseSchema.select>;
export type CourseInsert = z.infer<typeof CourseSchema.insert>;
export type CourseUpdate = z.infer<typeof CourseSchema.update>;

export const CourseSearchSchema = createSearchSchema("Courses").extend({
  program_id: z.number().int().positive().optional(),
});
export type CourseSearch = z.infer<typeof CourseSearchSchema>;
