import React, { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  badge?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  badge,
  actions,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/50 pb-5",
        className,
      )}
    >
      <div className="space-y-1.5 min-w-0 flex-1">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1"
          >
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.label}>
                {idx > 0 && <span className="text-muted-foreground/40">/</span>}
                {crumb.href ? (
                  <a
                    href={crumb.href}
                    className="hover:text-foreground transition-colors font-medium hover:underline underline-offset-4"
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-foreground font-semibold truncate">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        <div className="flex flex-wrap items-center gap-2.5">
          {badge && <div className="shrink-0">{badge}</div>}
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">{title}</h1>
        </div>

        {description && (
          <p className="text-xs text-muted-foreground sm:text-sm leading-relaxed max-w-3xl">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">{actions}</div>
      )}
    </div>
  );
};
