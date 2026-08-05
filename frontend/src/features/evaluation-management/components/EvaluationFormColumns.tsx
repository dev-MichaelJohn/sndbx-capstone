import { Eye, MoreHorizontal, Trash2 } from "lucide-react";
import { Link } from "react-router";

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
    cell: (row) => (
      <span className="text-xs font-semibold tracking-tight text-foreground">{row.title}</span>
    ),
  },
  {
    header: "Description",
    cell: (row) => (
      <span className="text-xs font-medium text-muted-foreground">
        {row.description || <span className="italic text-muted-foreground/50">No description</span>}
      </span>
    ),
  },
  {
    header: "Type",
    cell: () => (
      <span
        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium capitalize ${
          type === "student"
            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
            : "border-sky-500/20 bg-sky-500/10 text-sky-500"
        }`}
      >
        {type}
      </span>
    ),
  },
  {
    header: "Actions",
    className: "text-right",
    cell: (row) => (
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 cursor-pointer rounded-lg p-0 hover:bg-muted"
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="size-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-40 rounded-xl p-1">
            <DropdownMenuItem
              asChild
              className="cursor-pointer rounded-lg text-xs focus:bg-accent focus:text-accent-foreground"
            >
              <Link to={`/sys/evaluation/forms/${type}/${row.id}`}>
                <Eye className="mr-2 size-3.5" />
                Manage Builder
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="cursor-pointer rounded-lg text-xs text-destructive focus:bg-destructive/10 focus:text-destructive"
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
