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
import { Check, BookmarkCheck, ShieldCheck } from "lucide-react";
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
    return { ratings: ratingsArray, comment: comment.trim(), is_draft };
  };

  const handleConfirmSaveDraft = () => {
    setConfirmDraftOpen(false);
    onSave(buildPayload(true));
  };

  const handleAttemptFinalSubmit = () => {
    if (answeredQuestionsCount < totalQuestions) {
      toast.error(
        `Please score all statements before finalizing (${answeredQuestionsCount}/${totalQuestions} completed).`,
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
        {/* Sticky Header HUD */}
        <EvaluationHeaderProgress
          categories={formTree.categories}
          ratingsMap={ratings}
          totalQuestions={totalQuestions}
          activeCategoryIndex={activeCatIndex}
          onSelectCategory={scrollToCategory}
          isSubmitted={isSubmitted}
        />

        {/* Categories and Question Statements */}
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

          {/* Qualitative Feedback Area */}
          <div className="space-y-2 pt-6 border-t border-border/60">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Qualitative Feedback & Observations (Optional)
            </label>
            <Textarea
              value={comment}
              disabled={isSubmitted || isSaving}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Provide constructive observations, recommendations, or qualitative feedback..."
              className="min-h-28 text-xs rounded-xl bg-card border-border/60 resize-y"
            />
          </div>
        </div>

        {/* Floating Action Bar */}
        {!isSubmitted && (
          <div className="sticky bottom-0 z-20 flex items-center justify-between gap-3 rounded-2xl border border-border/80 bg-background/90 p-3.5 backdrop-blur-xl shadow-xl">
            <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
              <strong className="text-foreground">{answeredQuestionsCount}</strong> of{" "}
              <strong>{totalQuestions}</strong> items scored
            </span>

            <div className="flex items-center gap-2 ml-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSaving}
                onClick={() => setConfirmDraftOpen(true)}
                className="h-8.5 text-xs rounded-xl cursor-pointer gap-1.5 active:scale-[0.96]"
              >
                <BookmarkCheck className="size-3.5" />
                <span>Save Draft</span>
              </Button>

              <Button
                type="button"
                size="sm"
                disabled={isSaving}
                onClick={handleAttemptFinalSubmit}
                className="h-8.5 text-xs rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer font-bold gap-1.5 shadow-sm active:scale-[0.96]"
              >
                <Check className="size-3.5" />
                <span>{isSaving ? "Submitting..." : "Finalize & Submit"}</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Draft Confirmation Alert */}
      <AlertDialog open={confirmDraftOpen} onOpenChange={setConfirmDraftOpen}>
        <AlertDialogContent className="rounded-2xl border border-border/80 bg-card shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold">
              Save Evaluation as Draft?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Your scored ratings will be saved securely. You can return to finalize and submit
              anytime before the evaluation window closes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving} className="h-8 rounded-lg text-xs">
              Continue Editing
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSaveDraft}
              disabled={isSaving}
              className="h-8 rounded-lg text-xs font-semibold"
            >
              {isSaving ? "Saving..." : "Yes, Save Draft"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Final Submit Confirmation Alert */}
      <AlertDialog open={confirmSubmitOpen} onOpenChange={setConfirmSubmitOpen}>
        <AlertDialogContent className="rounded-2xl border border-border/80 bg-card shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <ShieldCheck className="size-4.5 text-emerald-500 shrink-0" />
              <span>Confirm Final Evaluation Submission?</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Once submitted, all scored statements and qualitative comments will be{" "}
              <strong className="text-foreground font-semibold">permanently locked</strong> and
              computed into the instructor&apos;s CHED CMO 19 evaluation record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving} className="h-8 rounded-lg text-xs">
              Go Back
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSubmit}
              disabled={isSaving}
              className="h-8 rounded-lg bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-500 cursor-pointer"
            >
              {isSaving ? "Submitting..." : "Yes, Submit Evaluation"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
