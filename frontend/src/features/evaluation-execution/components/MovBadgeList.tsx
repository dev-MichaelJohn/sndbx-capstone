import { CheckCircle2, FileCheck } from "lucide-react";

interface MovBadgeListProps {
  means?: Array<{ id: number; descriptor: string }> | string[];
}

export const MovBadgeList = ({ means = [] }: MovBadgeListProps) => {
  if (means.length === 0) return null;

  return (
    <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs space-y-2">
      <div className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400 text-[10px] uppercase tracking-wider">
        <FileCheck className="size-3.5 shrink-0" />
        <span>Suggested Means of Verification (MOVs)</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {means.map((item, idx) => {
          const label = typeof item === "string" ? item : item.descriptor;
          const key = typeof item === "string" ? idx : item.id;
          return (
            <div
              key={key}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-background/80 px-2.5 py-1 text-xs font-medium text-foreground"
            >
              <CheckCircle2 className="size-3 shrink-0 text-emerald-500" />
              <span>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
