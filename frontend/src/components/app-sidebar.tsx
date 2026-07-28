"use client";

import * as React from "react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavHeader } from "./nav-header";
import type { LucideIcon } from "lucide-react";

export type SidebarNavSubItem = {
  title: string;
  url: string;
};

export type SidebarNavItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: SidebarNavSubItem[];
};

export type SidebarUser = {
  name: string;
  email: string;
  avatar: string;
};

export type SysSidebarData = {
  user: SidebarUser;
  navMain: SidebarNavItem[];
};

type SysSidebarProps = React.ComponentProps<typeof Sidebar> & {
  data: SysSidebarData;
};

export function AppSidebar({ data, ...props }: SysSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavHeader />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
