import type { SystemRole } from "backend/types/user.type";

// most-privileged first — this order decides the tie-break
// when a user carries more than one role
const ROLE_PRIORITY: SystemRole[] = ["SYS_ADMIN", "ADMIN", "SUPERVISOR", "FACULTY", "STUDENT"];

const ROLE_HOME_ROUTES: Record<SystemRole, string> = {
  SYS_ADMIN: "/sys/dashboard",
  ADMIN: "/admin/dashboard",
  SUPERVISOR: "/supervisor/dashboard",
  FACULTY: "/faculty/dashboard",
  STUDENT: "/student/dashboard",
};

export function getHomeRouteForRoles(roles: SystemRole[]): string {
  const highestRole = ROLE_PRIORITY.find((role) => roles.includes(role));
  return highestRole ? ROLE_HOME_ROUTES[highestRole] : "/";
}
