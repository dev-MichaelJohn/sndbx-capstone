import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, FileCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IferStatus } from "backend/types/evaluation-report.type";

interface StatusBadgeProps {
  status: IferStatus | string;
  className?: string;
}

export const EvaluationReportStatusBadge = ({ status, className }: StatusBadgeProps) => {
  switch (status) {
    case "ACKNOWLEDGED":
      return (
        <Badge
          variant="outline"
          className={cn(
            "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 gap-1.5 font-medium px-2.5 py-0.5 rounded-md text-[11px]",
            className,
          )}
        >
          <CheckCircle2 className="size-3.5" />
          Acknowledged
        </Badge>
      );

    case "FINALIZED":
      return (
        <Badge
          variant="outline"
          className={cn(
            "border-sky-500/30 bg-sky-500/10 text-sky-400 gap-1.5 font-medium px-2.5 py-0.5 rounded-md text-[11px]",
            className,
          )}
        >
          <FileCheck className="size-3.5" />
          Finalized
        </Badge>
      );

    case "DRAFT":
    default:
      return (
        <Badge
          variant="outline"
          className={cn(
            "border-amber-500/30 bg-amber-500/10 text-amber-400 gap-1.5 font-medium px-2.5 py-0.5 rounded-md text-[11px]",
            className,
          )}
        >
          <Clock className="size-3.5" />
          Draft
        </Badge>
      );
  }
};
