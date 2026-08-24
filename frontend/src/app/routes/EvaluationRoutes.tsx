import { Navigate, type RouteObject } from "react-router";
import EvaluationFormPage from "@/features/evaluation-management/page/EvaluationFormPage";
import EvaluationFormBuilderPage from "@/features/evaluation-management/page/EvaluationFormBuilderPage";
import EvaluationSchedulePage from "@/features/evaluation-schedule/page/EvaluationSchedulePage";
import EvaluationReportPage from "@/features/evaluation-report/page/EvaluationReportPage";
import EvaluationAnalyticsPage from "@/features/analytics/page/EvaluationAnalyticsPage";
import EvaluationReportDetailPage from "@/features/evaluation-report/page/EvaluationReportDetailPage";

export const EvaluationRoutes: RouteObject = {
  path: "evaluation",
  children: [
    { index: true, element: <Navigate to="forms" replace /> },
    {
      path: "forms",
      children: [
        { index: true, element: <EvaluationFormPage /> },
        { path: ":type/:formId", element: <EvaluationFormBuilderPage /> },
      ],
    },
    { path: "schedules", element: <EvaluationSchedulePage /> },
    {
      path: "reports",
      children: [
        { index: true, element: <EvaluationReportPage /> },
        { path: ":reportId", element: <EvaluationReportDetailPage /> },
      ],
    },
    { path: "analytics", element: <EvaluationAnalyticsPage /> },
  ],
};
