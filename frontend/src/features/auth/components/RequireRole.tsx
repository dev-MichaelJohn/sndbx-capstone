import { Navigate, Outlet } from "react-router";
import { useUser } from "@/features/auth/context/user.context";
import { getHomeRouteForRoles } from "@/lib/role-route";
import type { SystemRole } from "backend/types/user.type";

export const RequireRole = ({ allowed }: { allowed: SystemRole[] }) => {
  const { user, isLoading } = useUser();

  if (isLoading) return <div className="grid h-screen place-items-center">Loading...</div>;
  if (!user) return <Navigate to="/auth/login" replace />;

  const hasAccess = user.roles.some((role) => allowed.includes(role));
  if (!hasAccess) return <Navigate to={getHomeRouteForRoles(user.roles)} replace />;

  return <Outlet />;
};
