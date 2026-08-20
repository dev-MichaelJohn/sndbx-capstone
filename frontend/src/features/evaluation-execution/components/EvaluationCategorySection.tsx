import { QuestionItem } from "./QuestionItem";
import type { EvaluationCategoryNode, EvaluationType } from "backend/types/evaluation-form.type";

interface EvaluationCategorySectionProps {
  type: EvaluationType;
  category: EvaluationCategoryNode;
  catIdx: number;
  formMinRating: number;
  formMaxRating: number;
  ratingsMap: Record<number, number>;
  disabled?: boolean;
  onRatingChange: (questionId: number, rating: number) => void;
}

export const EvaluationCategorySection = ({
  type,
  category,
  catIdx,
  formMinRating,
  formMaxRating,
  ratingsMap,
  disabled = false,
  onRatingChange,
}: EvaluationCategorySectionProps) => {
  return (
    <section className="space-y-3.5 scroll-mt-24">
      <div className="flex items-center gap-2.5 border-b border-border/60 pb-2.5 pt-1">
        <span className="flex h-5.5 items-center justify-center rounded-md bg-primary/10 px-2 font-mono text-[11px] font-bold text-primary border border-primary/20">
          SECTION {String(catIdx + 1).padStart(2, "0")}
        </span>
        <h3 className="text-sm font-bold tracking-tight text-foreground sm:text-base">
          {category.name}
        </h3>
      </div>

      {category.description && (
        <p className="text-xs text-muted-foreground/90 pl-1 leading-relaxed">
          {category.description}
        </p>
      )}

      <div className="space-y-3">
        {category.questions.map((q, qIdx) => (
          <QuestionItem
            key={q.id}
            type={type}
            question={q}
            catIdx={catIdx}
            qIdx={qIdx}
            formMinRating={formMinRating}
            formMaxRating={formMaxRating}
            rating={ratingsMap[q.id]}
            disabled={disabled}
            onRatingChange={onRatingChange}
          />
        ))}
      </div>
    </section>
  );
};
