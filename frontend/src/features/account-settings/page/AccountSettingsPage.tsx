import { AccountOverviewCard } from "../components/AccountOverviewCard";
import { PasswordChangeCard } from "../components/PasswordChangeCard";

export default function AccountSettingsPage() {
  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
        {/* Page Header */}
        <div className="flex flex-col gap-1 pb-6 border-b border-border/50">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Account Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your identity, email verification, and security preferences.
          </p>
        </div>

        <div className="flex flex-col gap-6 w-full">
          <AccountOverviewCard />
          <PasswordChangeCard />
        </div>
      </div>
    </div>
  );
}
