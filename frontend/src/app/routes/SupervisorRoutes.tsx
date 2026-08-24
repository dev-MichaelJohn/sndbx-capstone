import { Navigate, type RouteObject } from "react-router";
import { RequireRole } from "@/features/auth/components/RequireRole";
import SupervisorDashboard from "@/features/dashboard/SupervisorDashboard";
import SupervisorOverviewPage from "@/features/supervisor/page/SupervisorOverviewPage";
import SupervisorEvaluationPage from "@/features/supervisor/page/SupevisorEvaluationPage";
import SupervisorReportsPage from "@/features/supervisor/page/SupervisorReportsPage";
import SupervisorAnalyticsPage from "@/features/supervisor/page/SupervisorAnalyticsPage";
import SupervisorScopePage from "@/features/supervisor/page/SupervisorScopePage";
import EvaluationReportDetailPage from "@/features/evaluation-report/page/EvaluationReportDetailPage";
import AccountSettingsPage from "@/features/account-settings/page/AccountSettingsPage";

export const SupervisorRoutes: RouteObject = {
  path: "/supervisor",
  element: <RequireRole allowed={["SUPERVISOR"]} />,
  children: [
    {
      element: <SupervisorDashboard basePath="/supervisor" />,
      children: [
        { index: true, element: <Navigate to="dashboard" replace /> },
        { path: "dashboard", element: <SupervisorOverviewPage /> },
        { path: "evaluate", element: <SupervisorEvaluationPage /> },
        {
          path: "reports",
          children: [
            { index: true, element: <SupervisorReportsPage /> },
            { path: ":reportId", element: <EvaluationReportDetailPage /> },
          ],
        },
        { path: "analytics", element: <SupervisorAnalyticsPage /> },
        { path: "coverage", element: <SupervisorScopePage /> },
        { path: "settings", element: <AccountSettingsPage /> },
        { path: "*", element: <Navigate to="/supervisor/dashboard" replace /> },
      ],
    },
  ],
};
