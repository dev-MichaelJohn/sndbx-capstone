import { Eye, MoreHorizontal, Trash2 } from "lucide-react";
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
import type { EvaluationType, FormSelect } from "backend/types/evaluation-form.type";

interface ColumnOptions {
  type: EvaluationType;
  onDelete: (form: FormSelect) => void;
}

export const getEvaluationFormColumns = ({
  type,
  onDelete,
}: ColumnOptions): Array<DataTableColumn<FormSelect>> => [
  {
    header: "Form Title",
    className: "w-auto font-medium",
    cell: (row) => row.title,
  },
  {
    header: "Description",
    className: "w-1/3 text-muted-foreground",
    cell: (row) =>
      row.description || <span className="italic text-muted-foreground/60">No description</span>,
  },
  {
    header: "Type",
    className: "w-28",
    cell: () => (
      <Badge variant={type === "student" ? "default" : "secondary"} className="capitalize">
        {type}
      </Badge>
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

          <DropdownMenuContent align="end" className="w-40 p-1">
            <DropdownMenuItem
              asChild
              className="cursor-pointer text-xs focus:bg-accent focus:text-accent-foreground"
            >
              <Link to={`/sys/evaluation/forms/${type}/${row.id}`}>
                <Eye className="mr-2 size-3.5" />
                Manage Builder
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="cursor-pointer text-xs text-destructive focus:bg-destructive/10 focus:text-destructive"
              onClick={() => onDelete(row)}
            >
              <Trash2 className="mr-2 size-3.5" />
              Delete Form
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];
