import z from "zod";
import { CourseOfferings } from "../schemas/institution.schema.js";
import { GenerateZodSchemas } from "../utils/schema.util.js";
import { createSearchSchema } from "../utils/request.util.js";

export const CourseOfferingSchema = GenerateZodSchemas(CourseOfferings, {
  course_curriculum_id: (schema) =>
    schema.int("Curriculum ID must be an integer").positive("Please select a valid course."),
  class_id: (schema) =>
    schema.int("Class ID must be an integer").positive("Please select a valid class."),
  semester_id: (schema) =>
    schema.int("Semester ID must be an integer").positive("Please select a valid semester."),
  faculty_id: (schema) =>
    schema.int("Faculty ID must be an integer").positive("Please select a valid faculty member."),
});

export type CourseOfferingSelect = z.infer<typeof CourseOfferingSchema.select>;
export type CourseOfferingInsert = z.infer<typeof CourseOfferingSchema.insert>;
export type CourseOfferingUpdate = z.infer<typeof CourseOfferingSchema.update>;

export const CourseOfferingSearchSchema = createSearchSchema("CourseOfferings").extend({
  class_id: z.number().int().positive().optional(),
  semester_id: z.number().int().positive().optional(),
  faculty_id: z.number().int().positive().optional(),
});

export type CourseOfferingSearch = z.infer<typeof CourseOfferingSearchSchema>;

// Joined shape for list/detail views — course name/initialism come from
// CourseCurriculums -> Courses, plus year_level/semester_term from the
// curriculum entry itself, so the UI never needs a second round trip.
export const CourseOfferingWithDetailsSchema = CourseOfferingSchema.select.extend({
  course_name: z.string(),
  course_initialism: z.string(),
  year_level: z.string(),
  semester_term: z.string(),
});

export type CourseOfferingWithDetails = z.infer<typeof CourseOfferingWithDetailsSchema>;
