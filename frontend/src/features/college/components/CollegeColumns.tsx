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
import type { CollegeWithDean } from "backend/types/college.types";

import { formatFullName } from "@/lib/nameFormatter";
import { CollegeEditDialog } from "./CollegeEdit";
import { CollegeDeleteDialog } from "./CollegeDelete";

export const collegeColumns: Array<DataTableColumn<CollegeWithDean>> = [
  {
    header: "Code",
    className: "w-24",
    cell: (row) => (
      <Badge variant="outline" className="font-mono text-sm">
        {row.initialism}
      </Badge>
    ),
  },
  { header: "Name", className: "w-auto", cell: (row) => row.name },
  {
    header: "Dean",
    className: "w-auto",
    cell: (row) => {
      const deanName = formatFullName({
        first_name: row.first_name,
        last_name: row.last_name,
        middle_name: row.middle_name,
        suffix: row.suffix,
      });

      return deanName ?? <span className="italic text-muted-foreground/60">Unassigned</span>;
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
              <Link to={`${row.id}/programs`}>
                <Eye className="mr-2 size-3.5" />
                View Programs
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="cursor-pointer p-0 hover:bg-transparent focus:bg-transparent"
              onSelect={(e) => e.preventDefault()}
            >
              <CollegeEditDialog icon={Pencil} triggerText="Edit" defaultData={row} />
            </DropdownMenuItem>

            <DropdownMenuItem
              className="cursor-pointer p-0 hover:bg-transparent focus:bg-transparent"
              onSelect={(e) => e.preventDefault()}
            >
              <CollegeDeleteDialog college={row} icon={Trash2} triggerText="Delete" />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];
