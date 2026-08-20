import React, { useMemo } from "react";
import { cn } from "@/lib/utils";

interface RatingPillGroupProps {
  minRating?: number;
  maxRating?: number;
  value?: number;
  disabled?: boolean;
  onChange: (rating: number) => void;
}

// Adaptive qualitative descriptors derived from dynamic percentage
const getDynamicDescriptor = (
  score: number,
  min: number,
  max: number,
): { label: string; color: string } => {
  if (max === min) return { label: "Standard Rating", color: "text-primary" };

  const ratio = (score - min) / (max - min);

  if (ratio >= 0.9)
    return { label: "Outstanding / Exceptional", color: "text-emerald-500 font-bold" };
  if (ratio >= 0.7)
    return { label: "Very Satisfactory / High Quality", color: "text-sky-500 font-semibold" };
  if (ratio >= 0.45)
    return { label: "Satisfactory / Meets Standards", color: "text-amber-500 font-semibold" };
  if (ratio >= 0.2)
    return { label: "Fair / Needs Minor Improvement", color: "text-orange-500 font-medium" };
  return { label: "Unsatisfactory / Needs Attention", color: "text-rose-500 font-medium" };
};

// Color classes based on position along the scale
const getScoreButtonStyles = (score: number, min: number, max: number, isSelected: boolean) => {
  if (!isSelected) {
    return "border-border/60 bg-card text-muted-foreground hover:border-primary/50 hover:bg-muted hover:text-foreground";
  }

  const ratio = (score - min) / Math.max(1, max - min);

  if (ratio >= 0.75) {
    return "border-emerald-500 bg-emerald-600 text-white shadow-xs scale-105";
  }
  if (ratio >= 0.4) {
    return "border-sky-500 bg-sky-600 text-white shadow-xs scale-105";
  }
  if (ratio >= 0.2) {
    return "border-amber-500 bg-amber-600 text-white shadow-xs scale-105";
  }
  return "border-rose-500 bg-rose-600 text-white shadow-xs scale-105";
};

export const RatingPillGroup: React.FC<RatingPillGroupProps> = ({
  minRating = 1,
  maxRating = 5,
  value,
  disabled = false,
  onChange,
}) => {
  const scale = useMemo(() => {
    const total = Math.max(1, maxRating - minRating + 1);
    return Array.from({ length: total }, (_, i) => minRating + i);
  }, [minRating, maxRating]);

  const descriptor = useMemo(() => {
    if (!value) return null;
    return getDynamicDescriptor(value, minRating, maxRating);
  }, [value, minRating, maxRating]);

  const handleKeyDown = (e: React.KeyboardEvent, score: number) => {
    if (disabled) return;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(maxRating, (value ?? score) + 1);
      onChange(next);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      const prev = Math.max(minRating, (value ?? score) - 1);
      onChange(prev);
    }
  };

  return (
    <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0 w-full sm:w-auto">
      <div
        role="radiogroup"
        aria-label="Rating scale"
        className="flex flex-wrap items-center gap-1.5"
      >
        {scale.map((score) => {
          const isSelected = value === score;
          const buttonStyle = getScoreButtonStyles(score, minRating, maxRating, isSelected);

          return (
            <button
              key={score}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => onChange(score)}
              onKeyDown={(e) => handleKeyDown(e, score)}
              className={cn(
                "flex h-9 min-w-9 px-2.5 cursor-pointer items-center justify-center rounded-xl border font-mono text-xs font-bold transition-[color,background-color,border-color,transform,box-shadow] duration-150 select-none active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                buttonStyle,
                disabled && "cursor-not-allowed opacity-60 hover:scale-100 active:scale-100",
              )}
            >
              {score}
            </button>
          );
        })}
      </div>

      {/* Semantic Indicator */}
      <div className="text-[11px] font-medium text-muted-foreground min-h-4 tracking-tight">
        {descriptor && value ? (
          <span className={descriptor.color}>
            Score {value}: {descriptor.label}
          </span>
        ) : (
          <span className="italic text-muted-foreground/60 font-mono text-[10px]">
            Scale: {minRating} (Min) → {maxRating} (Max)
          </span>
        )}
      </div>
    </div>
  );
};
