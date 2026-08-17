import React from "react";
import { cn } from "@/lib/utils";

interface RatingPillGroupProps {
  minRating?: number;
  maxRating?: number;
  value?: number;
  disabled?: boolean;
  onChange: (rating: number) => void;
}

const ratingDescriptors: Record<number, string> = {
  1: "Unsatisfactory",
  2: "Fair",
  3: "Satisfactory",
  4: "Very Satisfactory",
  5: "Outstanding",
};

export const RatingPillGroup: React.FC<RatingPillGroupProps> = ({
  minRating = 1,
  maxRating = 5,
  value,
  disabled = false,
  onChange,
}) => {
  const scale = Array.from(
    { length: Math.max(1, maxRating - minRating + 1) },
    (_, i) => minRating + i,
  );

  return (
    <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0 w-full sm:w-auto">
      <div className="flex flex-wrap items-center gap-1.5">
        {scale.map((score) => {
          const isSelected = value === score;
          return (
            <button
              key={score}
              type="button"
              disabled={disabled}
              onClick={() => onChange(score)}
              className={cn(
                "flex h-9 min-w-9 px-2.5 cursor-pointer items-center justify-center rounded-xl border font-mono text-xs font-bold transition-all duration-150 select-none",
                isSelected
                  ? "border-emerald-500 bg-emerald-600 text-white shadow-xs scale-105"
                  : "border-border/60 bg-muted/30 text-muted-foreground hover:border-primary/40 hover:bg-muted hover:text-foreground",
                disabled && "cursor-not-allowed opacity-60 hover:scale-100",
              )}
            >
              {score}
            </button>
          );
        })}
      </div>

      {/* Selected Descriptor Feedback */}
      <div className="text-[10px] font-medium text-muted-foreground min-h-4">
        {value ? (
          <span className="text-emerald-500 font-semibold">
            Score {value}: {ratingDescriptors[value] ?? "Rated"}
          </span>
        ) : (
          <span className="italic text-muted-foreground/60">
            {minRating} (Lowest) to {maxRating} (Highest)
          </span>
        )}
      </div>
    </div>
  );
};
