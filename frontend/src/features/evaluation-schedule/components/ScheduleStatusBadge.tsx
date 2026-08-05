import { Badge } from "@/components/ui/badge";
import { CalendarClock, XCircle } from "lucide-react";
import { getScheduleStatus } from "../utils/schedule-status.util";
import { cn } from "@/lib/utils";

interface ScheduleStatusBadgeProps {
  openAt: string | Date;
  closeAt: string | Date;
  className?: string;
}

export const ScheduleStatusBadge = ({ openAt, closeAt, className }: ScheduleStatusBadgeProps) => {
  const status = getScheduleStatus(openAt, closeAt);

  switch (status) {
    case "active":
      return (
        <Badge
          variant="outline"
          className={cn(
            "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 gap-1.5 font-medium px-2.5 py-0.5",
            className,
          )}
        >
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          Active
        </Badge>
      );

    case "upcoming":
      return (
        <Badge
          variant="outline"
          className={cn(
            "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 gap-1.5 font-medium px-2.5 py-0.5",
            className,
          )}
        >
          <CalendarClock className="size-3.5" />
          Upcoming
        </Badge>
      );

    case "closed":
    default:
      return (
        <Badge
          variant="outline"
          className={cn(
            "border-border bg-muted/50 text-muted-foreground gap-1.5 font-medium px-2.5 py-0.5",
            className,
          )}
        >
          <XCircle className="size-3.5" />
          Closed
        </Badge>
      );
  }
};
