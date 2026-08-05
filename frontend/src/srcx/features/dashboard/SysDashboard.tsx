import { AppSidebar, type SysSidebarData } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useUser } from "@/srcx/features/auth/context/user.context";
import { Calendar, Landmark, SquareTerminal, Users } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { Navigate, Outlet, useLocation } from "react-router";

export const SysDashboard = () => {
  const { user } = useUser();
  const location = useLocation();
  if (!user) return <Navigate to="/auth/login" />;

  const navMain: SysSidebarData["navMain"] = [
    { title: "Overview", url: "/sys/dashboard", icon: SquareTerminal, isActive: true },
    { title: "Users", url: "/sys/users", icon: Users },
    { title: "Institution", url: "/sys/institution", icon: Landmark },
    { title: "Semesters", url: "/sys/semesters", icon: Calendar },
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
      <Toaster />
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
