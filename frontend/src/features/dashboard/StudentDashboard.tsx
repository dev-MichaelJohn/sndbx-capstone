import { AppSidebar, type SysSidebarData } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { CommandPalette } from "@/components/command-palette";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useUser } from "@/features/auth/context/user.context";
import { LayoutDashboard, CheckCircle2, GraduationCap, Settings } from "lucide-react";
import { Navigate, Outlet, useLocation } from "react-router";

interface StudentDashboardProps {
  basePath?: string;
}

export const StudentDashboard = ({ basePath = "/student" }: StudentDashboardProps) => {
  const { user } = useUser();
  const location = useLocation();

  if (!user) return <Navigate to="/auth/login" replace />;

  const navMain = [
    { title: "Overview", url: `${basePath}/dashboard`, icon: LayoutDashboard },
    { title: "Evaluate Teachers", url: `${basePath}/evaluate`, icon: CheckCircle2 },
    { title: "Enrolled Classes", url: `${basePath}/classes`, icon: GraduationCap },
    { title: "Account Settings", url: `${basePath}/settings`, icon: Settings },
  ];

  const activePageName =
    navMain.find(
      (item) => location.pathname === item.url || location.pathname.startsWith(`${item.url}/`),
    )?.title ?? "Student Portal";

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

export default StudentDashboard;
