import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EvaluationCategorySection } from "./EvaluationCategorySection";
import { EvaluationHeaderProgress } from "./EvaluationHeaderProgress";
import type { EvaluationFormTree, EvaluationType } from "backend/types/evaluation-form.type";
import toast from "react-hot-toast";

interface EvaluationFormContainerProps {
  type: EvaluationType;
  formTree: EvaluationFormTree & { min_rating?: number; max_rating?: number };
  initialRatings?: Record<number, number>;
  initialComment?: string;
  isSubmitted?: boolean;
  isSaving?: boolean;
  onSave: (payload: {
    ratings: Array<{ question_id: number; rating: number }>;
    comment: string;
    is_draft: boolean;
  }) => void;
}

export const EvaluationFormContainer = ({
  type,
  formTree,
  initialRatings = {},
  initialComment = "",
  isSubmitted = false,
  isSaving = false,
  onSave,
}: EvaluationFormContainerProps) => {
  const [ratings, setRatings] = useState<Record<number, number>>(initialRatings);
  const [comment, setComment] = useState(initialComment);
  const [activeCatIndex, setActiveCatIndex] = useState(0);

  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [confirmDraftOpen, setConfirmDraftOpen] = useState(false);

  const categoryRefs = useRef<Array<HTMLDivElement | null>>([]);

  const formMin = formTree.min_rating ?? 1;
  const formMax = formTree.max_rating ?? 5;

  const totalQuestions = formTree.categories.reduce(
    (acc, cat) => acc + (cat.questions?.length || 0),
    0,
  );
  const answeredQuestionsCount = Object.keys(ratings).length;

  useEffect(() => {
    setRatings(initialRatings);
    setComment(initialComment);
  }, [initialRatings, initialComment]);

  const handleRatingChange = (qId: number, rating: number) => {
    if (isSubmitted) return;
    setRatings((prev) => ({ ...prev, [qId]: rating }));
  };

  const scrollToCategory = (idx: number) => {
    setActiveCatIndex(idx);
    categoryRefs.current[idx]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const buildPayload = (is_draft: boolean) => {
    const ratingsArray = Object.entries(ratings).map(([qId, rating]) => ({
      question_id: Number(qId),
      rating,
    }));
    return { ratings: ratingsArray, comment, is_draft };
  };

  const handleConfirmSaveDraft = () => {
    setConfirmDraftOpen(false);
    onSave(buildPayload(true));
  };

  const handleAttemptFinalSubmit = () => {
    if (answeredQuestionsCount < totalQuestions) {
      toast.error(
        `Please rate all statements before submitting. (${answeredQuestionsCount}/${totalQuestions} completed)`,
      );
      return;
    }
    setConfirmSubmitOpen(true);
  };

  const handleConfirmSubmit = () => {
    setConfirmSubmitOpen(false);
    onSave(buildPayload(false));
  };

  return (
    <>
      <div className="flex flex-col gap-6 relative pb-16">
        {/* Sticky Progress & Stepper */}
        <EvaluationHeaderProgress
          categories={formTree.categories}
          ratingsMap={ratings}
          totalQuestions={totalQuestions}
          activeCategoryIndex={activeCatIndex}
          onSelectCategory={scrollToCategory}
          isSubmitted={isSubmitted}
        />

        {/* Categories & Questions */}
        <div className="space-y-8 px-1">
          {formTree.categories.map((cat, idx) => (
            <div
              key={cat.id}
              ref={(el) => {
                categoryRefs.current[idx] = el;
              }}
            >
              <EvaluationCategorySection
                type={type}
                category={cat}
                catIdx={idx}
                formMinRating={formMin}
                formMaxRating={formMax}
                ratingsMap={ratings}
                disabled={isSubmitted || isSaving}
                onRatingChange={handleRatingChange}
              />
            </div>
          ))}

          {/* Qualitative Feedback */}
          <div className="space-y-2 pt-4 border-t border-border/60">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Qualitative Feedback / Comments
            </label>
            <Textarea
              value={comment}
              disabled={isSubmitted || isSaving}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Provide constructive observations or feedback..."
              className="min-h-28 text-xs rounded-xl bg-card"
            />
          </div>
        </div>

        {/* Floating Action Bar */}
        {!isSubmitted && (
          <div className="sticky bottom-0 z-10 flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/95 p-3.5 backdrop-blur-md shadow-lg">
            <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
              {answeredQuestionsCount} of {totalQuestions} criteria completed
            </span>

            <div className="flex items-center gap-2 ml-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSaving}
                onClick={() => setConfirmDraftOpen(true)}
                className="h-8 text-xs rounded-lg cursor-pointer"
              >
                Save Draft
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isSaving}
                onClick={handleAttemptFinalSubmit}
                className="h-8 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer font-medium"
              >
                {isSaving ? "Submitting..." : "Submit Evaluation"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialogs */}
      <AlertDialog open={confirmDraftOpen} onOpenChange={setConfirmDraftOpen}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold">
              Save Evaluation Draft?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Your current ratings will be saved as a draft. You can return to complete submission
              anytime before the window closes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving} className="h-8 rounded-lg text-xs">
              Continue Editing
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSaveDraft}
              disabled={isSaving}
              className="h-8 rounded-lg text-xs font-medium"
            >
              {isSaving ? "Saving Draft..." : "Yes, Save Draft"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmSubmitOpen} onOpenChange={setConfirmSubmitOpen}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold">
              Confirm Final Evaluation Submission?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Once submitted, ratings and qualitative comments will be locked and cannot be edited.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving} className="h-8 rounded-lg text-xs">
              Go Back
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSubmit}
              disabled={isSaving}
              className="h-8 rounded-lg bg-emerald-600 text-xs font-medium text-white hover:bg-emerald-500"
            >
              {isSaving ? "Submitting..." : "Yes, Submit Evaluation"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
