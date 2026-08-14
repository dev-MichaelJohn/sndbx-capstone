import z from "zod";
import { ClassStudents } from "../schemas/institution.schema.js";
import { GenerateZodSchemas } from "../utils/schema.util.js";
import { createSearchSchema } from "../utils/request.util.js";

export const ClassStudentSchema = GenerateZodSchemas(ClassStudents, {
  class_id: (schema) =>
    schema.int("Class ID must be an integer").positive("Please select a valid class."),
  student_account_id: (schema) =>
    schema.int("Student ID must be an integer").positive("Please select a valid student."),
  semester_id: (schema) =>
    schema
      .int("Semester ID must be an integer")
      .positive("Please select a valid semester.")
      .optional(),
});

export type ClassStudentSelect = z.infer<typeof ClassStudentSchema.select>;
export type ClassStudentInsert = z.infer<typeof ClassStudentSchema.insert>;

export const ClassStudentSearchSchema = createSearchSchema("ClassStudents").extend({
  class_id: z.coerce.number().int().positive().optional(),
  semester_id: z.coerce.number().int().positive().optional(),
  student_account_id: z.coerce.number().int().positive().optional(),
});

export type ClassStudentSearch = z.infer<typeof ClassStudentSearchSchema>;

export type ClassStudentWithDetails = ClassStudentSelect & {
  institutional_id: string;
  student_name: string;
  program_name: string;
  year_level: string;
  section: string;
};
