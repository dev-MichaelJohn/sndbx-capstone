import { Badge } from "@/components/ui/badge";
import { GraduationCap, UserCheck } from "lucide-react";
import type { AnonymousSubmissionEvent } from "backend/types/socket.type";

const formatTimeAgo = (isoString: string) => {
  if (!isoString) return "Just now";

  // Normalize string: replace space with 'T' and append 'Z' if missing timezone offset
  const normalizedStr = isoString.includes("T")
    ? isoString.endsWith("Z") || isoString.includes("+")
      ? isoString
      : `${isoString}Z`
    : `${isoString.replace(" ", "T")}Z`;

  const submittedTime = new Date(normalizedStr).getTime();
  const seconds = Math.floor((Date.now() - submittedTime) / 1000);

  // If clock skew causes negative seconds, fallback to "Just now"
  if (seconds < 10) return "Just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

interface SubmissionFeedItemProps {
  item: AnonymousSubmissionEvent;
}

export const SubmissionFeedItem = ({ item }: SubmissionFeedItemProps) => {
  const isStudent = item.evaluator_type === "STUDENT";

  return (
    <div className="flex items-center justify-between rounded-lg border border-border/50 bg-card p-3 transition-all hover:border-border hover:bg-muted/30">
      <div className="flex items-center gap-3 min-w-0">
        <Badge
          variant="secondary"
          className={`gap-1 px-2 py-0.5 text-[10px] font-semibold tracking-wide shrink-0 ${
            isStudent
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-500/20"
              : "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-500/20"
          }`}
        >
          {isStudent ? (
            <>
              <GraduationCap className="size-3" /> SET
            </>
          ) : (
            <>
              <UserCheck className="size-3" /> SEF
            </>
          )}
        </Badge>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-semibold text-foreground truncate">{item.faculty_name}</p>
            <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0">
              {item.course_initialism}
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground truncate">{item.course_name}</p>
        </div>
      </div>

      <span className="ml-3 shrink-0 text-[11px] font-mono text-muted-foreground">
        {formatTimeAgo(item.submitted_at)}
      </span>
    </div>
  );
};
