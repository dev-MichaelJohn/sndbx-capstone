import React from "react";
import { Calendar, GraduationCap } from "lucide-react";
import { parseISO, isWithinInterval, differenceInDays } from "date-fns";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SemesterSelect } from "backend/types/semester.type";

interface ActiveTermBannerProps {
  semesters: SemesterSelect[];
  isLoading?: boolean;
}

export const ActiveTermBanner: React.FC<ActiveTermBannerProps> = ({
  semesters,
  isLoading = false,
}) => {
  const today = new Date();

  const activeSemester = React.useMemo(() => {
    if (!semesters.length) return null;
    return (
      semesters.find((s) => {
        try {
          return isWithinInterval(today, {
            start: parseISO(s.start_date),
            end: parseISO(s.end_date),
          });
        } catch {
          return false;
        }
      }) ?? semesters[0]
    );
  }, [semesters, today]);

  if (isLoading) {
    return <div className="h-28 w-full rounded-2xl border bg-card animate-pulse" />;
  }

  if (!activeSemester) {
    return (
      <div className="flex items-center justify-between rounded-2xl border border-dashed border-border/60 bg-card p-5 text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <Calendar className="size-5 text-muted-foreground/60" />
          <span>No active academic semester currently configured.</span>
        </div>
      </div>
    );
  }

  const startDate = parseISO(activeSemester.start_date);
  const endDate = parseISO(activeSemester.end_date);
  const totalDays = Math.max(1, differenceInDays(endDate, startDate));
  const daysElapsed = Math.max(0, differenceInDays(today, startDate));
  const daysRemaining = Math.max(0, differenceInDays(endDate, today));
  const termProgress = Math.min(100, Math.max(0, Math.round((daysElapsed / totalDays) * 100)));

  return (
    <Card className="relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6 shadow-2xs">
      <CardContent className="p-0 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className="gap-1.5 border-primary/30 bg-primary/10 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-md"
            >
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              Active Academic Term
            </Badge>

            <span className="font-mono text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="size-3.5 text-muted-foreground shrink-0" />
              {activeSemester.start_date} – {activeSemester.end_date}
            </span>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            A.Y. {activeSemester.school_year_start}–{activeSemester.school_year_end} (
            {activeSemester.semester_term} Semester)
          </h2>

          <p className="text-xs text-muted-foreground max-w-xl">
            Institutional evaluation windows and class rosters are synchronized to this term.
          </p>
        </div>

        {/* Term Days Countdown Metric */}
        <div className="flex items-center gap-4 shrink-0 rounded-xl border border-border/50 bg-card/80 p-4 shadow-2xs">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <GraduationCap className="size-5" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-bold text-foreground">{daysRemaining}</span>
              <span className="text-xs font-semibold text-muted-foreground">days remaining</span>
            </div>
            <p className="text-[10px] text-muted-foreground/80 mt-0.5">
              {termProgress}% of term elapsed
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
