import type { SystemRole } from "@/types/user.type.js";

export const ROLE_ID_PREFIXES: Record<SystemRole, string> = {
  SYS_ADMIN: "ADM",
  ADMIN: "ADM",
  SUPERVISOR: "FAC",
  FACULTY: "FAC",
  STUDENT: "STU",
};

/**
 * Generates an institutional ID formatted according to the account's system role.
 * Format: `PREFIX-YY-XXXX-XXX` where YY is strictly the 2-digit current year.
 * (e.g., `FAC-26-4812-009`)
 *
 * @param role - System role of the user
 * @returns Formatted institutional ID string
 */
export const generateInstitutionalId = (role: SystemRole): string => {
  const prefix = ROLE_ID_PREFIXES[role] || "STU";
  const currentYearTwoDigits = new Date().getFullYear().toString().slice(-2);
  const seq1 = Math.floor(1000 + Math.random() * 9000); // 4-digit block
  const seq2 = Math.floor(100 + Math.random() * 900); // 3-digit block

  return `${prefix}-${currentYearTwoDigits}-${seq1}-${seq2}`;
};

/**
 * Validates whether an institutional ID matches the required role prefix pattern
 * AND contains the current year's 2-digit code.
 *
 * @param id - Institutional ID string
 * @param role - Expected system role
 */
export const isValidInstitutionalIdFormat = (id: string, role: SystemRole): boolean => {
  if (!id || !id.trim()) return false;
  const prefix = ROLE_ID_PREFIXES[role] || "STU";
  const currentYearTwoDigits = new Date().getFullYear().toString().slice(-2);
  const pattern = new RegExp(`^${prefix}-${currentYearTwoDigits}-\\d{4}-\\d{3}$`, "i");
  return pattern.test(id.trim());
};
