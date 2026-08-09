import { Route, Navigate } from "react-router";
import { RequireRole } from "@/features/auth/components/RequireRole";

// Student Portal Components
import StudentDashboard from "@/features/dashboard/StudentDashboard";
import StudentOverviewPage from "@/features/student/page/StudentOverviewPage";
import StudentEvaluationPage from "@/features/student/page/StudentEvaluationPage";
import StudentClassesPage from "@/features/student/page/StudentClassesPage";
import AccountSettingsPage from "@/features/account-settings/page/AccountSettingsPage";
import EmailVerificationDialog from "@/features/auth/components/EmailVerificationDialog";

/**
 * Student Portal Route Tree protected by role-based access control.
 * Restricted exclusively to accounts possessing the 'STUDENT' system role.
 */
export const StudentRoutes = () => (
  <Route element={<RequireRole allowed={["STUDENT"]} />}>
    <Route
      path="student"
      element={
        <>
          <EmailVerificationDialog />
          <StudentDashboard />
        </>
      }
    >
      {/* Default index redirect */}
      <Route index element={<Navigate to="dashboard" replace />} />

      {/* Student Portal Navigation Views */}
      <Route path="dashboard" element={<StudentOverviewPage />} />
      <Route path="evaluate" element={<StudentEvaluationPage />} />
      <Route path="classes" element={<StudentClassesPage />} />
      <Route path="settings" element={<AccountSettingsPage />} />

      {/* Fallback wildcard redirect */}
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Route>
  </Route>
);
