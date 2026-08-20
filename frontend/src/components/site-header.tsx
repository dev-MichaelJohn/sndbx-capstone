import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, LogOut, User, Sparkles } from "lucide-react";
import { useUser } from "@/features/auth/context/user.context";
import { useSemesters } from "@/features/semester/api/semester.service";
import { useNavigate } from "react-router";

interface SiteHeaderProps {
  pageName: string;
}

export const SiteHeader: React.FC<SiteHeaderProps> = ({ pageName }) => {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const { data: semesterResponse } = useSemesters({
    search: undefined,
    page: 1,
    orderBy: "id",
    orderDir: "desc",
  });
  const currentSemester = semesterResponse?.data?.[0];

  const fullName = user?.personalDetails
    ? `${user.personalDetails.first_name} ${user.personalDetails.last_name}`
    : "User Account";

  const initials = user?.personalDetails
    ? `${user.personalDetails.first_name?.[0] ?? ""}${user.personalDetails.last_name?.[0] ?? ""}`
    : "U";

  const institutionalId = user?.personalDetails?.institutional_id ?? "N/A";

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl transition-[border-color,background-color] duration-150 sm:px-6">
      {/* Left: Sidebar Trigger & Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <SidebarTrigger className="size-8 rounded-lg border border-border/60 hover:bg-muted text-foreground transition-all active:scale-[0.96]" />

        <div className="h-4 w-px bg-border/60 hidden sm:block" />

        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-bold text-foreground sm:text-sm tracking-tight truncate">
            {pageName}
          </span>
        </div>
      </div>

      {/* Right: Active Term Pill, Search Button & User Profile */}
      <div className="flex items-center gap-2.5">
        {/* Active Semester Capsule */}
        {currentSemester && (
          <Badge
            variant="outline"
            className="hidden md:flex items-center gap-1.5 rounded-full border-border/70 bg-card px-3 py-1 text-[11px] font-semibold text-foreground shadow-2xs"
          >
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              A.Y. {currentSemester.school_year_start}–{currentSemester.school_year_end} (
              {currentSemester.semester_term} Sem)
            </span>
          </Badge>
        )}

        {/* Global Quick Search Shortcut Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const event = new KeyboardEvent("keydown", { key: "k", metaKey: true });
            document.dispatchEvent(event);
          }}
          className="hidden lg:flex h-8 items-center gap-2 rounded-lg border-border/60 bg-card px-2.5 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition-all active:scale-[0.96]"
        >
          <Search className="size-3.5 text-muted-foreground" />
          <span>Quick Find...</span>
          <kbd className="pointer-events-none ml-1 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground">
            ⌘K
          </kbd>
        </Button>

        {/* User Account Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl p-1 hover:bg-muted/80 transition-all active:scale-[0.96] outline-none cursor-pointer"
            >
              <Avatar className="size-8 rounded-lg border border-border/80 ring-2 ring-transparent hover:ring-primary/20 transition-all">
                <AvatarFallback className="bg-primary/10 font-bold text-xs text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-56 rounded-2xl p-1.5 shadow-xl border-border/80"
          >
            <DropdownMenuLabel className="p-2 pb-1.5">
              <p className="text-xs font-bold text-foreground truncate">{fullName}</p>
              <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
                ID: {institutionalId}
              </p>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {user?.roles?.map((role) => (
                  <Badge
                    key={role}
                    variant="outline"
                    className="font-mono text-[9px] px-1.5 py-0 bg-primary/5 text-primary border-primary/20"
                  >
                    {role.replace("_", " ")}
                  </Badge>
                ))}
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="cursor-pointer rounded-lg text-xs gap-2 py-2"
              onClick={() => navigate("settings")}
            >
              <User className="size-3.5 text-muted-foreground" />
              <span>Account Settings</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              className="cursor-pointer rounded-lg text-xs gap-2 py-2"
              onClick={() => {
                const event = new KeyboardEvent("keydown", { key: "k", metaKey: true });
                document.dispatchEvent(event);
              }}
            >
              <Sparkles className="size-3.5 text-muted-foreground" />
              <span>Command Palette</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="cursor-pointer rounded-lg text-xs gap-2 py-2 text-rose-500 focus:bg-rose-500/10 focus:text-rose-500"
              onClick={() => logout()}
            >
              <LogOut className="size-3.5" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
