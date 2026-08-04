import z from "zod";
import { CourseOfferings } from "../schemas/institution.schema.js";
import { GenerateZodSchemas } from "../utils/schema.util.js";
import { createSearchSchema } from "../utils/request.util.js";
import { CreateUserReqSchema } from "./user.type.js";

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
  class_id: z.coerce.number().int().positive().optional(),
  semester_id: z.coerce.number().int().positive().optional(),
  faculty_id: z.coerce.number().int().positive().optional(),
});

export type CourseOfferingSearch = z.infer<typeof CourseOfferingSearchSchema>;

// Joined shape for list/detail views matching the program/chair detail pattern
export const CourseOfferingWithDetailsSchema = CourseOfferingSchema.select.extend({
  course_name: z.string(),
  course_initialism: z.string(),
  year_level: z.string(),
  semester_term: z.string(),
  account_id: z.number().nullable(),
  institutional_id: z.string().nullable(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  middle_name: z.string().nullable().optional(),
  suffix: z.string().nullable().optional(),
});

export type CourseOfferingWithDetails = z.infer<typeof CourseOfferingWithDetailsSchema>;

// Discriminated union matching CreateCollegeDeanSchema pattern
export const CreateFacultySchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("existing"),
    id: z.number().positive(),
  }),
  z.object({
    type: z.literal("new"),
    details: CreateUserReqSchema.omit({
      role: true,
    }),
  }),
]);

export type CreateFaculty = z.infer<typeof CreateFacultySchema>;

export type CreateCourseOfferingParams = {
  offering: Omit<CourseOfferingInsert, "faculty_id">;
  faculty?: CreateFaculty;
};

export type UpdateCourseOfferingParams = {
  course_offering_id: number;
  offering?: Partial<Omit<CourseOfferingUpdate, "faculty_id">>;
  faculty?: CreateFaculty;
};
