import type { SupervisorScope } from "@/types/supervisor.type.js";
import { inArray, or, sql, type SQL } from "drizzle-orm";

/**
 * Constructs a scoped SQL filter condition for supervisor scope resolution.
 * Combines active College Deanships (`collegeIds`) and Program Chairships (`programIds`).
 */
export const buildScopeFilter = (
  scope?: SupervisorScope | null,
  tables?: { collegeTable?: any; programTable?: any },
): SQL | undefined => {
  if (!scope) return undefined;

  const conditions: SQL[] = [];

  // 1. Include College Deanship Scope
  if (Array.isArray(scope.collegeIds) && scope.collegeIds.length > 0 && tables?.collegeTable) {
    conditions.push(inArray(tables.collegeTable.id, scope.collegeIds));
  }

  // 2. Include Program Chairship Scope
  if (Array.isArray(scope.programIds) && scope.programIds.length > 0 && tables?.programTable) {
    conditions.push(inArray(tables.programTable.id, scope.programIds));
  }

  // 3. Combine scopes with OR condition
  if (conditions.length > 0) {
    return or(...conditions);
  }

  // 4. Block access if supervisor scope has no active deanships or chairships
  return sql`1=0`;
};
