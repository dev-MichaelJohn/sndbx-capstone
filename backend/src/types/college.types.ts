import z from "zod";
import { CollegeDeans, Colleges } from "../schemas/institution.schema.js";
import { GenerateZodSchemas } from "../utils/schema.util.js";
import { createSearchSchema } from "../utils/request.util.js";
import { AccountSchema, CreateUserReqSchema, PersonalDetailsSchema } from "./user.type.js";

// ==========================================
// 1. Base Entity Schemas & Inferred Types
// ==========================================

export const CollegeDeanSchema = GenerateZodSchemas(CollegeDeans, {
  college_id: (schema) =>
    schema.int("College ID must be an integer.").positive("Invalid College ID."),

  dean_id: (schema) => schema.int("Dean ID must be an integer.").positive("Invalid Dean ID."),
});
export type CollegeDeanInsert = z.infer<typeof CollegeDeanSchema.insert>;
export type CollegeDeanSelect = z.infer<typeof CollegeDeanSchema.select>;

export const CollegeSchema = GenerateZodSchemas(Colleges, {
  name: (schema) =>
    schema
      .trim()
      .min(3, "College name must be at least 3 characters.")
      .max(255, "College name cannot exceed 255 characters."),

  initialism: (schema) =>
    schema
      .trim()
      .min(2, "Initialism must be at least 2 characters (e.g., CAS, COE).")
      .max(10, "Initialism cannot exceed 10 characters.")
      .transform((val) => val.toUpperCase()),
});
export type CollegeInsert = z.infer<typeof CollegeSchema.insert>;
export type CollegeSelect = z.infer<typeof CollegeSchema.select>;

// ==========================================
// 2. Query & Search Schemas
// ==========================================

export const CollegeSearchQuerySchema = createSearchSchema("Colleges");
export type CollegeSearchQuery = z.infer<typeof CollegeSearchQuerySchema>;

// ==========================================
// 3. Candidate & Derived Entity Schemas
// ==========================================

export const DeanCandidateSchema = z
  .object({
    account_id: AccountSchema.select.shape.id,
  })
  .extend(
    PersonalDetailsSchema.select.omit({
      id: true,
      created_at: true,
      deleted_at: true,
      updated_at: true,
    }).shape,
  )
  .extend({
    is_college_dean: z.boolean().nonoptional(),
  });
export type DeanCandidate = z.infer<typeof DeanCandidateSchema>;

// Composed View Types
export type CollegeWithDean = CollegeSelect & DeanCandidate;

export type CollegeWithDeanAndTotal = CollegeWithDean & {
  totalItems: number;
};

// ==========================================
// 4. Request DTO Schemas (Create / Update)
// ==========================================

export const CreateCollegeDeanSchema = z.discriminatedUnion("type", [
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
export type CreateCollegeDean = z.infer<typeof CreateCollegeDeanSchema>;

export const CreateCollegeRecord = z.object({
  college: CollegeSchema.insert,
  dean: CreateCollegeDeanSchema.optional(),
});
export type CreateCollegeRecordType = z.infer<typeof CreateCollegeRecord>;

export const UpdateCollegeRecord = z.object({
  collegeId: z.number().int().positive().nonoptional(),
  college: CollegeSchema.update.optional(),
  dean: CreateCollegeDeanSchema.optional(),
});
export type UpdateCollegeRecordType = z.infer<typeof UpdateCollegeRecord>;
