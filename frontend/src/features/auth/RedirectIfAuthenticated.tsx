import { Navigate, Outlet } from "react-router";
import { useUser } from "./user.context";
import { getHomeRouteForRoles } from "@/lib/role-route";

export const RedirectIfAuthenticated = () => {
  const { user, isLoading } = useUser();

  if (isLoading) return <div className="grid h-screen place-items-center">Loading...</div>;
  if (user) return <Navigate to={getHomeRouteForRoles(user.roles)} replace />;

  return <Outlet />;
};
