import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, Copy, Check } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import type { LogEntry } from "backend/utils/log-stream.util";

interface HistoricalLogsListProps {
  logs: LogEntry[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
}

const getLevelBadgeStyle = (level: string) => {
  switch (level.toUpperCase()) {
    case "ERROR":
      return "border-rose-500/30 bg-rose-500/10 text-rose-400";
    case "WARN":
      return "border-amber-500/30 bg-amber-500/10 text-amber-400";
    case "HTTP":
      return "border-cyan-500/30 bg-cyan-500/10 text-cyan-400";
    case "INFO":
    default:
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
  }
};

export const HistoricalLogsList = ({
  logs,
  isLoading,
  isError,
  error,
}: HistoricalLogsListProps) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyLine = (log: LogEntry, index: number) => {
    const text = `[${log.timestamp}] [${log.level.toUpperCase()}]: ${log.message}`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Log line copied.");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-xs text-muted-foreground font-mono">
        <Loader2 className="size-4 animate-spin text-primary" />
        <span>Reading log file contents...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-1.5 p-6 text-center">
        <p className="text-xs font-semibold text-destructive">Failed to retrieve log entries</p>
        <p className="text-[11px] text-muted-foreground font-mono">
          {error instanceof Error ? error.message : "Log file unreadable or missing."}
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
    <div className="space-y-2 font-mono">
      {logs.map((log, index) => (
        <div
          key={index}
          className="group flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl border border-border/50 bg-card p-3 transition-all hover:border-border hover:bg-muted/30 text-xs shadow-2xs"
        >
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <Badge
              variant="outline"
              className={`uppercase text-[10px] font-mono shrink-0 px-2 py-0.5 ${getLevelBadgeStyle(log.level)}`}
            >
              {log.level}
            </Badge>
            <span className="text-foreground/90 break-all whitespace-pre-wrap flex-1">
              {log.message}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <span className="text-[11px] text-muted-foreground select-none">{log.timestamp}</span>

            <button
              type="button"
              onClick={() => copyLine(log, index)}
              className="size-6 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded text-muted-foreground hover:text-foreground cursor-pointer"
              title="Copy line"
            >
              {copiedIndex === index ? (
                <Check className="size-3 text-emerald-400" />
              ) : (
                <Copy className="size-3" />
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
