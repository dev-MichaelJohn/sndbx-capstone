import { Clock } from "lucide-react";

export const SubmissionFeedEmptyState = () => {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/60 bg-muted/20">
      <Clock className="size-6 text-muted-foreground/40" />
      <p className="text-xs font-medium text-muted-foreground">No submissions yet today</p>
      <p className="text-[11px] text-muted-foreground/60">
        New evaluation submissions will pop up here in real time.
      </p>
    </div>
  );
};
