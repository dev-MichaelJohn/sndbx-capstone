import { Semesters } from "../schemas/institution.schema.js";
import { createSearchSchema } from "../utils/request.util.js";
import { GenerateZodSchemas } from "../utils/schema.util.js";
import { z } from "zod";

const SemesterSchema = GenerateZodSchemas(Semesters, {
  school_year_start: (schema) =>
    schema
      .int("School year must be a whole number.")
      .min(2000, "School year seems too far in the past.")
      .max(2100, "School year seems too far in the future."),
  start_date: () => z.iso.date("Start date must be a valid date."),
  end_date: () => z.iso.date("End date must be a valid date."),
});

export const SemesterInsertSchema = SemesterSchema.insert.refine(
  (data) => new Date(data.start_date) < new Date(data.end_date),
  {
    message: "Start date must be before end date.",
    path: ["end_date"],
  },
);

export const SemesterUpdateSchema = SemesterSchema.update.refine(
  (data) => {
    // Partial update — only enforce ordering when both dates are actually
    // present in this particular payload.
    if (!data.start_date || !data.end_date) return true;
    return new Date(data.start_date) < new Date(data.end_date);
  },
  {
    message: "Start date must be before end date.",
    path: ["end_date"],
  },
);

export type SemesterSelect = z.infer<typeof SemesterSchema.select>;
export type SemesterInsert = z.infer<typeof SemesterInsertSchema>;
export type SemesterUpdate = z.infer<typeof SemesterUpdateSchema>;

export const SemesterSearchSchema = createSearchSchema("Semesters")
  .extend({
    school_year_start_from: z.coerce
      .number()
      .int()
      .min(2000, "School year seems too far in the past.")
      .optional(),
    school_year_start_to: z.coerce
      .number()
      .int()
      .max(2100, "School year seems too far in the future.")
      .optional(),
  })
  .refine(
    (data) => {
      if (data.school_year_start_from === undefined || data.school_year_start_to === undefined) {
        return true;
      }
      return data.school_year_start_from <= data.school_year_start_to;
    },
    {
      message: "'From' year must be before or equal to 'To' year.",
      path: ["school_year_start_to"],
    },
  );

export type SemesterSearch = z.infer<typeof SemesterSearchSchema>;
