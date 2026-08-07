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
  const effectiveMaxRating = question.max_rating ?? formMaxRating;

  return (
    <div className="rounded-xl border border-border/50 bg-card/60 p-4 space-y-3 shadow-2xs">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Statement Text Container */}
        <div className="flex items-start gap-3 flex-1 min-w-0 pr-2">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted font-mono text-xs font-semibold text-muted-foreground mt-0.5">
            {catIdx + 1}.{qIdx + 1}
          </span>
          <p className="text-xs font-semibold leading-relaxed text-foreground min-w-0 flex-1">
            {question.question}
          </p>
        </div>

        {/* Rating Group */}
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
