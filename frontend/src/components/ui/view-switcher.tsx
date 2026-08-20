import React from "react";
import { LayoutGrid, Table } from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewMode = "grid" | "table";

interface ViewSwitcherProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
  className?: string;
}

export const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ mode, onChange, className }) => {
  return (
    <div
      role="radiogroup"
      aria-label="View Mode Switcher"
      className={cn(
        "inline-flex h-8 items-center rounded-lg border border-border/60 bg-muted/40 p-0.5 text-muted-foreground shadow-2xs",
        className,
      )}
    >
      <button
        type="button"
        role="radio"
        aria-checked={mode === "grid"}
        onClick={() => onChange("grid")}
        className={cn(
          "flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition-[color,background-color,box-shadow,transform] duration-150 active:scale-[0.96] cursor-pointer",
          mode === "grid"
            ? "bg-card text-foreground shadow-2xs border border-border/50 font-bold"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
        )}
        title="Grid View"
      >
        <LayoutGrid className="size-3.5 shrink-0" />
        <span className="hidden sm:inline">Grid</span>
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={mode === "table"}
        onClick={() => onChange("table")}
        className={cn(
          "flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition-[color,background-color,box-shadow,transform] duration-150 active:scale-[0.96] cursor-pointer",
          mode === "table"
            ? "bg-card text-foreground shadow-2xs border border-border/50 font-bold"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
        )}
        title="Table View"
      >
        <Table className="size-3.5 shrink-0" />
        <span className="hidden sm:inline">Table</span>
      </button>
    </div>
  );
};
