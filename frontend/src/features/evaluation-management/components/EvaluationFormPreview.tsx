import { useState } from "react";
import { Eye, FileCheck, HelpCircle } from "lucide-react";

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
import type { EvaluationFormTree, EvaluationType } from "backend/types/evaluation-form.type";

interface EvaluationFormPreviewProps {
  type: EvaluationType;
  formTree: EvaluationFormTree;
  triggerText?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "icon";
}

const RATING_LEGEND = [
  { score: 1, label: "Poor" },
  { score: 2, label: "Fair" },
  { score: 3, label: "Satisfactory" },
  { score: 4, label: "Very Good" },
  { score: 5, label: "Outstanding" },
];

const QuestionMovList = ({
  questionId,
  initialMeans,
}: {
  questionId: number;
  initialMeans?: any[];
}) => {
  const { data: fetchedMeans, isLoading } = useSupervisorMeans(questionId);
  const means = fetchedMeans ?? initialMeans ?? [];

  if (isLoading && !initialMeans) {
    return <Skeleton className="h-16 w-full rounded-xl" />;
  }

  return (
    <div className="rounded-xl border bg-muted/20 p-4 text-xs space-y-2">
      <div className="flex items-center gap-2 font-semibold text-foreground text-[11px] uppercase tracking-wider">
        <FileCheck className="size-4 text-primary shrink-0" />
        <span>Suggested Means for Verification (MOVs)</span>
      </div>

      {means.length === 0 ? (
        <p className="italic text-muted-foreground text-[11px] pl-6">
          No specific verification documents configured for this statement.
        </p>
      ) : (
        <ul className="list-disc list-inside space-y-1.5 text-muted-foreground pl-1 leading-relaxed">
          {means.map((item: any, idx: number) => {
            const label = typeof item === "string" ? item : item.descriptor;
            return (
              <li key={item.id ?? idx} className="text-foreground/90 font-medium">
                {label}
              </li>
            );
          })}
        </ul>
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
}: EvaluationFormPreviewProps) => {
  const [open, setOpen] = useState(false);
  const [previewAnswers, setPreviewAnswers] = useState<Record<number, number>>({});

  const handleSelectRating = (questionId: number, rating: number) => {
    setPreviewAnswers((prev) => ({ ...prev, [questionId]: rating }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className="gap-1.5 rounded-lg">
          <Eye className="size-3.5" />
          {triggerText && <span className="text-xs">{triggerText}</span>}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-5xl max-w-[95vw] w-full h-[88vh] flex flex-col p-0 overflow-hidden rounded-2xl border border-border shadow-2xl">
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between border-b px-8 py-5 bg-card shrink-0">
          <div>
            <div className="flex items-center gap-2.5">
              <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                {formTree.title}
              </DialogTitle>
              <Badge
                variant={type === "student" ? "default" : "secondary"}
                className="capitalize text-[11px] px-2.5 py-0.5 rounded-full font-medium"
              >
                {type} Mode
              </Badge>
            </div>
            <DialogDescription className="mt-1 text-xs text-muted-foreground">
              {formTree.description || "Live respondent evaluation perspective."}
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Scrollable Body */}
        <ScrollArea className="flex-1 px-8 py-6">
          <div className="w-full flex flex-col gap-8 pb-6">
            {/* Rating Scale Standard Box */}
            <div className="rounded-xl border bg-card p-4 space-y-2.5 shadow-2xs">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <HelpCircle className="size-3.5 text-primary" />
                <span>Rating Scale Standard</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {RATING_LEGEND.map((item) => (
                  <div
                    key={item.score}
                    className="flex items-center justify-center gap-2 rounded-lg border bg-muted/20 p-2 text-center"
                  >
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
                      {item.score}
                    </span>
                    <span className="text-xs font-medium text-foreground truncate">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Empty State */}
            {formTree.categories.length === 0 && (
              <div className="py-20 text-center text-sm text-muted-foreground">
                No criteria sections or questions available to preview.
              </div>
            )}

            {/* Category Sections */}
            {formTree.categories.map((category, catIdx) => (
              <div key={category.id} className="space-y-4">
                {/* Category Title */}
                <div className="flex items-center gap-3 border-b pb-3">
                  <span className="flex h-6 items-center justify-center rounded-md bg-primary/10 px-2.5 font-mono text-xs font-bold text-primary">
                    SECTION {String(catIdx + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-base font-semibold tracking-tight text-foreground">
                    {category.name}
                  </h3>
                </div>

                {category.description && (
                  <p className="text-xs text-muted-foreground pl-0.5 -mt-2">
                    {category.description}
                  </p>
                )}

                {/* Questions List */}
                <div className="space-y-3">
                  {category.questions.length === 0 ? (
                    <p className="p-4 text-xs italic text-muted-foreground rounded-xl border bg-card">
                      No question items under this category.
                    </p>
                  ) : (
                    category.questions.map((q, qIdx) => {
                      const scale = Array.from({ length: q.max_rating }, (_, i) => i + 1);
                      const currentVal = previewAnswers[q.id];
                      const initialMovs =
                        (q as any).supervisor_means ||
                        (q as any).supervisorMeans ||
                        (q as any).means ||
                        (q as any).descriptors;

                      return (
                        <div
                          key={q.id}
                          className="rounded-xl border bg-card p-5 space-y-4 shadow-2xs hover:border-border/80 transition-all"
                        >
                          {/* Top Row: Question Text + Rating Buttons */}
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted font-mono text-xs font-semibold text-muted-foreground mt-0.5">
                                {catIdx + 1}.{qIdx + 1}
                              </span>
                              <p className="text-sm font-semibold leading-relaxed text-foreground pt-0.5">
                                {q.question}
                              </p>
                            </div>

                            {/* Score Pills */}
                            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start">
                              {scale.map((rating) => {
                                const isSelected = currentVal === rating;
                                return (
                                  <button
                                    key={rating}
                                    type="button"
                                    onClick={() => handleSelectRating(q.id, rating)}
                                    className={`flex h-9 w-9 items-center justify-center rounded-lg border text-xs font-bold transition-all duration-150 ${
                                      isSelected
                                        ? "border-primary bg-primary text-primary-foreground shadow-md scale-105"
                                        : "border-border/80 bg-background hover:bg-accent hover:border-accent-foreground/30 text-muted-foreground hover:text-foreground"
                                    }`}
                                  >
                                    {rating}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Dedicated MOV Card (Supervisor Mode Only) */}
                          {type === "supervisor" && (
                            <QuestionMovList questionId={q.id} initialMeans={initialMovs} />
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
        <div className="border-t px-8 py-4 flex items-center justify-between bg-card shrink-0">
          <span className="text-xs text-muted-foreground">
            Previewing as <strong className="text-foreground capitalize">{type}</strong> respondent
          </span>
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
            Close Preview
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
