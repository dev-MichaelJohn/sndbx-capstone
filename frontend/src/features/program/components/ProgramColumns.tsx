import { Eye, MoreHorizontal, Pencil, Trash2, GraduationCap, User } from "lucide-react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DataTableColumn } from "@/components/main-data-table";
import type { ProgramWithChairType } from "backend/types/program.type";

import { formatFullName } from "@/lib/nameFormatter";
import { ProgramEditDialog } from "./ProgramEdit.tsx";
import { ProgramDeleteDialog } from "./ProgramDelete.tsx";

// We use a factory function here so we can inject the collegeId from the page URL[cite: 12]
export const getProgramColumns = (
  collegeId: string | number,
): Array<DataTableColumn<ProgramWithChairType>> => [
  {
    header: "Program Details",
    className: "w-auto min-w-[240px]",
    cell: (row) => {
      return (
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <GraduationCap className="size-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-foreground">{row.name}</span>
            <span className="font-mono text-[11px] text-muted-foreground">{row.initialism}</span>
          </div>
        </div>
      );
    },
  },
  {
    header: "Program Chair",
    className: "w-auto min-w-[200px]",
    cell: (row) => {
      const chairName = row.account_id
        ? formatFullName({
            first_name: row.first_name,
            last_name: row.last_name,
            middle_name: row.middle_name,
            suffix: row.suffix,
          })
        : null;

      const initials = `${row.first_name?.[0] ?? ""}${row.last_name?.[0] ?? ""}`.toUpperCase();

      if (!chairName) {
        return (
          <span className="inline-flex items-center gap-1.5 text-xs italic text-muted-foreground/60">
            <User className="size-3.5" /> Unassigned
          </span>
        );
      }

      return (
        <div className="flex items-center gap-2.5">
          <Avatar className="size-7 border border-border/50">
            <AvatarFallback className="bg-muted text-[10px] font-semibold text-foreground">
              {initials || "C"}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs font-medium text-foreground">{chairName}</span>
        </div>
      );
    },
  },
  {
    header: "Actions",
    className: "w-px whitespace-nowrap",
    cell: (row) => (
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="size-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-40 p-1">
            <DropdownMenuItem
              asChild
              className="cursor-pointer text-xs focus:bg-accent focus:text-accent-foreground"
            >
              <Link to={String(row.id)}>
                <Eye className="mr-2 size-3.5" />
                View Details
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="cursor-pointer p-0 hover:bg-transparent focus:bg-transparent"
              onSelect={(e) => e.preventDefault()}
            >
              <ProgramEditDialog icon={Pencil} triggerText="Edit" defaultData={row} />
            </DropdownMenuItem>

            <DropdownMenuItem
              className="cursor-pointer p-0 hover:bg-transparent focus:bg-transparent"
              onSelect={(e) => e.preventDefault()}
            >
              <ProgramDeleteDialog icon={Trash2} triggerText="Delete" program={row} />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];
