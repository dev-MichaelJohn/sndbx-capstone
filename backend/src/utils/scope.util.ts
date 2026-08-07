import type { SupervisorScope } from "@/types/supervisor.type.js";
import { inArray, sql, type SQL } from "drizzle-orm";

export const buildScopeFilter = (
  scope?: SupervisorScope | null,
  tables?: { collegeTable?: any; programTable?: any },
): SQL | undefined => {
  if (!scope) return undefined;

  if (Array.isArray(scope.collegeIds) && tables?.collegeTable) {
    if (scope.collegeIds.length > 0) {
      return inArray(tables.collegeTable.id, scope.collegeIds);
    }
    return sql`1=0`;
  }

  if (Array.isArray(scope.programIds) && tables?.programTable) {
    if (scope.programIds.length > 0) {
      return inArray(tables.programTable.id, scope.programIds);
    }
    return sql`1=0`;
  }

  return undefined;
};
