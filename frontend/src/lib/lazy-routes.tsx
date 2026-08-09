import { lazy, Suspense, type ComponentType } from "react";
import { Loader2 } from "lucide-react";

/**
 * Fallback spinner component rendered while React Suspense loads page chunks.
 */
export const PageLoader = () => (
  <div className="flex h-full min-h-[60vh] w-full flex-col items-center justify-center gap-2 p-6 text-xs text-muted-foreground">
    <Loader2 className="size-5 animate-spin text-primary" />
    <span>Loading page module...</span>
  </div>
);

/**
 * Higher-Order Component that wraps dynamically imported route components in a Suspense boundary.
 */
export const lazyLoad = <T extends ComponentType<any>>(importFn: () => Promise<{ default: T }>) => {
  const LazyComponent = lazy(importFn);

  return (props: any) => (
    <Suspense fallback={<PageLoader />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Lazy Loaded Route Exports
export const LazyAnalyticsPage = lazyLoad(
  () => import("@/features/analytics/page/EvaluationAnalyticsPage"),
);
export const LazyReportDetailPage = lazyLoad(
  () => import("@/features/evaluation-report/page/EvaluationReportDetailPage"),
);
export const LazySystemLogsPage = lazyLoad(() => import("@/features/logs/page/SystemLogsPage"));
export const LazyPublicLandingPage = lazyLoad(() => import("@/components/PublicLandingPage"));
