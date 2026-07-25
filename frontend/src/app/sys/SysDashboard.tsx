import { AppSidebar, type SysSidebarData } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useUser } from "@/features/auth/user.context";
import { Landmark, SquareTerminal, Users } from "lucide-react";
import { Navigate, Outlet } from "react-router";

export const SysDashboard = () => {
  const { user } = useUser();
  if (!user) return <Navigate to="/auth/login" />;

  const data: SysSidebarData = {
    user: {
      name: `${user.personalDetails.first_name} ${user.personalDetails.last_name}`,
      email: user.user.email,
      avatar: "",
    },
    navMain: [
      { title: "Overview", url: "/sys/dashboard", icon: SquareTerminal, isActive: true },
      { title: "Users", url: "/sys/users", icon: Users },
      {
        title: "Institution",
        url: "/sys/institution",
        icon: Landmark,
        items: [
          { title: "Colleges", url: "/sys-admin/institution/colleges" },
          { title: "Programs", url: "/sys-admin/institution/programs" },
        ],
      },
    ],
  };

  return (
    <SidebarProvider>
      <AppSidebar data={data} />
      <SidebarInset>
        <SiteHeader pageName="Overview" />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};
