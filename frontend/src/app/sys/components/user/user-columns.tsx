import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
}

const roleBadgeVariants: Record<SystemRole, "default" | "secondary" | "outline" | "destructive"> = {
  SYS_ADMIN: "destructive",
  ADMIN: "default",
  SUPERVISOR: "secondary",
  FACULTY: "secondary",
  STUDENT: "outline",
};

export function getUserColumns({
  onEdit,
  onDelete,
}: GetUserColumnsProps): Array<DataTableColumn<UserWithDetails>> {
  return [
    {
      header: "Institutional ID",
      className: "w-40 font-mono text-xs font-medium",
      cell: (row) => row.institutional_id || "N/A",
    },
    {
      header: "Full Name",
      className: "w-auto font-medium text-xs text-foreground",
      cell: (row) =>
        formatFullName({
          first_name: row.first_name,
          middle_name: row.middle_name ?? "",
          last_name: row.last_name,
          suffix: row.suffix ?? "",
        }),
    },
    {
      header: "Email Address",
      className: "w-auto text-xs text-muted-foreground",
      cell: (row) => row.email,
    },
    {
      header: "Roles",
      className: "w-48",
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.roles.map((role) => (
            <Badge
              key={role}
              variant={roleBadgeVariants[role] ?? "outline"}
              className="text-[10px] px-2 py-0.5 rounded-md"
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
      cell: (row) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36 p-1">
              <DropdownMenuItem className="cursor-pointer text-xs" onSelect={() => onEdit(row)}>
                <Pencil className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                Edit User
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-xs text-destructive focus:bg-destructive/10 focus:text-destructive"
                onSelect={() => onDelete(row)}
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}
