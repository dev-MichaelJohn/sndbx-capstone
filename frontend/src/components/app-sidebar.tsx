import React from "react";
import { Link, useLocation } from "react-router";
import type { LucideIcon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";
import { useUser } from "@/features/auth/context/user.context";
import { cn } from "@/lib/utils";

export interface SidebarNavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  badge?: string | number;
}

export interface SysSidebarData {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  navMain: SidebarNavItem[];
}

export const AppSidebar: React.FC<{ data: SysSidebarData }> = ({ data }) => {
  const location = useLocation();
  const { logout } = useUser();

  const initials =
    data.user.name
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <Sidebar collapsible="icon" className="border-r border-border/60 bg-sidebar">
      {/* Brand Header */}
      <SidebarHeader className="border-b border-border/40 p-3 group-data-[collapsible=icon]:p-2">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold font-mono text-xs shadow-xs ring-1 ring-primary/20">
            PIT
          </div>
          <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="font-bold text-xs tracking-tight text-foreground leading-tight truncate">
              Palompon Institute of Technology
            </span>
            <span className="font-mono text-[10px] font-semibold text-primary uppercase tracking-wider">
              Faculty Evaluation System
            </span>
          </div>
        </div>
      </SidebarHeader>

      {/* Main Navigation */}
      <SidebarContent className="p-2 group-data-[collapsible=icon]:p-1.5 space-y-4">
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 group-data-[collapsible=icon]:hidden">
            Navigation Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {data.navMain.map((item) => {
                const IconComponent = item.icon;
                const isActive =
                  location.pathname === item.url || location.pathname.startsWith(`${item.url}/`);

                return (
                  <SidebarMenuItem key={item.title} className="flex justify-center">
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={cn(
                        "h-9 rounded-xl px-2.5 transition-[color,background-color,box-shadow,transform] duration-150 active:scale-[0.96]",
                        // Collapsed Mode adjustments: perfectly centered square
                        "group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-xs hover:bg-primary hover:text-primary-foreground font-bold"
                          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                      )}
                    >
                      <Link
                        to={item.url}
                        className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center"
                      >
                        <IconComponent className="size-4 shrink-0" />
                        <span className="truncate group-data-[collapsible=icon]:hidden">
                          {item.title}
                        </span>
                        {item.badge !== undefined && (
                          <span
                            className={cn(
                              "ml-auto font-mono text-[10px] rounded-full px-2 py-0.5 group-data-[collapsible=icon]:hidden",
                              isActive
                                ? "bg-primary-foreground/20 text-primary-foreground font-bold"
                                : "bg-muted text-muted-foreground",
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User Footer Profile & Quick Logout */}
      <SidebarFooter className="border-t border-border/40 p-2.5 group-data-[collapsible=icon]:p-1.5">
        <div className="flex items-center justify-between gap-2 rounded-xl border border-border/50 bg-card p-2 shadow-2xs group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:border-none group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:justify-center">
          <div className="flex items-center gap-2.5 min-w-0 group-data-[collapsible=icon]:hidden">
            <Avatar className="size-7.5 rounded-lg border border-border/60 shrink-0">
              <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-foreground leading-tight">
                {data.user.name}
              </p>
              <p className="truncate text-[10px] text-muted-foreground font-mono">
                {data.user.email}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => logout()}
            className="flex size-7.5 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 transition-colors active:scale-[0.96] cursor-pointer group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:hover:bg-muted"
            title="Log out"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
};
