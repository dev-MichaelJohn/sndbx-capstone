import { Badge } from "@/components/ui/badge";
import { Loader2, FileText } from "lucide-react";
import type { LogEntry } from "backend/utils/log-stream.util";

interface HistoricalLogsListProps {
  logs: LogEntry[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
}

const getLevelBadgeVariant = (level: string) => {
  switch (level.toUpperCase()) {
    case "ERROR":
      return "destructive";
    case "WARN":
      return "warning";
    case "INFO":
      return "default";
    default:
      return "secondary";
  }
};

export const HistoricalLogsList = ({
  logs,
  isLoading,
  isError,
  error,
}: HistoricalLogsListProps) => {
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="size-4 animate-spin text-primary" />
        <span>Loading historical logs...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-1.5 p-6 text-center">
        <p className="text-xs font-semibold text-destructive">Failed to load log entries</p>
        <p className="text-[11px] text-muted-foreground">
          {error instanceof Error ? error.message : "Please check your network connection."}
        </p>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 bg-muted/20 p-6 text-center">
        <FileText className="size-6 text-muted-foreground/40" />
        <p className="text-xs font-medium text-muted-foreground">No log entries found</p>
        <p className="text-[11px] text-muted-foreground/60">
          Try adjusting your search query or selecting a different log file.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {logs.map((log, index) => (
        <div
          key={index}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl border border-border/50 bg-card p-3.5 transition-all hover:border-border hover:bg-muted/30 shadow-2xs font-mono text-xs"
        >
          <div className="flex items-center gap-3 min-w-0">
            <Badge
              variant={getLevelBadgeVariant(log.level) as any}
              className="uppercase text-[10px] font-mono shrink-0 px-2 py-0.5"
            >
              {log.level}
            </Badge>
            <span className="text-foreground/90 break-all whitespace-pre-wrap">{log.message}</span>
          </div>
          <span className="shrink-0 text-[11px] text-muted-foreground select-none sm:text-right">
            {log.timestamp}
          </span>
        </div>
      ))}
    </div>
  );
};
