import { Calendar, MoreHorizontal, Pencil, Trash2, FileText, GraduationCap } from "lucide-react";

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
import { useEvaluationForms } from "@/features/evaluation-management/api/evaluation-form.service";
import { useSemester } from "@/features/semester/api/semester.service";

import type { EvaluationType, ScheduleSelect } from "backend/types/evaluation-schedule.type";

interface ScheduleColumnOptions {
  type: EvaluationType;
  onEdit?: (schedule: ScheduleSelect) => void;
}

// ── Cell Component for Evaluation Form Title ──────────────────────────
const FormTitleCell = ({ formId, type }: { formId: number; type: EvaluationType }) => {
  const { data: forms } = useEvaluationForms(type);
  const form = forms?.find((f) => f.id === formId);

  return (
    <div className="flex items-center gap-2 max-w-60">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-muted/40 text-muted-foreground">
        <FileText className="size-3.5" />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="truncate text-xs font-semibold text-foreground">
          {form?.title ?? `Form #${formId}`}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground/70">ID: {formId}</span>
      </div>
    </div>
  );
};

// ── Cell Component for Semester Details ──────────────────────────────
const SemesterCell = ({ semesterId }: { semesterId: number }) => {
  const { data: semester } = useSemester(semesterId);

  return (
    <div className="flex items-center gap-2">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-muted/40 text-muted-foreground">
        <GraduationCap className="size-3.5" />
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-foreground">
          {semester
            ? `AY ${semester.school_year_start}–${semester.school_year_end}`
            : `Semester #${semesterId}`}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {semester ? `${semester.semester_term} Semester` : `ID: ${semesterId}`}
        </span>
      </div>
    </div>
  );
};

export const getScheduleColumns = ({
  type,
  onEdit,
}: ScheduleColumnOptions): Array<DataTableColumn<ScheduleSelect>> => [
  {
    header: "Evaluation Form",
    className: "w-64",
    cell: (row) => <FormTitleCell formId={row.form_id} type={type} />,
  },
  {
    header: "Academic Term",
    className: "w-48",
    cell: (row) => <SemesterCell semesterId={row.semester_id} />,
  },
  {
    header: "Schedule Period",
    className: "w-auto",
    cell: (row) => (
      <div className="flex items-center gap-2 text-xs">
        <Calendar className="size-3.5 text-muted-foreground shrink-0" />
        <span className="font-medium text-foreground">{formatScheduleDate(row.open_at)}</span>
        <span className="text-muted-foreground/50">→</span>
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
            <Button
              variant="ghost"
              className="size-7 cursor-pointer rounded-lg p-0 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-40 rounded-xl p-1">
            {onEdit && (
              <DropdownMenuItem
                className="cursor-pointer rounded-lg px-2.5 py-1.5 text-xs focus:bg-accent"
                onClick={() => onEdit(row)}
              >
                <Pencil className="mr-2 size-3.5 text-muted-foreground" />
                Edit Schedule
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator className="my-1" />

            <DropdownMenuItem
              className="cursor-pointer rounded-lg p-0 hover:bg-transparent focus:bg-transparent"
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
