import { AppSidebar, type SysSidebarData } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useUser } from "@/features/auth/context/user.context";
import { BarChart3, Building2, FileBarChart2, SquareTerminal, UserCheck } from "lucide-react";
import { Navigate, Outlet, useLocation } from "react-router";
import { PERMISSIONS, ROLE_PERMISSION_MATRIX, type Permission } from "backend/types/seeder.type";

const NAV_PERMISSIONS: Record<string, Permission[]> = {
  Overview: [],
  "Evaluate Faculty": [PERMISSIONS.EVALUATION_SUBMIT_SEF],
  "Evaluation Reports": [
    PERMISSIONS.EVALUATION_REPORT_VIEW_ALL,
    PERMISSIONS.EVALUATION_REPORT_VIEW_SELF,
  ],
  "Evaluation Analytics": [PERMISSIONS.EVALUATION_REPORT_VIEW_ALL],
  "Jurisdiction Coverage": [PERMISSIONS.COURSE_OFFERING_READ],
};

interface SupervisorDashboardProps {
  basePath?: string;
}

export const SupervisorDashboard = ({ basePath = "/supervisor" }: SupervisorDashboardProps) => {
  const { user } = useUser();
  const location = useLocation();

  if (!user) return <Navigate to="/auth/login" replace />;

  const userPermissions = Array.from(
    new Set((user?.roles ?? []).flatMap((role) => ROLE_PERMISSION_MATRIX[role] ?? [])),
  );

  const navMain: SysSidebarData["navMain"] = [
    { title: "Overview", url: `${basePath}/dashboard`, icon: SquareTerminal },
    { title: "Evaluate Faculty", url: `${basePath}/evaluate`, icon: UserCheck },
    { title: "Evaluation Reports", url: `${basePath}/reports`, icon: FileBarChart2 },
    { title: "Evaluation Analytics", url: `${basePath}/analytics`, icon: BarChart3 },
    { title: "Jurisdiction Coverage", url: `${basePath}/coverage`, icon: Building2 },
  ].filter((item) => {
    const required = NAV_PERMISSIONS[item.title];
    if (!required || required.length === 0) return true;
    return required.some((perm) => userPermissions.includes(perm));
  });

  const activePageName =
    navMain.find(
      (item) =>
        location.pathname === item.url ||
        location.pathname.startsWith(item.url + "/") ||
        item.items?.some((sub) => location.pathname === sub.url),
    )?.title ?? "Overview";

  const data: SysSidebarData = {
    user: {
      name: `${user.personalDetails.first_name} ${user.personalDetails.last_name}`,
      email: user.email,
      avatar: "",
    },
    navMain,
  };

  return (
    <SidebarProvider>
      <AppSidebar data={data} />
      <SidebarInset>
        <SiteHeader pageName={activePageName} />
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pt-3">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default SupervisorDashboard;
