import React from "react";
import { FileText, MoreHorizontal, Pencil, Trash2, Calendar } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScheduleStatusBadge } from "./ScheduleStatusBadge";
import { ScheduleDeleteDialog } from "./ScheduleDelete";
import { formatScheduleRange, getScheduleStatus } from "../utils/schedule-status.util";
import { useEvaluationForms } from "@/features/evaluation-management/api/evaluation-form.service";
import { useSemester } from "@/features/semester/api/semester.service";
import type { EvaluationType, ScheduleSelect } from "backend/types/evaluation-schedule.type";
import { cn } from "@/lib/utils";

interface ScheduleCardProps {
  type: EvaluationType;
  schedule: ScheduleSelect;
  onEdit: (schedule: ScheduleSelect) => void;
}

export const ScheduleCard: React.FC<ScheduleCardProps> = ({ type, schedule, onEdit }) => {
  const { data: forms } = useEvaluationForms(type);
  const form = forms?.find((f) => f.id === schedule.form_id);

  const { data: semester } = useSemester(schedule.semester_id);
  const status = getScheduleStatus(schedule.open_at, schedule.close_at);

  return (
    <Card
      className={cn(
        "group relative flex flex-col justify-between rounded-2xl border border-border/60 bg-card p-5 shadow-xs transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-md",
        status === "active" ? "hover:border-emerald-500/40" : "hover:border-border",
      )}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-xl border shadow-2xs group-hover:scale-105 transition-transform duration-200",
              status === "active"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : "bg-muted text-muted-foreground border-border/60",
            )}
          >
            <FileText className="size-5.5" />
          </div>

          <div className="min-w-0 space-y-1">
            <ScheduleStatusBadge openAt={schedule.open_at} closeAt={schedule.close_at} />
            <h3 className="text-sm font-bold text-foreground tracking-tight truncate leading-snug">
              {form?.title ?? `Evaluation Form #${schedule.form_id}`}
            </h3>
          </div>
        </div>

        {/* Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-7.5 shrink-0 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground active:scale-[0.96] cursor-pointer"
            >
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-40 rounded-xl p-1 shadow-lg border-border/80"
          >
            <DropdownMenuItem
              className="cursor-pointer text-xs gap-2 py-1.5"
              onClick={() => onEdit(schedule)}
            >
              <Pencil className="size-3.5 text-muted-foreground" /> Edit Schedule
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer p-0 focus:bg-transparent"
              onSelect={(e) => e.preventDefault()}
            >
              <ScheduleDeleteDialog
                icon={Trash2}
                triggerText="Delete Schedule"
                type={type}
                schedule={schedule}
              />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Middle: Timeframe Schedule Window Box */}
      <div className="my-4 rounded-xl border border-border/50 bg-muted/20 p-3 space-y-1">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          <Calendar className="size-3" />
          <span>Evaluation Submission Window</span>
        </div>
        <p className="font-mono text-xs font-semibold text-foreground">
          {formatScheduleRange(schedule.open_at, schedule.close_at)}
        </p>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs">
        <span className="text-muted-foreground text-[11px]">
          {semester
            ? `AY ${semester.school_year_start}–${semester.school_year_end} (${semester.semester_term})`
            : `Sem #${schedule.semester_id}`}
        </span>
        <Badge variant="outline" className="font-mono text-[9px] uppercase px-1.5 py-0">
          {type} Mode
        </Badge>
      </div>
    </Card>
  );
};
