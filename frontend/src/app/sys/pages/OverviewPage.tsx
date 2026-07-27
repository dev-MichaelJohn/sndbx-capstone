export const OverviewPage = () => {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-muted/50 p-6">
          <h2 className="text-sm font-medium text-muted-foreground">Total Users</h2>
          <p className="text-3xl font-bold">—</p>
        </div>
        <div className="rounded-xl bg-muted/50 p-6">
          <h2 className="text-sm font-medium text-muted-foreground">Active Sessions</h2>
          <p className="text-3xl font-bold">—</p>
        </div>
        <div className="rounded-xl bg-muted/50 p-6">
          <h2 className="text-sm font-medium text-muted-foreground">Institutions</h2>
          <p className="text-3xl font-bold">—</p>
        </div>
      </div>
      <div className="min-h-[20vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
    </div>
  );
};
