import { Route, Navigate } from "react-router";
import { RequireRole } from "@/features/auth/components/RequireRole";

// Faculty Portal Components
import FacultyDashboard from "@/features/dashboard/FacultyDashboard";
import FacultyOverviewPage from "@/features/faculty/page/FacultyOverviewPage";
import FacultyClassesPage from "@/features/faculty/page/FacultyClassesPage";
import FacultyReportsPage from "@/features/faculty/page/FacultyReportsPage";
import EvaluationReportDetailPage from "@/features/evaluation-report/page/EvaluationReportDetailPage";
import AccountSettingsPage from "@/features/account-settings/page/AccountSettingsPage";

/**
 * Faculty Portal Route Tree protected by role-based access control.
 * Restricted exclusively to accounts possessing the 'FACULTY' system role.
 */
export const FacultyRoutes = () => (
  <Route element={<RequireRole allowed={["FACULTY"]} />}>
    <Route path="faculty" element={<FacultyDashboard />}>
      {/* Default index redirect */}
      <Route index element={<Navigate to="dashboard" replace />} />

      {/* Faculty Portal Navigation Views */}
      <Route path="dashboard" element={<FacultyOverviewPage />} />
      <Route path="classes" element={<FacultyClassesPage />} />
      <Route path="reports" element={<FacultyReportsPage />} />
      <Route path="reports/:reportId" element={<EvaluationReportDetailPage />} />
      <Route path="settings" element={<AccountSettingsPage />} />

      {/* Wildcard redirect */}
      <Route path="*" element={<Navigate to="/faculty/dashboard" replace />} />
    </Route>
  </Route>
);
