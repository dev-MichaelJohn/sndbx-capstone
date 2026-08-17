import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export type SystemStatus =
  | "active"
  | "pending"
  | "draft"
  | "finalized"
  | "acknowledged"
  | "closed"
  | "inactive";

interface StatusBadgeProps {
  status: SystemStatus | string;
  label?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, className }) => {
  const normStatus = status.toLowerCase();

  switch (normStatus) {
    case "active":
      return (
        <Badge
          variant="outline"
          className={cn(
            "gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium px-2.5 py-0.5 text-[11px] rounded-md",
            className,
          )}
        >
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          {label ?? "Active"}
        </Badge>
      );

    case "acknowledged":
      return (
        <Badge
          variant="outline"
          className={cn(
            "gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium px-2.5 py-0.5 text-[11px] rounded-md",
            className,
          )}
        >
          <CheckCircle2 className="size-3.5" />
          {label ?? "Acknowledged"}
        </Badge>
      );

    case "finalized":
      return (
        <Badge
          variant="outline"
          className={cn(
            "gap-1.5 border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400 font-medium px-2.5 py-0.5 text-[11px] rounded-md",
            className,
          )}
        >
          <ShieldCheck className="size-3.5" />
          {label ?? "Finalized"}
        </Badge>
      );

    case "pending":
    case "draft":
    case "upcoming":
      return (
        <Badge
          variant="outline"
          className={cn(
            "gap-1.5 border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium px-2.5 py-0.5 text-[11px] rounded-md",
            className,
          )}
        >
          <Clock className="size-3.5" />
          {label ?? (normStatus === "draft" ? "Draft" : "Pending")}
        </Badge>
      );

    case "closed":
    case "inactive":
    default:
      return (
        <Badge
          variant="outline"
          className={cn(
            "gap-1.5 border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-medium px-2.5 py-0.5 text-[11px] rounded-md",
            className,
          )}
        >
          <XCircle className="size-3.5" />
          {label ?? "Closed"}
        </Badge>
      );
  }
};
