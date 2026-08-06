import { Navigate, Route } from "react-router";
import { SysDashboard } from "@/features/dashboard/SysDashboard";
import { RequireRole } from "@/features/auth/components/RequireRole";
import UsersPage from "@/features/user/page/UsersPage";
import SemesterPage from "@/features/semester/page/SemestersPage";
import AccountSettingsPage from "@/features/account-settings/page/AccountSettingsPage";
import EmailVerificationDialog from "@/features/auth/components/EmailVerificationDialog";
import { InstitutionRoutes } from "./InstitutionRoutes";
import { EvaluationRoutes } from "./EvaluationRoutes";
import AdminOverviewPage from "@/features/overview/page/AdminOverviewPage";

interface AdminRoutesProps {
  basePath?: string;
}

export const AdminRoutes = ({ basePath = "admin" }: AdminRoutesProps = {}) => {
  return (
    <Route element={<RequireRole allowed={["ADMIN"]} />}>
      <Route
        path={basePath}
        element={
          <>
            <EmailVerificationDialog />
            <SysDashboard basePath={`/${basePath}`} />
          </>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminOverviewPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="semesters" element={<SemesterPage />} />
        <Route path="settings" element={<AccountSettingsPage />} />

        {InstitutionRoutes()}
        {EvaluationRoutes()}
      </Route>
    </Route>
  );
};
