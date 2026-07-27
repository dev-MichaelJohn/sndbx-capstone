export const UsersPage = () => {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="rounded-xl bg-muted/50 p-6">
        <h2 className="text-lg font-semibold">User Management</h2>
        <p className="text-sm text-muted-foreground">Create and manage system users.</p>
      </div>
      <div className="min-h-[20vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
    </div>
  );
};
