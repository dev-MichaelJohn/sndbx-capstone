import { RatingPillGroup } from "./RatingPillGroup";
import { MovBadgeList } from "./MovBadgeList";
import type { EvaluationType, QuestionSelect } from "backend/types/evaluation-form.type";

interface QuestionItemProps {
  type: EvaluationType;
  question: QuestionSelect & { means?: any[] };
  catIdx: number;
  qIdx: number;
  formMinRating: number;
  formMaxRating: number;
  rating?: number;
  disabled?: boolean;
  onRatingChange: (questionId: number, rating: number) => void;
}

export const QuestionItem = ({
  type,
  question,
  catIdx,
  qIdx,
  formMinRating,
  formMaxRating,
  rating,
  disabled = false,
  onRatingChange,
}: QuestionItemProps) => {
  // Use question's max_rating override if available, else fallback to form level max_rating
  const effectiveMaxRating = question.max_rating ?? formMaxRating;

  return (
    <div className="rounded-xl border border-border/50 bg-card/60 p-4 space-y-3 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-muted font-mono text-[11px] font-semibold text-muted-foreground mt-0.5">
            {catIdx + 1}.{qIdx + 1}
          </span>
          <p className="text-xs font-semibold leading-relaxed text-foreground">
            {question.question}
          </p>
        </div>

        <RatingPillGroup
          minRating={formMinRating}
          maxRating={effectiveMaxRating}
          value={rating}
          disabled={disabled}
          onChange={(val) => onRatingChange(question.id, val)}
        />
      </div>

      {type === "supervisor" && <MovBadgeList means={question.means} />}
    </div>
  );
};
