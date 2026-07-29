// types/class.type.ts
import z from "zod";
import { Classes, YearLevelEnum, SectionEnum } from "../schemas/institution.schema.js";
import { GenerateZodSchemas } from "../utils/schema.util.js";
import { createSearchSchema } from "../utils/request.util.js";

export const ClassSchema = GenerateZodSchemas(Classes, {
  program_id: (schema) =>
    schema.int("Program ID must be an integer").positive("Please select a valid program."),
});

export type ClassSelect = z.infer<typeof ClassSchema.select>;
export type ClassInsert = z.infer<typeof ClassSchema.insert>;
export type ClassUpdate = z.infer<typeof ClassSchema.update>;

export const ClassSearchSchema = createSearchSchema("Classes").extend({
  program_id: z.number().int().positive().optional(),
  year_level: z.enum(YearLevelEnum.enumValues).optional(),
  section: z.enum(SectionEnum.enumValues).optional(),
});

export type ClassSearch = z.infer<typeof ClassSearchSchema>;
