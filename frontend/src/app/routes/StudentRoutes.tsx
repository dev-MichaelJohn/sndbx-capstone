import { Navigate, type RouteObject } from "react-router";
import { RequireRole } from "@/features/auth/components/RequireRole";
import StudentDashboard from "@/features/dashboard/StudentDashboard";
import StudentOverviewPage from "@/features/student/page/StudentOverviewPage";
import StudentEvaluationPage from "@/features/student/page/StudentEvaluationPage";
import StudentClassesPage from "@/features/student/page/StudentClassesPage";
import AccountSettingsPage from "@/features/account-settings/page/AccountSettingsPage";

export const StudentRoutes: RouteObject = {
  path: "/student",
  element: <RequireRole allowed={["STUDENT"]} />,
  children: [
    {
      element: <StudentDashboard basePath="/student" />,
      children: [
        { index: true, element: <Navigate to="dashboard" replace /> },
        { path: "dashboard", element: <StudentOverviewPage /> },
        { path: "evaluate", element: <StudentEvaluationPage /> },
        { path: "classes", element: <StudentClassesPage /> },
        { path: "settings", element: <AccountSettingsPage /> },
        { path: "*", element: <Navigate to="/student/dashboard" replace /> },
      ],
    },
  ],
};
