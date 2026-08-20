import { AppSidebar, type SysSidebarData } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { CommandPalette } from "@/components/command-palette";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useUser } from "@/features/auth/context/user.context";
import { LayoutDashboard, UserCheck, FileText, BarChart3, Building2, Settings } from "lucide-react";
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

  const navMain = [
    { title: "Overview", url: `${basePath}/dashboard`, icon: LayoutDashboard },
    { title: "Evaluate Faculty", url: `${basePath}/evaluate`, icon: UserCheck },
    { title: "Evaluation Reports", url: `${basePath}/reports`, icon: FileText },
    { title: "Evaluation Analytics", url: `${basePath}/analytics`, icon: BarChart3 },
    { title: "Jurisdiction Coverage", url: `${basePath}/coverage`, icon: Building2 },
    { title: "Account Settings", url: `${basePath}/settings`, icon: Settings },
  ].filter((item) => {
    const required = NAV_PERMISSIONS[item.title];
    if (!required || required.length === 0) return true;
    return required.some((perm) => userPermissions.includes(perm));
  });

  const activePageName =
    navMain.find(
      (item) => location.pathname === item.url || location.pathname.startsWith(`${item.url}/`),
    )?.title ?? "Supervisor Portal";

  const data: SysSidebarData = {
    user: {
      name: `${user.personalDetails.first_name} ${user.personalDetails.last_name}`,
      email: user.email,
    },
    navMain,
  };

  return (
    <SidebarProvider>
      <CommandPalette />
      <AppSidebar data={data} />
      <SidebarInset>
        <SiteHeader pageName={activePageName} />
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default SupervisorDashboard;
