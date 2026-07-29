import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { ProgramEditDialog } from "./program-edit";
import { ProgramDeleteDialog } from "./program-delete";

// We use a factory function here so we can inject the collegeId from the page URL
export const getProgramColumns = (
  collegeId: string | number,
): Array<DataTableColumn<ProgramWithChairType>> => [
  {
    header: "Code",
    className: "w-24",
    cell: (row) => (
      <Badge variant="outline" className="font-mono text-sm">
        {row.initialism}
      </Badge>
    ),
  },
  {
    header: "Program Name",
    className: "w-auto",
    cell: (row) => row.name,
  },
  {
    header: "Program Chair",
    className: "w-auto",
    cell: (row) => {
      const chairName = row.account_id
        ? formatFullName({
            first_name: row.first_name,
            last_name: row.last_name,
            middle_name: row.middle_name,
            suffix: row.suffix,
          })
        : null;

      return chairName ?? <span className="italic text-muted-foreground/60">Unassigned</span>;
    },
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

          <DropdownMenuContent align="end" className="w-40 p-1">
            <DropdownMenuItem
              asChild
              className="cursor-pointer text-xs focus:bg-accent focus:text-accent-foreground"
            >
              <Link to={`/sys/institution/${collegeId}/programs/${row.id}`}>
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
