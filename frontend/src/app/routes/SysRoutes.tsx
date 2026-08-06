import { Navigate, Route } from "react-router";
import { SysDashboard } from "@/features/dashboard/SysDashboard";
import { RequireRole } from "@/features/auth/components/RequireRole";
import UsersPage from "@/features/user/page/UsersPage";
import SemesterPage from "@/features/semester/page/SemestersPage";
import { InstitutionRoutes } from "./InstitutionRoutes";
import type { SystemRole } from "backend/types/user.type";
import { EvaluationRoutes } from "./EvaluationRoutes";
import EmailVerificationDialog from "@/features/auth/components/EmailVerificationDialog";
import AccountSettingsPage from "@/features/account-settings/page/AccountSettingsPage";
import SystemAdminOverviewPage from "@/features/overview/page/SystemAdminOverviewPage";

interface SysRoutesProps {
  basePath?: string;
  allowedRoles?: SystemRole[];
}

export const SysRoutes = ({
  basePath = "sys",
  allowedRoles = ["SYS_ADMIN"],
}: SysRoutesProps = {}) => {
  return (
    <Route element={<RequireRole allowed={allowedRoles} />}>
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
        <Route path="dashboard" element={<SystemAdminOverviewPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="semesters" element={<SemesterPage />} />
        <Route path="settings" element={<AccountSettingsPage />} />

        {InstitutionRoutes()}
        {EvaluationRoutes()}
      </Route>
    </Route>
  );
};
