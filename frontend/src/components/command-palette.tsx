import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  Users,
  Building2,
  GraduationCap,
  Calendar,
  ClipboardList,
  BarChart3,
  FileText,
  Settings,
  CheckCircle2,
  Terminal,
  ArrowRight,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useUser } from "@/features/auth/context/user.context";

interface NavCommand {
  label: string;
  description?: string;
  path: string;
  icon: any;
  category: "Operations" | "Evaluation Cycle" | "Administration" | "Account";
  roles: string[];
}

const ALL_COMMANDS: NavCommand[] = [
  // Admin & System Admin
  {
    label: "User Accounts",
    description: "Manage roles and profile access",
    path: "/sys/users",
    icon: Users,
    category: "Administration",
    roles: ["SYS_ADMIN", "ADMIN"],
  },
  {
    label: "Colleges & Degree Programs",
    description: "Department and dean assignments",
    path: "/sys/institution",
    icon: Building2,
    category: "Administration",
    roles: ["SYS_ADMIN", "ADMIN"],
  },
  {
    label: "Academic Semesters",
    description: "Terms and date boundaries",
    path: "/sys/semesters",
    icon: Calendar,
    category: "Administration",
    roles: ["SYS_ADMIN", "ADMIN"],
  },
  {
    label: "Evaluation Instruments Studio",
    description: "SET & SEF form builder",
    path: "/sys/evaluation/forms",
    icon: ClipboardList,
    category: "Evaluation Cycle",
    roles: ["SYS_ADMIN", "ADMIN"],
  },
  {
    label: "Evaluation Schedules",
    description: "Active evaluation windows",
    path: "/sys/evaluation/schedules",
    icon: Calendar,
    category: "Evaluation Cycle",
    roles: ["SYS_ADMIN", "ADMIN"],
  },
  {
    label: "Institutional Reports (IFER)",
    description: "CHED CMO 19 s2025 reports",
    path: "/sys/evaluation/reports",
    icon: FileText,
    category: "Evaluation Cycle",
    roles: ["SYS_ADMIN", "ADMIN"],
  },
  {
    label: "Analytics Command Center",
    description: "Sentiment breakdown and ratings",
    path: "/sys/evaluation/analytics",
    icon: BarChart3,
    category: "Evaluation Cycle",
    roles: ["SYS_ADMIN", "ADMIN"],
  },
  {
    label: "System Logs & Stream",
    description: "Winston logs & live SSE terminal",
    path: "/sys/logs",
    icon: Terminal,
    category: "Administration",
    roles: ["SYS_ADMIN"],
  },

  // Supervisor
  {
    label: "Supervisor Overview",
    description: "Scope performance summary",
    path: "/supervisor/dashboard",
    icon: BarChart3,
    category: "Operations",
    roles: ["SUPERVISOR"],
  },
  {
    label: "Evaluate Faculty (SEF)",
    description: "Rate faculty teaching performance",
    path: "/supervisor/evaluate",
    icon: CheckCircle2,
    category: "Evaluation Cycle",
    roles: ["SUPERVISOR"],
  },
  {
    label: "Jurisdiction Reports & FEDAF",
    description: "Review IFER and development plans",
    path: "/supervisor/reports",
    icon: FileText,
    category: "Evaluation Cycle",
    roles: ["SUPERVISOR"],
  },
  {
    label: "Jurisdiction Analytics",
    description: "Scoped college/program metrics",
    path: "/supervisor/analytics",
    icon: BarChart3,
    category: "Evaluation Cycle",
    roles: ["SUPERVISOR"],
  },
  {
    label: "Coverage Offerings",
    description: "Assigned course offerings",
    path: "/supervisor/coverage",
    icon: Building2,
    category: "Operations",
    roles: ["SUPERVISOR"],
  },

  // Faculty
  {
    label: "Faculty Dashboard",
    description: "Teaching overview and ratings",
    path: "/faculty/dashboard",
    icon: BarChart3,
    category: "Operations",
    roles: ["FACULTY"],
  },
  {
    label: "Teaching Workload & Rosters",
    description: "Enrolled class students",
    path: "/faculty/classes",
    icon: GraduationCap,
    category: "Operations",
    roles: ["FACULTY"],
  },
  {
    label: "My IFER Reports & FEDAF",
    description: "Acknowledge evaluation findings",
    path: "/faculty/reports",
    icon: FileText,
    category: "Evaluation Cycle",
    roles: ["FACULTY"],
  },

  // Student
  {
    label: "Student Home",
    description: "Enrolled courses overview",
    path: "/student/dashboard",
    icon: BarChart3,
    category: "Operations",
    roles: ["STUDENT"],
  },
  {
    label: "Evaluate Teachers (SET)",
    description: "Rate instruction quality",
    path: "/student/evaluate",
    icon: CheckCircle2,
    category: "Evaluation Cycle",
    roles: ["STUDENT"],
  },
  {
    label: "Enrolled Classes",
    description: "Active class registration",
    path: "/student/classes",
    icon: GraduationCap,
    category: "Operations",
    roles: ["STUDENT"],
  },

  // Shared
  {
    label: "Account Settings & Security",
    description: "Password, 2FA, and identity",
    path: "/sys/settings",
    icon: Settings,
    category: "Account",
    roles: ["SYS_ADMIN", "ADMIN", "SUPERVISOR", "FACULTY", "STUDENT"],
  },
];

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const userRoles = user?.roles ?? [];

  const availableCommands = useMemo(() => {
    return ALL_COMMANDS.filter((cmd) => cmd.roles.some((r) => userRoles.includes(r as any)));
  }, [userRoles]);

  const categories = useMemo(() => {
    return Array.from(new Set(availableCommands.map((c) => c.category)));
  }, [availableCommands]);

  const handleSelect = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 shadow-2xl rounded-2xl sm:max-w-xl border border-border/80 bg-card">
        <DialogHeader className="sr-only">
          <DialogTitle>Command Palette</DialogTitle>
          <DialogDescription>Quickly search and jump to accessible pages</DialogDescription>
        </DialogHeader>

        <Command className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-4 [&_[cmdk-input-wrapper]_svg]:w-4 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-3 [&_[cmdk-item]]:py-2.5">
          <CommandInput placeholder="Type a destination or action (e.g. SET, Reports, Classes)..." />
          <CommandList className="max-h-84 p-2 overflow-y-auto">
            <CommandEmpty className="py-8 text-center text-xs text-muted-foreground">
              No matching shortcuts or pages found.
            </CommandEmpty>

            {categories.map((category) => (
              <CommandGroup key={category} heading={category}>
                {availableCommands
                  .filter((c) => c.category === category)
                  .map((cmd) => {
                    const Icon = cmd.icon;
                    return (
                      <CommandItem
                        key={cmd.path + cmd.label}
                        value={`${cmd.label} ${cmd.description || ""}`}
                        onSelect={() => handleSelect(cmd.path)}
                        className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-[background-color,color] hover:bg-accent hover:text-accent-foreground active:scale-[0.98]"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-muted/40 text-primary">
                            <Icon className="size-3.5" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-foreground truncate">
                              {cmd.label}
                            </span>
                            {cmd.description && (
                              <span className="text-[10px] text-muted-foreground truncate">
                                {cmd.description}
                              </span>
                            )}
                          </div>
                        </div>

                        <ArrowRight className="size-3.5 text-muted-foreground/40 shrink-0 ml-2" />
                      </CommandItem>
                    );
                  })}
              </CommandGroup>
            ))}
            <CommandSeparator className="my-1" />
          </CommandList>

          {/* Keyboard Hint Footer */}
          <div className="flex items-center justify-between border-t border-border/40 bg-muted/20 px-4 py-2 text-[11px] text-muted-foreground">
            <span>Navigation Command Menu</span>
            <div className="flex items-center gap-2 font-mono text-[10px]">
              <span>
                <kbd className="rounded bg-muted px-1.5 py-0.5">↑↓</kbd> Navigate
              </span>
              <span>
                <kbd className="rounded bg-muted px-1.5 py-0.5">↵</kbd> Select
              </span>
              <span>
                <kbd className="rounded bg-muted px-1.5 py-0.5">esc</kbd> Close
              </span>
            </div>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
};
