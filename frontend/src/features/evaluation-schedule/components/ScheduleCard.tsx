import React from "react";
import { Calendar, FileText, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
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
import { formatScheduleDate } from "../utils/schedule-status.util";
import { useEvaluationForms } from "@/features/evaluation-management/api/evaluation-form.service";
import { useSemester } from "@/features/semester/api/semester.service";

import type { EvaluationType, ScheduleSelect } from "backend/types/evaluation-schedule.type";

interface ScheduleCardProps {
  type: EvaluationType;
  schedule: ScheduleSelect;
  onEdit: (schedule: ScheduleSelect) => void;
}

export const ScheduleCard: React.FC<ScheduleCardProps> = ({ type, schedule, onEdit }) => {
  const { data: forms } = useEvaluationForms(type);
  const { data: semester } = useSemester(schedule.semester_id);

  const form = forms?.find((f) => f.id === schedule.form_id);

  return (
    <Card className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border/60 bg-card shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md">
      <div className="h-1 w-full bg-linear-to-r from-primary/80 to-primary/30" />

      <CardHeader className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
              <FileText className="size-5" />
            </div>
            <div className="min-w-0">
              <ScheduleStatusBadge openAt={schedule.open_at} closeAt={schedule.close_at} />
              <h3 className="mt-1.5 text-sm font-bold text-foreground tracking-tight truncate leading-snug">
                {form?.title ?? `Evaluation Form #${schedule.form_id}`}
              </h3>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 shrink-0 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <MoreHorizontal className="size-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl p-1">
              <DropdownMenuItem className="cursor-pointer text-xs" onClick={() => onEdit(schedule)}>
                <Pencil className="mr-2 size-3.5 text-muted-foreground" /> Edit Schedule
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer p-0 focus:bg-transparent"
                onSelect={(e) => e.preventDefault()}
              >
                <ScheduleDeleteDialog
                  type={type}
                  schedule={schedule}
                  icon={Trash2}
                  triggerText="Delete Schedule"
                />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-1 space-y-2.5">
        <div className="flex items-center gap-2 text-xs">
          <Calendar className="size-3.5 text-muted-foreground shrink-0" />
          <span className="font-mono text-[11px] font-medium text-foreground">
            {formatScheduleDate(schedule.open_at)}
          </span>
          <span className="text-muted-foreground/50">→</span>
          <span className="font-mono text-[11px] font-medium text-foreground">
            {formatScheduleDate(schedule.close_at)}
          </span>
        </div>
      </CardContent>

      <CardFooter className="border-t border-border/40 p-3 px-5 bg-muted/10 flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground font-medium">
          {semester
            ? `AY ${semester.school_year_start}–${semester.school_year_end} (${semester.semester_term})`
            : `Semester #${schedule.semester_id}`}
        </span>
        <Badge variant="outline" className="font-mono text-[10px] capitalize">
          {type} Mode
        </Badge>
      </CardFooter>
    </Card>
  );
};
