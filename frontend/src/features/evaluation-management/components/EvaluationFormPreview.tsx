import { useState } from "react";
import { Eye, FileCheck, HelpCircle, CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

import { useSupervisorMeans } from "../api/evaluation-form.service";
import type {
  EvaluationFormTree,
  EvaluationType,
  MeanSelect,
  QuestionSelect,
} from "backend/types/evaluation-form.type";

type QuestionWithMeans = QuestionSelect & {
  means?: MeanSelect[];
};

interface EvaluationFormPreviewProps {
  type: EvaluationType;
  formTree: EvaluationFormTree & {
    min_rating?: number;
    max_rating?: number;
  };
  triggerText?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "icon";
  className?: string;
}

const QuestionMovList = ({
  questionId,
  initialMeans,
}: {
  questionId: number;
  initialMeans?: MeanSelect[];
}) => {
  const { data: fetchedMeans, isLoading } = useSupervisorMeans(questionId);
  const means: MeanSelect[] = fetchedMeans ?? initialMeans ?? [];

  if (isLoading && !initialMeans) {
    return <Skeleton className="h-14 w-full rounded-xl" />;
  }

  return (
    <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 text-xs">
      <div className="flex items-center gap-2 font-semibold text-emerald-400 text-[11px] uppercase tracking-wider">
        <FileCheck className="size-3.5 shrink-0" />
        <span>Suggested Means for Verification (MOVs)</span>
      </div>

      {means.length === 0 ? (
        <p className="mt-1 pl-5 text-[11px] italic text-muted-foreground/70">
          No specific verification documents configured for this statement.
        </p>
      ) : (
        <div className="mt-2.5 flex flex-wrap gap-2">
          {means.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 rounded-lg border border-emerald-500/15 bg-background/60 px-3 py-1.5 text-xs font-medium text-foreground/90"
            >
              <CheckCircle2 className="size-3.5 shrink-0 text-emerald-400" />
              <span>{item.descriptor}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const EvaluationFormPreview = ({
  type,
  formTree,
  triggerText = "Preview Form",
  variant = "outline",
  size = "sm",
  className,
}: EvaluationFormPreviewProps) => {
  const [open, setOpen] = useState(false);
  const [previewAnswers, setPreviewAnswers] = useState<Record<number, number>>({});

  const formMin = formTree.min_rating ?? 1;
  const formMax = formTree.max_rating ?? 5;

  // Dynamic Score Bounds Scale Generation
  const dynamicScale = Array.from(
    { length: Math.max(1, formMax - formMin + 1) },
    (_, i) => formMin + i,
  );

  const handleSelectRating = (questionId: number, rating: number) => {
    setPreviewAnswers((prev) => ({ ...prev, [questionId]: rating }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className ?? "h-8 cursor-pointer gap-1.5 rounded-lg text-xs font-medium"}
        >
          <Eye className="size-3.5 text-muted-foreground" />
          {triggerText && <span>{triggerText}</span>}
        </Button>
      </DialogTrigger>

      <DialogContent className="flex h-[88vh] w-full max-w-4xl sm:max-w-4xl flex-col overflow-hidden rounded-2xl border border-border/80 bg-card p-0 shadow-2xl">
        {/* Header */}
        <DialogHeader className="flex shrink-0 flex-row items-center justify-between border-b px-6 py-4 bg-muted/20">
          <div>
            <div className="flex items-center gap-2.5">
              <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">
                {formTree.title}
              </DialogTitle>
              <Badge
                variant="outline"
                className={`capitalize text-[11px] px-2.5 py-0.5 rounded-md font-medium ${
                  type === "student"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : "border-sky-500/30 bg-sky-500/10 text-sky-400"
                }`}
              >
                {type} Mode ({formMin}–{formMax} Scale)
              </Badge>
            </div>
            <DialogDescription className="mt-0.5 text-xs text-muted-foreground">
              {formTree.description || "Live respondent evaluation perspective."}
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Scrollable Main Area */}
        <ScrollArea className="flex-1 px-6 py-5">
          <div className="flex w-full flex-col gap-6 pb-4">
            {/* Dynamic Rating Scale Standard Box */}
            <div className="rounded-xl border border-border/50 bg-muted/30 p-4 space-y-3">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                <HelpCircle className="size-3.5 text-primary" />
                <span>
                  Configured Score Scale Bounds ({formMin} to {formMax})
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {dynamicScale.map((score) => (
                  <div
                    key={score}
                    className="flex items-center gap-2 rounded-lg border border-border/40 bg-card/80 px-3 py-1.5 text-left"
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 font-mono text-xs font-bold text-emerald-400">
                      {score}
                    </span>
                    <span className="text-xs font-medium text-foreground/90">Score {score}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Empty State */}
            {formTree.categories.length === 0 && (
              <div className="py-16 text-center text-xs text-muted-foreground">
                No criteria sections or questions available to preview.
              </div>
            )}

            {/* Category Sections */}
            {formTree.categories.map((category, catIdx) => (
              <div key={category.id} className="space-y-3">
                {/* Category Section Bar */}
                <div className="flex items-center gap-2.5 border-b border-border/60 pb-2.5 pt-1">
                  <span className="flex h-5 items-center justify-center rounded-md bg-emerald-500/10 px-2 font-mono text-[11px] font-bold text-emerald-400">
                    SECTION {String(catIdx + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-sm font-semibold tracking-tight text-foreground">
                    {category.name}
                  </h3>
                </div>

                {category.description && (
                  <p className="text-xs text-muted-foreground/80 pl-0.5">{category.description}</p>
                )}

                {/* Questions List */}
                <div className="space-y-3">
                  {category.questions.length === 0 ? (
                    <p className="rounded-xl border border-dashed p-3.5 text-xs italic text-muted-foreground">
                      No question items under this category.
                    </p>
                  ) : (
                    category.questions.map((q: QuestionWithMeans, qIdx) => {
                      const qMax = q.max_rating ?? formMax;
                      const itemScale = Array.from(
                        { length: Math.max(1, qMax - formMin + 1) },
                        (_, i) => formMin + i,
                      );
                      const currentVal = previewAnswers[q.id];

                      return (
                        <div
                          key={q.id}
                          className="rounded-xl border border-border/50 bg-card/60 p-4 space-y-3 shadow-2xs transition-all hover:border-border/80"
                        >
                          {/* Top Row: Question Text + Rating Pill Buttons */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-muted font-mono text-[11px] font-semibold text-muted-foreground mt-0.5">
                                {catIdx + 1}.{qIdx + 1}
                              </span>
                              <p className="text-xs font-semibold leading-relaxed text-foreground">
                                {q.question}
                              </p>
                            </div>

                            {/* Interactive Score Buttons */}
                            <div className="flex flex-wrap items-center gap-1.5 shrink-0 self-end sm:self-center">
                              {itemScale.map((rating) => {
                                const isSelected = currentVal === rating;
                                return (
                                  <button
                                    key={rating}
                                    type="button"
                                    onClick={() => handleSelectRating(q.id, rating)}
                                    className={`flex size-8 cursor-pointer items-center justify-center rounded-lg border font-mono text-xs font-semibold transition-all duration-150 ${
                                      isSelected
                                        ? "border-emerald-500 bg-emerald-600 text-white shadow-xs scale-105"
                                        : "border-border/50 bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                                    }`}
                                  >
                                    {rating}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Supervisor MOVs Block */}
                          {type === "supervisor" && (
                            <QuestionMovList questionId={q.id} initialMeans={q.means} />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between border-t border-border/60 bg-muted/20 px-6 py-3">
          <span className="text-xs text-muted-foreground">
            Previewing as <strong className="text-foreground capitalize">{type}</strong> respondent
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen(false)}
            className="h-8 rounded-lg text-xs"
          >
            Close Preview
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
