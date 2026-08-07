interface RatingPillGroupProps {
  maxRating?: number;
  value?: number;
  disabled?: boolean;
  onChange: (rating: number) => void;
}

export const RatingPillGroup = ({
  maxRating = 5,
  value,
  disabled = false,
  onChange,
}: RatingPillGroupProps) => {
  const scale = Array.from({ length: maxRating }, (_, i) => i + 1);

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      {scale.map((score) => {
        const active = value === score;
        return (
          <button
            key={score}
            type="button"
            disabled={disabled}
            onClick={() => onChange(score)}
            className={`flex size-8 cursor-pointer items-center justify-center rounded-lg border font-mono text-xs font-semibold transition-all ${
              active
                ? "border-emerald-500 bg-emerald-600 text-white shadow-xs scale-105"
                : "border-border/50 bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
            } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
          >
            {score}
          </button>
        );
      })}
    </div>
  );
};
