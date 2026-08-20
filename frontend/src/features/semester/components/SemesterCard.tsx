import React from "react";
import { Calendar, MoreHorizontal, Pencil, CalendarCheck2, Clock, CalendarX2 } from "lucide-react";
import { isWithinInterval, parseISO } from "date-fns";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SemesterEditDialog } from "../components/SemesterEdit";
import type { SemesterSelect } from "backend/types/semester.type";
import { cn } from "@/lib/utils";

interface SemesterCardProps {
  semester: SemesterSelect;
}

const getSemesterStatus = (startDateStr: string, endDateStr: string) => {
  const today = new Date();
  try {
    const start = parseISO(startDateStr);
    const end = parseISO(endDateStr);

    if (isWithinInterval(today, { start, end })) {
      return {
        label: "Active Term",
        icon: CalendarCheck2,
        className:
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold",
        cardBorder: "hover:border-emerald-500/40",
      };
    }
    if (today < start) {
      return {
        label: "Upcoming",
        icon: Clock,
        className:
          "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold",
        cardBorder: "hover:border-amber-500/40",
      };
    }
    return {
      label: "Ended",
      icon: CalendarX2,
      className: "border-border/60 bg-muted/60 text-muted-foreground",
      cardBorder: "hover:border-border",
    };
  } catch {
    return {
      label: "Unknown",
      icon: CalendarX2,
      className: "border-rose-500/30 bg-rose-500/10 text-rose-600",
      cardBorder: "hover:border-border",
    };
  }
};

export const SemesterCard: React.FC<SemesterCardProps> = ({ semester }) => {
  const status = getSemesterStatus(semester.start_date, semester.end_date);
  const StatusIcon = status.icon;

  return (
    <Card
      className={cn(
        "group relative flex flex-col justify-between rounded-2xl border border-border/60 bg-card p-5 shadow-xs transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-md",
        status.cardBorder,
      )}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-2xs group-hover:scale-105 transition-transform duration-200">
            <Calendar className="size-5.5" />
          </div>
          <div className="min-w-0 space-y-0.5">
            <Badge
              variant="outline"
              className={cn("text-[10px] px-2 py-0.5 gap-1 rounded-md", status.className)}
            >
              <StatusIcon className="size-3" />
              {status.label}
            </Badge>
            <h3 className="text-sm font-bold text-foreground tracking-tight truncate leading-snug">
              A.Y. {semester.school_year_start}–{Number(semester.school_year_start) + 1}
            </h3>
          </div>
        </div>

        {/* Action Menu */}
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
            className="w-36 rounded-xl p-1 shadow-lg border-border/80"
          >
            <DropdownMenuItem
              className="cursor-pointer p-0 focus:bg-transparent"
              onSelect={(e) => e.preventDefault()}
            >
              <SemesterEditDialog semester={semester} icon={Pencil} triggerText="Edit Term" />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Middle: Date Range Schedule Box */}
      <div className="my-4 rounded-xl border border-border/50 bg-muted/20 p-3 space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Operational Duration
        </span>
        <p className="font-mono text-xs font-semibold text-foreground">
          {semester.start_date} <span className="text-muted-foreground font-normal">to</span>{" "}
          {semester.end_date}
        </p>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs">
        <span className="font-bold text-foreground/90 uppercase text-[11px] tracking-wide">
          {semester.semester_term} Semester
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">ID: #{semester.id}</span>
      </div>
    </Card>
  );
};
