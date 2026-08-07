import { Route } from "react-router";
import { RequireRole } from "@/features/auth/components/RequireRole";
import SupervisorDashboard from "@/features/dashboard/SupervisorDashboard";
import SupervisorOverviewPage from "@/features/supervisor/page/SupervisorOverviewPage";
import SupervisorEvaluationPage from "@/features/supervisor/page/SupevisorEvaluationPage";
import SupervisorReportsPage from "@/features/supervisor/page/SupervisorReportsPage";
import SupervisorAnalyticsPage from "@/features/supervisor/page/SupervisorAnalyticsPage";
import SupervisorScopePage from "@/features/supervisor/page/SupervisorScopePage";
import AccountSettingsPage from "@/features/account-settings/page/AccountSettingsPage";
import EmailVerificationDialog from "@/features/auth/components/EmailVerificationDialog";

export const SupervisorRoutes = () => {
  return (
    <Route
      element={
        <>
          <RequireRole allowed={["SUPERVISOR"]} />
          <EmailVerificationDialog />
        </>
      }
    >
      <Route path="supervisor" element={<SupervisorDashboard />}>
        <Route index element={<SupervisorOverviewPage />} />
        <Route path="dashboard" element={<SupervisorOverviewPage />} />
        <Route path="evaluate" element={<SupervisorEvaluationPage />} />
        <Route path="reports" element={<SupervisorReportsPage />} />
        <Route path="reports/:id" element={<SupervisorReportsPage />} />
        <Route path="analytics" element={<SupervisorAnalyticsPage />} />
        <Route path="coverage" element={<SupervisorScopePage />} />
        <Route path="settings" element={<AccountSettingsPage />} />
      </Route>
    </Route>
  );
};
