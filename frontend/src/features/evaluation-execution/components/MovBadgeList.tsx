import { CheckCircle2, FileCheck } from "lucide-react";

interface MovBadgeListProps {
  means?: Array<{ id: number; descriptor: string }> | string[];
}

export const MovBadgeList = ({ means = [] }: MovBadgeListProps) => {
  if (means.length === 0) return null;

  return (
    <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs">
      <div className="flex items-center gap-1.5 font-semibold text-emerald-400 text-[11px] uppercase tracking-wider">
        <FileCheck className="size-3.5 shrink-0" />
        <span>Means of Verification (MOVs)</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {means.map((item, idx) => {
          const label = typeof item === "string" ? item : item.descriptor;
          const key = typeof item === "string" ? idx : item.id;
          return (
            <div
              key={key}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-500/15 bg-background/60 px-2.5 py-1 text-xs font-medium text-foreground/90"
            >
              <CheckCircle2 className="size-3 shrink-0 text-emerald-400" />
              <span>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
