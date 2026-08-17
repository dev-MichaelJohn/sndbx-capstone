import React from "react";
import { Calendar, GraduationCap, MoreHorizontal, Pencil } from "lucide-react";
import { isWithinInterval, parseISO } from "date-fns";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SemesterEditDialog } from "./SemesterEdit";
import type { SemesterSelect } from "backend/types/semester.type";

interface SemesterCardProps {
  semester: SemesterSelect;
}

export const SemesterCard: React.FC<SemesterCardProps> = ({ semester }) => {
  const today = new Date();
  const start = parseISO(semester.start_date);
  const end = parseISO(semester.end_date);

  const isActive = isWithinInterval(today, { start, end });
  const isUpcoming = today < start;

  const statusMeta = isActive
    ? {
        label: "Active Term",
        style: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
        bar: "bg-emerald-500",
      }
    : isUpcoming
      ? {
          label: "Upcoming",
          style: "border-amber-500/30 bg-amber-500/10 text-amber-500",
          bar: "bg-amber-500",
        }
      : {
          label: "Ended",
          style: "border-border/50 bg-muted/60 text-muted-foreground",
          bar: "bg-muted-foreground/30",
        };

  return (
    <Card className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border/60 bg-card shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md">
      <div className={`h-1 w-full ${statusMeta.bar}`} />

      <CardHeader className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
              <GraduationCap className="size-5" />
            </div>
            <div className="min-w-0">
              <Badge
                variant="outline"
                className={`text-[10px] font-medium px-2 py-0.5 ${statusMeta.style}`}
              >
                {statusMeta.label}
              </Badge>
              <h3 className="mt-1 text-sm font-bold text-foreground tracking-tight truncate">
                A.Y. {semester.school_year_start}–{semester.school_year_end}
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
            <DropdownMenuContent align="end" className="w-36 rounded-xl p-1">
              <DropdownMenuItem
                className="cursor-pointer p-0 focus:bg-transparent"
                onSelect={(e) => e.preventDefault()}
              >
                <SemesterEditDialog semester={semester} icon={Pencil} triggerText="Edit Term" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-1 space-y-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="size-3.5 text-muted-foreground shrink-0" />
          <span className="font-mono text-[11px] font-medium text-foreground">
            {semester.start_date} – {semester.end_date}
          </span>
        </div>
      </CardContent>

      <CardFooter className="border-t border-border/40 p-3 px-5 bg-muted/10 flex items-center justify-between">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          {semester.semester_term} Semester
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">ID: #{semester.id}</span>
      </CardFooter>
    </Card>
  );
};
