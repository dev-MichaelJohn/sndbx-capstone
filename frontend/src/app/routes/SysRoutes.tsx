import { Navigate, Route } from "react-router";
import { SysDashboard } from "@/features/dashboard/SysDashboard";
import { RequireRole } from "@/features/auth/components/RequireRole";
import UsersPage from "@/features/user/page/UsersPage";
import SemesterPage from "@/features/semester/page/SemestersPage";
import { InstitutionRoutes } from "./InstitutionRoutes";
import type { SystemRole } from "backend/types/user.type";
import { EvaluationRoutes } from "./EvaluationRoutes";

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
      <Route path={basePath} element={<SysDashboard basePath={`/${basePath}`} />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<h1>Dashboard</h1>} />
        <Route path="users" element={<UsersPage />} />
        <Route path="semesters" element={<SemesterPage />} />

        {InstitutionRoutes()}
        {EvaluationRoutes()}
      </Route>
    </Route>
  );
};
