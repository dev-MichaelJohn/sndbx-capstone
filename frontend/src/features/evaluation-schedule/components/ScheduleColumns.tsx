import { Calendar, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DataTableColumn } from "@/components/main-data-table";

import { ScheduleStatusBadge } from "./ScheduleStatusBadge";
import { ScheduleDeleteDialog } from "./ScheduleDelete";
import { formatScheduleDate } from "../utils/schedule-status.util";

import type { EvaluationType, ScheduleSelect } from "backend/types/evaluation-schedule.type";

interface ScheduleColumnOptions {
  type: EvaluationType;
  onEdit?: (schedule: ScheduleSelect) => void;
}

export const getScheduleColumns = ({
  type,
  onEdit,
}: ScheduleColumnOptions): Array<DataTableColumn<ScheduleSelect>> => [
  {
    header: "Form ID",
    className: "w-28",
    cell: (row) => <span className="font-mono text-xs text-foreground">Form #{row.form_id}</span>,
  },
  {
    header: "Semester ID",
    className: "w-28",
    cell: (row) => (
      <span className="font-mono text-xs text-muted-foreground">Sem #{row.semester_id}</span>
    ),
  },
  {
    header: "Schedule Period",
    className: "w-auto",
    cell: (row) => (
      <div className="flex items-center gap-2 text-xs">
        <Calendar className="size-3.5 text-muted-foreground shrink-0" />
        <span className="font-medium text-foreground">{formatScheduleDate(row.open_at)}</span>
        <span className="text-muted-foreground">to</span>
        <span className="font-medium text-foreground">{formatScheduleDate(row.close_at)}</span>
      </div>
    ),
  },
  {
    header: "Status",
    className: "w-32",
    cell: (row) => <ScheduleStatusBadge openAt={row.open_at} closeAt={row.close_at} />,
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

          <DropdownMenuContent align="end" className="w-44 p-1">
            {onEdit && (
              <DropdownMenuItem
                className="cursor-pointer text-xs focus:bg-accent focus:text-accent-foreground"
                onClick={() => onEdit(row)}
              >
                <Pencil className="mr-2 size-3.5 text-muted-foreground" />
                Edit Schedule
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="cursor-pointer p-0 hover:bg-transparent focus:bg-transparent"
              onSelect={(e) => e.preventDefault()}
            >
              <ScheduleDeleteDialog
                icon={Trash2}
                triggerText="Delete Schedule"
                type={type}
                schedule={row}
              />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];
