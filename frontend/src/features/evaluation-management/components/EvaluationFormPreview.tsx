import { useState, useMemo } from "react";
import { Eye, HelpCircle } from "lucide-react";

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
  formTree: EvaluationFormTree;
  triggerText?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "icon";
  className?: string;
}

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

  const formMin = Number(formTree?.min_rating ?? 1);
  const formMax = Number(formTree?.max_rating ?? 5);

  // Dynamic Scale from min to max (e.g. 1 to 6)
  const dynamicScale = useMemo(() => {
    const count = Math.max(1, formMax - formMin + 1);
    return Array.from({ length: count }, (_, i) => formMin + i);
  }, [formMin, formMax]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={
            className ??
            "h-8 cursor-pointer gap-1.5 rounded-lg text-xs font-medium active:scale-[0.96]"
          }
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
              <DialogTitle className="text-lg font-bold tracking-tight text-foreground">
                {formTree.title}
              </DialogTitle>
              <Badge
                variant="outline"
                className="capitalize text-[11px] px-2.5 py-0.5 rounded-md font-semibold border-primary/30 bg-primary/10 text-primary"
              >
                {type} Mode ({formMin}–{formMax} Scale)
              </Badge>
            </div>
            <DialogDescription className="mt-0.5 text-xs text-muted-foreground">
              {formTree.description || "Live respondent evaluation perspective."}
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Main Content */}
        <ScrollArea className="flex-1 px-6 py-5">
          <div className="flex w-full flex-col gap-6 pb-4">
            {/* Dynamic Scale Box */}
            <div className="rounded-xl border border-border/50 bg-muted/30 p-4 space-y-3">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                <HelpCircle className="size-3.5 text-primary" />
                <span>
                  Configured Score Scale Bounds ({formMin} to {formMax})
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {dynamicScale.map((score) => (
                  <div
                    key={score}
                    className="flex items-center gap-2 rounded-lg border border-border/40 bg-card px-3 py-1.5 text-left shadow-2xs"
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 font-mono text-xs font-bold text-primary">
                      {score}
                    </span>
                    <span className="text-xs font-semibold text-foreground">Score {score}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Categories & Statements */}
            {formTree.categories.map((category, catIdx) => (
              <div key={category.id} className="space-y-3">
                <div className="flex items-center gap-2.5 border-b border-border/60 pb-2.5 pt-1">
                  <span className="flex h-5 items-center justify-center rounded-md bg-primary/10 px-2 font-mono text-[11px] font-bold text-primary">
                    SECTION {String(catIdx + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-sm font-bold tracking-tight text-foreground">
                    {category.name}
                  </h3>
                </div>

                <div className="space-y-3">
                  {category.questions.map((q: QuestionWithMeans, qIdx) => {
                    const qMax = Number(q.max_rating ?? formMax);
                    const itemScale = Array.from(
                      { length: Math.max(1, qMax - formMin + 1) },
                      (_, i) => formMin + i,
                    );
                    const currentVal = previewAnswers[q.id];

                    return (
                      <div
                        key={q.id}
                        className="rounded-xl border border-border/50 bg-card p-4 space-y-3 shadow-2xs"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <span className="flex size-5.5 shrink-0 items-center justify-center rounded-md bg-muted font-mono text-[11px] font-bold text-muted-foreground mt-0.5">
                              {catIdx + 1}.{qIdx + 1}
                            </span>
                            <p className="text-xs font-semibold leading-relaxed text-foreground sm:text-sm">
                              {q.question}
                            </p>
                          </div>

                          {/* Dynamic Buttons Rendering up to Max (e.g. 1 to 6) */}
                          <div className="flex flex-wrap items-center gap-1.5 shrink-0 self-end sm:self-center">
                            {itemScale.map((rating) => {
                              const isSelected = currentVal === rating;
                              return (
                                <button
                                  key={rating}
                                  type="button"
                                  onClick={() =>
                                    setPreviewAnswers((prev) => ({ ...prev, [q.id]: rating }))
                                  }
                                  className={`flex size-8 cursor-pointer items-center justify-center rounded-lg border font-mono text-xs font-bold transition-all duration-150 active:scale-[0.96] ${
                                    isSelected
                                      ? "border-primary bg-primary text-primary-foreground shadow-xs scale-105"
                                      : "border-border/60 bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                                  }`}
                                >
                                  {rating}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex shrink-0 items-center justify-between border-t border-border/60 bg-muted/20 px-6 py-3">
          <span className="text-xs text-muted-foreground font-medium">
            Previewing scale bound{" "}
            <strong className="text-foreground">
              {formMin} to {formMax}
            </strong>
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
