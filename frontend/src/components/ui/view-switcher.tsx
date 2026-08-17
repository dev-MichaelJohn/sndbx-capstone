import * as React from "react";
import { LayoutGrid, Table } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      className={cn(
        "inline-flex items-center rounded-lg border border-border/60 bg-muted/30 p-0.5",
        className,
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onChange("grid")}
        className={cn(
          "h-7 gap-1.5 rounded-md px-2.5 text-xs font-medium cursor-pointer transition-all",
          mode === "grid"
            ? "bg-card text-foreground shadow-2xs font-semibold"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <LayoutGrid className="size-3.5" />
        <span className="hidden sm:inline">Cards</span>
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onChange("table")}
        className={cn(
          "h-7 gap-1.5 rounded-md px-2.5 text-xs font-medium cursor-pointer transition-all",
          mode === "table"
            ? "bg-card text-foreground shadow-2xs font-semibold"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Table className="size-3.5" />
        <span className="hidden sm:inline">Table</span>
      </Button>
    </div>
  );
};
