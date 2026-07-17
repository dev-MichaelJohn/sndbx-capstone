import { CollegeDeans, Colleges } from "@/schemas/institution.schema.js";
import { createSearchSchema } from "@/utils/request.util.js";
import type { InferSelectModel } from "drizzle-orm";
import z from "zod";
import { AccountSchema, CreateUserReqSchema, PersonalDetailsSchema } from "./user.type.js";
import { GenerateZodSchemas } from "@/utils/schema.util.js";

export const CollegeDeanSchema = GenerateZodSchemas(CollegeDeans);
export type CollegeDeanInsert = z.infer<typeof CollegeDeanSchema.insert>;
export type CollegeDeanSelect = z.infer<typeof CollegeDeanSchema.select>;

export const CollegeSchema = GenerateZodSchemas(Colleges);
export type CollegeInsert = z.infer<typeof CollegeSchema.insert>;
export type CollegeSelect = z.infer<typeof CollegeSchema.select>;

export const CollegeSearchQuerySchema = createSearchSchema("Colleges");
export type CollegeSearchQuery = z.infer<typeof CollegeSearchQuerySchema>;

export type CollegeWithDean = InferSelectModel<typeof Colleges> & DeanCandidate;

export type CollegeWithDeanAndTotal = CollegeWithDean & {
  totalItems: number;
};

export const CreateCollegeDeanSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("existing"), id: z.coerce.number().positive() }),
  z.object({
    type: z.literal("new"),
    details: CreateUserReqSchema.omit({
      role: true,
    }),
  }),
]);
export type CreateCollegeDean = z.infer<typeof CreateCollegeDeanSchema>;

export const CreateCollegeRecord = z.object({
  college: GenerateZodSchemas(Colleges).insert,
  dean: CreateCollegeDeanSchema.optional(),
});
export type CreateCollegeRecordType = z.infer<typeof CreateCollegeRecord>;

export const UpdateCollegeRecord = z.object({
  collegeId: z.coerce.number().positive().nonoptional(),
  college: GenerateZodSchemas(Colleges).update,
  dean: CreateCollegeDeanSchema.optional(),
});
export type UpdateCollegeRecordType = z.infer<typeof UpdateCollegeRecord>;

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
  .extend(z.object({ is_college_dean: z.boolean().nonoptional() }).shape);
export type DeanCandidate = z.infer<typeof DeanCandidateSchema>;
