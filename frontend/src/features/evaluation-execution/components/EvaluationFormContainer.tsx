import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EvaluationCategorySection } from "./EvaluationCategorySection";
import type { EvaluationFormTree, EvaluationType } from "backend/types/evaluation-form.type";

interface EvaluationFormContainerProps {
  type: EvaluationType;
  formTree: EvaluationFormTree;
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

  useEffect(() => {
    setRatings(initialRatings);
    setComment(initialComment);
  }, [initialRatings, initialComment]);

  const handleRatingChange = (qId: number, rating: number) => {
    if (isSubmitted) return;
    setRatings((prev) => ({ ...prev, [qId]: rating }));
  };

  const buildPayload = (is_draft: boolean) => {
    const ratingsArray = Object.entries(ratings).map(([qId, rating]) => ({
      question_id: Number(qId),
      rating,
    }));
    return { ratings: ratingsArray, comment, is_draft };
  };

  return (
    <div className="space-y-6">
      {formTree.categories.map((cat, idx) => (
        <EvaluationCategorySection
          key={cat.id}
          type={type}
          category={cat}
          catIdx={idx}
          ratingsMap={ratings}
          disabled={isSubmitted || isSaving}
          onRatingChange={handleRatingChange}
        />
      ))}

      {/* Qualitative Feedback */}
      <div className="space-y-2 pt-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Qualitative Feedback / Comments
        </label>
        <Textarea
          value={comment}
          disabled={isSubmitted || isSaving}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Enter constructive feedback or observations..."
          className="min-h-24 text-xs"
        />
      </div>

      {/* Actions */}
      {!isSubmitted && (
        <div className="flex items-center justify-end gap-2 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isSaving}
            onClick={() => onSave(buildPayload(true))}
            className="h-8 text-xs"
          >
            Save Draft
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={isSaving}
            onClick={() => onSave(buildPayload(false))}
            className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            {isSaving ? "Submitting..." : "Final Submit"}
          </Button>
        </div>
      )}
    </div>
  );
};
