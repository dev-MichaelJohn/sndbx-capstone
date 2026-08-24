import { Navigate, type RouteObject } from "react-router";
import { RequireRole } from "@/features/auth/components/RequireRole";
import FacultyDashboard from "@/features/dashboard/FacultyDashboard";
import FacultyOverviewPage from "@/features/faculty/page/FacultyOverviewPage";
import FacultyClassesPage from "@/features/faculty/page/FacultyClassesPage";
import FacultyReportsPage from "@/features/faculty/page/FacultyReportsPage";
import EvaluationReportDetailPage from "@/features/evaluation-report/page/EvaluationReportDetailPage";
import AccountSettingsPage from "@/features/account-settings/page/AccountSettingsPage";

export const FacultyRoutes: RouteObject = {
  path: "/faculty",
  element: <RequireRole allowed={["FACULTY"]} />,
  children: [
    {
      element: <FacultyDashboard basePath="/faculty" />,
      children: [
        { index: true, element: <Navigate to="dashboard" replace /> },
        { path: "dashboard", element: <FacultyOverviewPage /> },
        { path: "classes", element: <FacultyClassesPage /> },
        {
          path: "reports",
          children: [
            { index: true, element: <FacultyReportsPage /> },
            { path: ":reportId", element: <EvaluationReportDetailPage /> },
          ],
        },
        { path: "settings", element: <AccountSettingsPage /> },
        { path: "*", element: <Navigate to="/faculty/dashboard" replace /> },
      ],
    },
  ],
};
