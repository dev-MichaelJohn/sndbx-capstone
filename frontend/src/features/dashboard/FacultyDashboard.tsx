import { AppSidebar, type SysSidebarData } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { CommandPalette } from "@/components/command-palette";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useUser } from "@/features/auth/context/user.context";
import { LayoutDashboard, GraduationCap, FileText, Settings } from "lucide-react";
import { Navigate, Outlet, useLocation } from "react-router";

interface FacultyDashboardProps {
  basePath?: string;
}

export const FacultyDashboard = ({ basePath = "/faculty" }: FacultyDashboardProps) => {
  const { user } = useUser();
  const location = useLocation();

  if (!user) return <Navigate to="/auth/login" replace />;

  const navMain = [
    { title: "Overview", url: `${basePath}/dashboard`, icon: LayoutDashboard },
    { title: "Teaching Classes", url: `${basePath}/classes`, icon: GraduationCap },
    { title: "Evaluation Reports", url: `${basePath}/reports`, icon: FileText },
    { title: "Account Settings", url: `${basePath}/settings`, icon: Settings },
  ];

  const activePageName =
    navMain.find(
      (item) => location.pathname === item.url || location.pathname.startsWith(`${item.url}/`),
    )?.title ?? "Faculty Portal";

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

export default FacultyDashboard;
