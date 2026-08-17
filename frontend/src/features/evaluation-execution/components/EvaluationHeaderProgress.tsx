import React from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock } from "lucide-react";
import type { EvaluationCategoryNode } from "backend/types/evaluation-form.type";

interface EvaluationHeaderProgressProps {
  categories: EvaluationCategoryNode[];
  ratingsMap: Record<number, number>;
  totalQuestions: number;
  activeCategoryIndex: number;
  onSelectCategory: (index: number) => void;
  isSubmitted?: boolean;
}

export const EvaluationHeaderProgress: React.FC<EvaluationHeaderProgressProps> = ({
  categories,
  ratingsMap,
  totalQuestions,
  activeCategoryIndex,
  onSelectCategory,
  isSubmitted = false,
}) => {
  const answeredCount = Object.keys(ratingsMap).length;
  const progressPercentage =
    totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
  const isComplete = answeredCount >= totalQuestions && totalQuestions > 0;

  return (
    <div className="sticky top-0 z-10 space-y-3 border-b border-border/60 bg-card/95 p-4 backdrop-blur-md shadow-xs">
      {/* Top Status & Completion Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-foreground">Completion Progress</span>
          <span className="font-mono text-xs font-bold text-primary">
            {answeredCount}/{totalQuestions} rated ({progressPercentage}%)
          </span>
        </div>

        {isSubmitted ? (
          <Badge
            variant="outline"
            className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 gap-1 text-[11px]"
          >
            <CheckCircle2 className="size-3" /> Submitted
          </Badge>
        ) : isComplete ? (
          <Badge
            variant="outline"
            className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 gap-1 text-[11px]"
          >
            <CheckCircle2 className="size-3" /> Ready to Submit
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="border-amber-500/30 bg-amber-500/10 text-amber-400 gap-1 text-[11px]"
          >
            <Clock className="size-3" /> In Progress
          </Badge>
        )}
      </div>

      <Progress value={progressPercentage} className="h-2 w-full bg-muted" />

      {/* Category Jump Pills */}
      {categories.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 no-scrollbar">
          {categories.map((cat, idx) => {
            const catAnswered = cat.questions.filter((q) => ratingsMap[q.id] !== undefined).length;
            const catTotal = cat.questions.length;
            const isCatComplete = catAnswered >= catTotal && catTotal > 0;
            const isActive = idx === activeCategoryIndex;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(idx)}
                className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
                  isActive
                    ? "border-primary bg-primary/10 text-primary font-semibold"
                    : isCatComplete
                      ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
                      : "border-border/50 bg-muted/20 text-muted-foreground hover:bg-muted"
                }`}
              >
                <span>
                  {idx + 1}. {cat.name}
                </span>
                <span className="font-mono text-[10px] opacity-75">
                  ({catAnswered}/{catTotal})
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
