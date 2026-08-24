import { Navigate, type RouteObject } from "react-router";
import { RequireRole } from "@/features/auth/components/RequireRole";
import { SysDashboard } from "@/features/dashboard/SysDashboard";
import SystemAdminOverviewPage from "@/features/overview/page/SystemAdminOverviewPage";
import AdminOverviewPage from "@/features/overview/page/AdminOverviewPage";
import UsersPage from "@/features/user/page/UsersPage";
import SemesterPage from "@/features/semester/page/SemestersPage";
import SystemLogsPage from "@/features/logging/page/SystemLogsPage";
import AccountSettingsPage from "@/features/account-settings/page/AccountSettingsPage";
import { InstitutionRoutes } from "./InstitutionRoutes";
import { EvaluationRoutes } from "./EvaluationRoutes";

export const SysAdminRoutes: RouteObject = {
  path: "/sys",
  element: <RequireRole allowed={["SYS_ADMIN"]} />,
  children: [
    {
      element: <SysDashboard basePath="/sys" />,
      children: [
        { index: true, element: <Navigate to="dashboard" replace /> },
        { path: "dashboard", element: <SystemAdminOverviewPage /> },
        { path: "users", element: <UsersPage /> },
        { path: "semesters", element: <SemesterPage /> },
        InstitutionRoutes,
        EvaluationRoutes,
        { path: "logs", element: <SystemLogsPage /> },
        { path: "settings", element: <AccountSettingsPage /> },
        { path: "*", element: <Navigate to="/sys/dashboard" replace /> },
      ],
    },
  ],
};

export const AdminRoutes: RouteObject = {
  path: "/admin",
  element: <RequireRole allowed={["ADMIN"]} />,
  children: [
    {
      element: <SysDashboard basePath="/admin" />,
      children: [
        { index: true, element: <Navigate to="dashboard" replace /> },
        { path: "dashboard", element: <AdminOverviewPage /> },
        { path: "users", element: <UsersPage /> },
        { path: "semesters", element: <SemesterPage /> },
        InstitutionRoutes,
        EvaluationRoutes,
        { path: "settings", element: <AccountSettingsPage /> },
        { path: "*", element: <Navigate to="/admin/dashboard" replace /> },
      ],
    },
  ],
};
