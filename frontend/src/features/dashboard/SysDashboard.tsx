import { AppSidebar, type SysSidebarData } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useUser } from "@/features/auth/context/user.context";
import {
  Calendar,
  CalendarClock,
  ClipboardList,
  FileBarChart2,
  Landmark,
  SquareTerminal,
  Users,
} from "lucide-react";
import { Navigate, Outlet, useLocation } from "react-router";

interface SysDashboardProps {
  basePath?: string;
}

export const SysDashboard = ({ basePath = "/sys" }: SysDashboardProps) => {
  const { user } = useUser();
  const location = useLocation();
  if (!user) return <Navigate to="/auth/login" />;

  const navMain: SysSidebarData["navMain"] = [
    { title: "Overview", url: `${basePath}/dashboard`, icon: SquareTerminal },
    { title: "Users", url: `${basePath}/users`, icon: Users },
    { title: "Institution", url: `${basePath}/institution`, icon: Landmark },
    { title: "Semesters", url: `${basePath}/semesters`, icon: Calendar },
    { title: "Evaluation Forms", url: `${basePath}/evaluation/forms`, icon: ClipboardList },
    { title: "Evaluation Schedules", url: `${basePath}/evaluation/schedules`, icon: CalendarClock },
    { title: "Evaluation Reports", url: `${basePath}/evaluation/reports`, icon: FileBarChart2 },
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
