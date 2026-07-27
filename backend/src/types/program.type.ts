import { ProgramChairs, Programs } from "../schemas/institution.schema.js";
import { createSearchSchema } from "../utils/request.util.js";
import { GenerateZodSchemas } from "../utils/schema.util.js";
import z from "zod";
import { AccountSchema, CreateUserReqSchema, PersonalDetailsSchema } from "./user.type.js";

export const ProgramSchema = GenerateZodSchemas(Programs, {
  name: (schema) =>
    schema
      .trim()
      .min(3, "Program name must be at least 3 characters.")
      .max(255, "Program name cannot exceed 255 characters."),
  initialism: (schema) =>
    schema
      .trim()
      .min(2, "Initialism must be at least 2 characters (e.g., BSIT, BSEE).")
      .max(10, "Initialism cannot exceed 10 characters.")
      .transform((val) => val.toUpperCase()),
  college_id: (schema) =>
    schema.int("College ID must be an integer.").positive("Invalid College ID."),
});
export type ProgramSelect = z.infer<typeof ProgramSchema.select>;
export type ProgramInsert = z.infer<typeof ProgramSchema.insert>;
export type ProgramUpdate = z.infer<typeof ProgramSchema.update>;

export const ProgramChairSchema = GenerateZodSchemas(ProgramChairs, {
  program_id: (schema) =>
    schema.int("Program ID must be an integer.").positive("Invaild Program ID."),
  chair_id: (schema) => schema.int("Chair ID must be an integer.").positive("Invaild Chair ID."),
});
export type ProgramChairSelect = z.infer<typeof ProgramChairSchema.select>;
export type ProgramChairInsert = z.infer<typeof ProgramChairSchema.insert>;
export type ProgramChairUpdate = z.infer<typeof ProgramChairSchema.update>;

export const ChairCandidate = z
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
  );
export type ChairCandidateType = z.infer<typeof ChairCandidate>;

export type ProgramWithChairType = ProgramSelect & ChairCandidateType;
export type ProgramWithChairAndTotalType = ProgramWithChairType & {
  totalItems: number;
};

export const ProgramSearchQuery = createSearchSchema("Programs").extend({
  college_id: z.coerce.number().int().positive().optional(),
});
export type ProgramSearchQueryType = z.infer<typeof ProgramSearchQuery>;

export const CreateProgramChair = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("existing"),
    id: z.coerce.number().positive(),
  }),
  z.object({
    type: z.literal("new"),
    details: CreateUserReqSchema.omit({
      role: true,
    }),
  }),
]);
export type CreateProgramChairType = z.infer<typeof CreateProgramChair>;

export const CreateProgram = z.object({
  program: ProgramSchema.insert,
  chair: CreateProgramChair.optional(),
});
export type CreateProgramType = z.infer<typeof CreateProgram>;

export const UpdateProgram = z.object({
  program_id: z.coerce.number().int().positive().nonoptional(),
  program: ProgramSchema.insert.optional(),
  chair: CreateProgramChair.optional(),
});
export type UpdateProgramType = z.infer<typeof UpdateProgram>;
