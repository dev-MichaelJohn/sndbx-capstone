import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type AccentColor = "primary" | "emerald" | "amber" | "indigo" | "sky" | "violet" | "rose";

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  accent?: AccentColor;
  trend?: {
    value: string;
    positive?: boolean;
  };
  badgeText?: string;
  isLoading?: boolean;
}

const accentStyles: Record<
  AccentColor,
  { bar: string; iconBg: string; text: string; shadow: string; border: string }
> = {
  primary: {
    bar: "bg-primary",
    iconBg: "bg-primary/10 text-primary",
    text: "text-primary",
    shadow: "hover:shadow-primary/15",
    border: "hover:border-primary/40",
  },
  emerald: {
    bar: "bg-emerald-500",
    iconBg: "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400",
    text: "text-emerald-600 dark:text-emerald-400",
    shadow: "hover:shadow-emerald-500/15",
    border: "hover:border-emerald-500/40",
  },
  amber: {
    bar: "bg-amber-500",
    iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    text: "text-amber-600 dark:text-amber-400",
    shadow: "hover:shadow-amber-500/15",
    border: "hover:border-amber-500/40",
  },
  indigo: {
    bar: "bg-indigo-500",
    iconBg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    text: "text-indigo-600 dark:text-indigo-400",
    shadow: "hover:shadow-indigo-500/15",
    border: "hover:border-indigo-500/40",
  },
  sky: {
    bar: "bg-sky-500",
    iconBg: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    text: "text-sky-600 dark:text-sky-400",
    shadow: "hover:shadow-sky-500/15",
    border: "hover:border-sky-500/40",
  },
  violet: {
    bar: "bg-violet-500",
    iconBg: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    text: "text-violet-600 dark:text-violet-400",
    shadow: "hover:shadow-violet-500/15",
    border: "hover:border-violet-500/40",
  },
  rose: {
    bar: "bg-rose-500",
    iconBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    text: "text-rose-600 dark:text-rose-400",
    shadow: "hover:shadow-rose-500/15",
    border: "hover:border-rose-500/40",
  },
};

export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  (
    {
      title,
      value,
      subtitle,
      icon: Icon,
      accent = "primary",
      trend,
      badgeText,
      isLoading = false,
      className,
      ...props
    },
    ref,
  ) => {
    const styles = accentStyles[accent];

    return (
      <Card
        ref={ref}
        className={cn(
          "group relative overflow-hidden rounded-xl border border-border/60 bg-card shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
          styles.shadow,
          styles.border,
          className,
        )}
        {...props}
      >
        {/* Top Accent Bar */}
        <div
          className={cn(
            "absolute left-0 top-0 h-1 w-full transition-all duration-300 ease-out group-hover:scale-x-105",
            styles.bar,
          )}
        />

        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
                  {title}
                </p>
                {badgeText && (
                  <Badge
                    variant="outline"
                    className="px-1.5 py-0 text-[9px] font-mono border-border/60"
                  >
                    {badgeText}
                  </Badge>
                )}
              </div>

              <div className="flex items-baseline gap-2">
                {isLoading ? (
                  <div className="h-8 w-20 animate-pulse rounded-md bg-muted" />
                ) : (
                  <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl font-mono">
                    {value}
                  </h2>
                )}

                {trend && !isLoading && (
                  <span
                    className={cn(
                      "text-xs font-semibold font-mono",
                      trend.positive ? "text-emerald-500" : "text-rose-500",
                    )}
                  >
                    {trend.positive ? "↑" : "↓"} {trend.value}
                  </span>
                )}
              </div>

              {subtitle && (
                <p className="text-[11px] text-muted-foreground/80 truncate">{subtitle}</p>
              )}
            </div>

            {/* Icon Container */}
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110",
                styles.iconBg,
              )}
            >
              <Icon className="size-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  },
);

StatCard.displayName = "StatCard";
