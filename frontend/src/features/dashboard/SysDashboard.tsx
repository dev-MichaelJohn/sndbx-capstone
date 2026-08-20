import { AppSidebar, type SysSidebarData } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { CommandPalette } from "@/components/command-palette";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useUser } from "@/features/auth/context/user.context";
import {
  LayoutDashboard,
  Users,
  Building2,
  Calendar,
  ClipboardList,
  CalendarClock,
  FileText,
  BarChart3,
  Terminal,
  Settings,
} from "lucide-react";
import { Navigate, Outlet, useLocation } from "react-router";
import { PERMISSIONS, ROLE_PERMISSION_MATRIX, type Permission } from "backend/types/seeder.type";

const NAV_PERMISSIONS: Record<string, Permission[]> = {
  Overview: [],
  Users: [PERMISSIONS.ACCOUNT_READ],
  Institution: [PERMISSIONS.COLLEGE_READ, PERMISSIONS.PROGRAM_READ],
  Semesters: [PERMISSIONS.SEMESTER_READ],
  "Evaluation Forms": [PERMISSIONS.EVALUATION_FORM_MANAGE],
  "Evaluation Schedules": [PERMISSIONS.EVALUATION_PERIOD_MANAGE],
  "Evaluation Reports": [
    PERMISSIONS.EVALUATION_REPORT_VIEW_ALL,
    PERMISSIONS.EVALUATION_REPORT_VIEW_SELF,
  ],
  "Evaluation Analytics": [PERMISSIONS.EVALUATION_REPORT_VIEW_ALL],
  "System Logs": [PERMISSIONS.SYSTEM_LOG_READ],
};

interface SysDashboardProps {
  basePath?: string;
}

export const SysDashboard = ({ basePath = "/sys" }: SysDashboardProps) => {
  const { user } = useUser();
  const location = useLocation();

  if (!user) return <Navigate to="/auth/login" replace />;

  const userPermissions = Array.from(
    new Set((user?.roles ?? []).flatMap((role) => ROLE_PERMISSION_MATRIX[role] ?? [])),
  );

  const navMain = [
    { title: "Overview", url: `${basePath}/dashboard`, icon: LayoutDashboard },
    { title: "Users", url: `${basePath}/users`, icon: Users },
    { title: "Institution", url: `${basePath}/institution`, icon: Building2 },
    { title: "Semesters", url: `${basePath}/semesters`, icon: Calendar },
    { title: "Evaluation Forms", url: `${basePath}/evaluation/forms`, icon: ClipboardList },
    { title: "Evaluation Schedules", url: `${basePath}/evaluation/schedules`, icon: CalendarClock },
    { title: "Evaluation Reports", url: `${basePath}/evaluation/reports`, icon: FileText },
    { title: "Evaluation Analytics", url: `${basePath}/evaluation/analytics`, icon: BarChart3 },
    { title: "System Logs", url: `${basePath}/logs`, icon: Terminal },
    { title: "Account Settings", url: `${basePath}/settings`, icon: Settings },
  ].filter((item) => {
    const required = NAV_PERMISSIONS[item.title];
    if (!required || required.length === 0) return true;
    return required.some((perm) => userPermissions.includes(perm));
  });

  const activePageName =
    navMain.find(
      (item) => location.pathname === item.url || location.pathname.startsWith(`${item.url}/`),
    )?.title ?? "System Administration";

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

export default SysDashboard;
