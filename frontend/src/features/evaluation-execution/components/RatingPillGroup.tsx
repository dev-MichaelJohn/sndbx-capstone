interface RatingPillGroupProps {
  minRating: number;
  maxRating: number;
  value?: number;
  disabled?: boolean;
  onChange: (rating: number) => void;
}

export const RatingPillGroup = ({
  minRating = 1,
  maxRating = 5,
  value,
  disabled = false,
  onChange,
}: RatingPillGroupProps) => {
  const scale = Array.from(
    { length: Math.max(1, maxRating - minRating + 1) },
    (_, i) => minRating + i,
  );

  return (
    <div className="flex flex-col items-end gap-1 shrink-0">
      <div className="flex flex-wrap items-center gap-1.5">
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

      {/* Score Direction Indicator */}
      <div className="flex w-full justify-between px-0.5 text-[9px] font-semibold text-muted-foreground/70 uppercase">
        <span>{minRating} (Lowest)</span>
        <span>{maxRating} (Highest)</span>
      </div>
    </div>
  );
};
