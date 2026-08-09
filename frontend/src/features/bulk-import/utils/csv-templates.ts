import type { BulkEntity } from "backend/types/bulk-import.type";

export interface CsvTemplateGuide {
  headers: string[];
  sampleRow: string[];
  instructions: string;
}

export const CSV_TEMPLATES: Record<BulkEntity, CsvTemplateGuide> = {
  colleges: {
    headers: ["name", "initialism"],
    sampleRow: ["College of Engineering and Technology", "COET"],
    instructions: "College initialisms must be unique (e.g., COET, CAS, COT).",
  },
  programs: {
    headers: ["college_initialism", "name", "initialism"],
    sampleRow: ["COET", "Bachelor of Science in Information Technology", "BSIT"],
    instructions: "college_initialism must match an existing College initialism.",
  },
  classes: {
    headers: ["program_initialism", "year_level", "section"],
    sampleRow: ["BSIT", "I", "A"],
    instructions: "year_level must be I, II, III, IV, or V. Section must be A, B, C, D, E, or F.",
  },
  courses: {
    headers: ["program_initialism", "initialism", "name"],
    sampleRow: ["BSIT", "IT 101", "Introduction to Computing"],
    instructions: "program_initialism must match an existing Program code.",
  },
  users: {
    headers: [
      "email",
      "institutional_id",
      "first_name",
      "last_name",
      "middle_name",
      "suffix",
      "role",
    ],
    sampleRow: [
      "faculty@pit.edu.ph",
      "FAC-26-1001-001",
      "Juan",
      "Dela Cruz",
      "Santos",
      "",
      "FACULTY",
    ],
    instructions:
      "Role must be STUDENT, FACULTY, or SUPERVISOR. Admin roles (SYS_ADMIN, ADMIN) are strictly forbidden via CSV.",
  },
};

/**
 * Downloads a sample `.csv` template file directly in the browser.
 */
export const downloadCsvTemplate = (entity: BulkEntity) => {
  const spec = CSV_TEMPLATES[entity];
  if (!spec) return;

  const content = [spec.headers.join(","), spec.sampleRow.join(",")].join("\n");
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `sample_${entity}_template.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
