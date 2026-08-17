import React from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Star, Activity, FileText } from "lucide-react";

interface VisualRatingMeterProps {
  type: "set" | "sef" | "combined";
  score: string | number | null;
  maxScore?: number;
}

const classificationLabel = (numericScore: number): { label: string; color: string } => {
  if (numericScore >= 4.5 || numericScore >= 90)
    return { label: "Outstanding", color: "text-emerald-500" };
  if (numericScore >= 3.5 || numericScore >= 85)
    return { label: "Very Satisfactory", color: "text-sky-500" };
  if (numericScore >= 2.5 || numericScore >= 75)
    return { label: "Satisfactory", color: "text-amber-500" };
  return { label: "Needs Improvement", color: "text-rose-500" };
};

export const VisualRatingMeter: React.FC<VisualRatingMeterProps> = ({
  type,
  score,
  maxScore = 5.0,
}) => {
  const numScore = score != null ? Number(score) : 0;
  const isPercentage = numScore > 5.0; // Automatically detect percentage vs 5-point scale
  const effectiveMax = isPercentage ? 100 : maxScore;
  const percentage = Math.min(100, Math.max(0, (numScore / effectiveMax) * 100));
  const classification = classificationLabel(numScore);

  const meta = {
    set: {
      title: "SET Score",
      weight: "60% Weight",
      icon: Star,
      iconBg: "bg-amber-500/10 text-amber-500",
    },
    sef: {
      title: "SEF Score",
      weight: "40% Weight",
      icon: Activity,
      iconBg: "bg-indigo-500/10 text-indigo-500",
    },
    combined: {
      title: "Combined Rating",
      weight: "100% Total",
      icon: FileText,
      iconBg: "bg-emerald-500/10 text-emerald-500",
    },
  }[type];

  const Icon = meta.icon;

  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`flex size-7 items-center justify-center rounded-lg ${meta.iconBg}`}>
            <Icon className="size-3.5" />
          </div>
          <span className="text-xs font-semibold text-foreground">{meta.title}</span>
        </div>
        <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0 border-border/60">
          {meta.weight}
        </Badge>
      </div>

      <div className="flex items-baseline justify-between pt-1">
        <span className="font-mono text-xl font-bold tracking-tight text-foreground">
          {score != null
            ? isPercentage
              ? `${numScore.toFixed(2)}%`
              : `${numScore.toFixed(2)} / ${maxScore.toFixed(1)}`
            : "N/A"}
        </span>
        {score != null && (
          <span className={`text-xs font-semibold ${classification.color}`}>
            {classification.label}
          </span>
        )}
      </div>

      <Progress value={percentage} className="h-1.5 w-full bg-muted" />
    </div>
  );
};
