import z from "zod";
import { SystemRoles } from "../schemas/auth.schema.js";
import { YearLevelEnum, SectionEnum } from "../schemas/institution.schema.js";

export const BulkEntitySchema = z.enum(["colleges", "programs", "classes", "courses", "users"]);
export type BulkEntity = z.infer<typeof BulkEntitySchema>;

/** College CSV Row Schema */
export const CollegeCsvRowSchema = z.object({
  name: z.string().trim().min(3, "College name min 3 chars."),
  initialism: z.string().trim().min(2).max(10).toUpperCase(),
});

/** Program CSV Row Schema */
export const ProgramCsvRowSchema = z
  .object({
    college_id: z.coerce.number().int().positive().optional(),
    college_initialism: z.string().trim().min(2).optional(),
    name: z.string().trim().min(3, "Program name required."),
    initialism: z.string().trim().min(2).max(10).toUpperCase(),
  })
  .refine((data) => Boolean(data.college_id || data.college_initialism?.trim()), {
    message: "Either college_id or college_initialism must be provided.",
    path: ["college_initialism"],
  });

/** Class CSV Row Schema */
export const ClassCsvRowSchema = z
  .object({
    program_id: z.coerce.number().int().positive().optional(),
    program_initialism: z.string().trim().min(2).optional(),
    year_level: z.enum(YearLevelEnum.enumValues, {
      message: "Valid year_level (I, II, III, IV, V) required.",
    }),
    section: z.enum(SectionEnum.enumValues, {
      message: "Valid section (A, B, C, D, E, F) required.",
    }),
  })
  .refine((data) => Boolean(data.program_id || data.program_initialism?.trim()), {
    message: "Either program_id or program_initialism must be provided.",
    path: ["program_initialism"],
  });

/** Course CSV Row Schema */
export const CourseCsvRowSchema = z
  .object({
    program_id: z.coerce.number().int().positive().optional(),
    program_initialism: z.string().trim().min(2).optional(),
    initialism: z.string().trim().min(2).toUpperCase(),
    name: z.string().trim().min(3, "Course name required."),
  })
  .refine((data) => Boolean(data.program_id || data.program_initialism?.trim()), {
    message: "Either program_id or program_initialism must be provided.",
    path: ["program_initialism"],
  });

/** User CSV Row Schema (Admin Roles Forbidden) */
export const UserCsvRowSchema = z
  .object({
    email: z.string().trim().toLowerCase().email("Valid email required."),
    institutional_id: z.string().trim().min(5, "Institutional ID required."),
    first_name: z.string().trim().min(2, "First name required."),
    last_name: z.string().trim().min(2, "Last name required."),
    middle_name: z.string().trim().optional(),
    suffix: z.string().trim().optional(),
    role: z.enum(SystemRoles.enumValues, {
      message: "Role must be STUDENT, FACULTY, or SUPERVISOR.",
    }),
  })
  .refine((row) => row.role !== "SYS_ADMIN" && row.role !== "ADMIN", {
    message: "FORBIDDEN: Administrator roles (SYS_ADMIN, ADMIN) cannot be imported via CSV.",
    path: ["role"],
  });

export type CollegeCsvRow = z.infer<typeof CollegeCsvRowSchema>;
export type ProgramCsvRow = z.infer<typeof ProgramCsvRowSchema>;
export type ClassCsvRow = z.infer<typeof ClassCsvRowSchema>;
export type CourseCsvRow = z.infer<typeof CourseCsvRowSchema>;
export type UserCsvRow = z.infer<typeof UserCsvRowSchema>;

export interface BulkImportResult {
  totalRows: number;
  successCount: number;
  failedCount: number;
  errors: Array<{ row: number; message: string }>;
}
