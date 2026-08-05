export const AnalyticsHeader = () => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Evaluation Analytics</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Institutional performance insights, sentiment breakdown, and evaluation rankings
          </p>
        </div>
      </div>
    </div>
  );
};
