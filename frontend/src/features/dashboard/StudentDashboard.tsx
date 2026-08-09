import { AppSidebar, type SysSidebarData } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useUser } from "@/features/auth/context/user.context";
import { BookOpen, Settings, SquareTerminal, UserCheck } from "lucide-react";
import { Navigate, Outlet, useLocation } from "react-router";

interface StudentDashboardProps {
  basePath?: string;
}

/**
 * Shell layout for the Student Portal containing sidebar navigation,
 * page header, and outlet route renderer.
 */
export const StudentDashboard = ({ basePath = "/student" }: StudentDashboardProps) => {
  const { user } = useUser();
  const location = useLocation();

  if (!user) return <Navigate to="/auth/login" replace />;

  const navMain: SysSidebarData["navMain"] = [
    { title: "Overview", url: `${basePath}/dashboard`, icon: SquareTerminal },
    { title: "Evaluate Teachers", url: `${basePath}/evaluate`, icon: UserCheck },
    { title: "Enrolled Classes", url: `${basePath}/classes`, icon: BookOpen },
    { title: "Account Settings", url: `${basePath}/settings`, icon: Settings },
  ];

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

export default StudentDashboard;
