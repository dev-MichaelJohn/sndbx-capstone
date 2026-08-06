import { MoreHorizontal, Pencil, Trash2, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DataTableColumn } from "@/components/main-data-table";
import type { UserWithDetails, SystemRole } from "backend/types/user.type";
import { formatFullName } from "@/lib/nameFormatter";

interface GetUserColumnsProps {
  onEdit: (user: UserWithDetails) => void;
  onDelete: (user: UserWithDetails) => void;
  isSysAdmin: boolean;
}

const roleBadgeStyles: Record<SystemRole, string> = {
  SYS_ADMIN: "border-red-500/30 bg-red-500/10 text-red-400 dark:text-red-300",
  ADMIN: "border-purple-500/30 bg-purple-500/10 text-purple-400 dark:text-purple-300",
  SUPERVISOR: "border-indigo-500/30 bg-indigo-500/10 text-indigo-400 dark:text-indigo-300",
  FACULTY: "border-blue-500/30 bg-blue-500/10 text-blue-400 dark:text-blue-300",
  STUDENT: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 dark:text-emerald-300",
};

export function getUserColumns({
  onEdit,
  onDelete,
  isSysAdmin,
}: GetUserColumnsProps): Array<DataTableColumn<UserWithDetails>> {
  return [
    {
      header: "User Details",
      className: "w-auto min-w-[220px]",
      cell: (row) => {
        const fullName = formatFullName({
          first_name: row.first_name,
          middle_name: row.middle_name ?? "",
          last_name: row.last_name,
          suffix: row.suffix ?? "",
        });
        const initials = `${row.first_name?.[0] ?? ""}${row.last_name?.[0] ?? ""}`.toUpperCase();

        return (
          <div className="flex items-center gap-3">
            <Avatar className="size-8 border border-border/50">
              <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
                {initials || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-foreground">{fullName}</span>
              <span className="font-mono text-[11px] text-muted-foreground">
                {row.institutional_id || "No ID"}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      header: "Email Address",
      className: "w-auto text-xs text-muted-foreground",
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <Mail className="size-3.5 shrink-0 text-muted-foreground/70" />
          <span>{row.email}</span>
        </div>
      ),
    },
    {
      header: "Assigned Roles",
      className: "w-48",
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.roles.map((role) => (
            <Badge
              key={role}
              variant="outline"
              className={`rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors ${
                roleBadgeStyles[role] ?? "border-border bg-muted text-muted-foreground"
              }`}
            >
              {role.replace("_", " ")}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      header: "Actions",
      className: "w-px whitespace-nowrap",
      cell: (row) => {
        const isAdminTarget = row.roles.includes("ADMIN");
        const canManage = isSysAdmin || !isAdminTarget;

        if (!canManage) {
          return (
            <div className="flex justify-end">
              <span className="text-[11px] italic text-muted-foreground/60 px-2">Restricted</span>
            </div>
          );
        }

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="size-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36 p-1">
                <DropdownMenuItem className="cursor-pointer text-xs" onSelect={() => onEdit(row)}>
                  <Pencil className="mr-2 size-3.5 text-muted-foreground" />
                  Edit User
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer text-xs text-destructive focus:bg-destructive/10 focus:text-destructive"
                  onSelect={() => onDelete(row)}
                >
                  <Trash2 className="mr-2 size-3.5" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}
