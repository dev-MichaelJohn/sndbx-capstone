import z from "zod";
import { StudentClasses } from "../schemas/institution.schema.js";
import { GenerateZodSchemas } from "../utils/schema.util.js";
import { createSearchSchema } from "../utils/request.util.js";

export const StudentClassSchema = GenerateZodSchemas(StudentClasses, {
  student_account_id: (schema) =>
    schema.int("Student ID must be an integer").positive("Please select a valid student."),
  course_offering_id: (schema) =>
    schema
      .int("Course offering ID must be an integer")
      .positive("Please select a valid course offering."),
});

export type StudentClassSelect = z.infer<typeof StudentClassSchema.select>;
export type StudentClassInsert = z.infer<typeof StudentClassSchema.insert>;

export const StudentClassSearchSchema = createSearchSchema("StudentClasses").extend({
  student_account_id: z.coerce.number().int().positive().optional(),
  course_offering_id: z.coerce.number().int().positive().optional(),
});

export type StudentClassSearch = z.infer<typeof StudentClassSearchSchema>;
