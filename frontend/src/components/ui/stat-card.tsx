import React from "react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  accent?: "primary" | "emerald" | "amber" | "indigo" | "rose" | "violet" | "sky";
  delta?: {
    value: string;
    isPositive: boolean;
    label?: string;
  };
  isLoading?: boolean;
  className?: string;
}

const accentVariants = {
  primary: {
    gradient: "from-primary/20 via-primary/5 to-transparent",
    iconBg: "bg-primary/10 text-primary border-primary/20",
    glow: "group-hover:shadow-primary/15",
    border: "group-hover:border-primary/40",
  },
  emerald: {
    gradient: "from-emerald-500/20 via-emerald-500/5 to-transparent",
    iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    glow: "group-hover:shadow-emerald-500/15",
    border: "group-hover:border-emerald-500/40",
  },
  amber: {
    gradient: "from-amber-500/20 via-amber-500/5 to-transparent",
    iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    glow: "group-hover:shadow-amber-500/15",
    border: "group-hover:border-amber-500/40",
  },
  indigo: {
    gradient: "from-indigo-500/20 via-indigo-500/5 to-transparent",
    iconBg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    glow: "group-hover:shadow-indigo-500/15",
    border: "group-hover:border-indigo-500/40",
  },
  rose: {
    gradient: "from-rose-500/20 via-rose-500/5 to-transparent",
    iconBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    glow: "group-hover:shadow-rose-500/15",
    border: "group-hover:border-rose-500/40",
  },
  violet: {
    gradient: "from-violet-500/20 via-violet-500/5 to-transparent",
    iconBg: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
    glow: "group-hover:shadow-violet-500/15",
    border: "group-hover:border-violet-500/40",
  },
  sky: {
    gradient: "from-sky-500/20 via-sky-500/5 to-transparent",
    iconBg: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
    glow: "group-hover:shadow-sky-500/15",
    border: "group-hover:border-sky-500/40",
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  accent = "primary",
  delta,
  isLoading = false,
  className,
}) => {
  const styles = accentVariants[accent] ?? accentVariants.primary;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-0 shadow-sm transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md",
        styles.border,
        styles.glow,
        className,
      )}
    >
      {/* Ambient Top Glow */}
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b opacity-60 transition-opacity duration-300 group-hover:opacity-100",
          styles.gradient,
        )}
      />

      <CardContent className="relative p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5 min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
              {title}
            </p>

            {isLoading ? (
              <div className="h-9 w-28 rounded-lg bg-muted/60 animate-pulse my-1" />
            ) : (
              <h3 className="font-mono text-2xl font-bold tracking-tight text-foreground sm:text-3xl tabular-nums">
                {value}
              </h3>
            )}

            {(subtitle || delta) && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {delta && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold border",
                      delta.isPositive
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
                    )}
                  >
                    <span>{delta.isPositive ? "↑" : "↓"}</span>
                    <span>{delta.value}</span>
                  </span>
                )}
                {subtitle && (
                  <p className="text-xs text-muted-foreground/80 truncate">{subtitle}</p>
                )}
              </div>
            )}
          </div>

          {/* Optical Centered Icon Container */}
          <div
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-xl border shadow-2xs transition-transform duration-200 group-hover:scale-105",
              styles.iconBg,
            )}
          >
            <Icon className="size-5 shrink-0" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
