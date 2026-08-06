import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCircle2, AlertTriangle, Shield, Mail, User } from "lucide-react";
import { useVerificationStatus } from "../api/account-settings.service";
import { useUser } from "@/features/auth/context/user.context";

export function AccountOverviewCard() {
  const { user } = useUser();
  const { data: status, isLoading } = useVerificationStatus();

  const initials = user?.personalDetails
    ? `${user.personalDetails.first_name?.[0] ?? ""}${user.personalDetails.last_name?.[0] ?? ""}`
    : "U";

  const fullName = user?.personalDetails
    ? `${user.personalDetails.first_name} ${user.personalDetails.last_name}`
    : "User Account";

  const isVerified = status?.isVerified;

  return (
    <div className="flex flex-col gap-4">
      {/* Section label */}
      <div className="flex items-center gap-2">
        <User className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Profile
        </span>
      </div>

      <Card className="w-full overflow-hidden border-border/50 shadow-none bg-card">
        {/* Identity Row */}
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            {/* Avatar + info */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="relative shrink-0">
                <Avatar className="h-14 w-14 ring-2 ring-border">
                  <AvatarFallback className="bg-primary/10 text-primary text-base font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {/* Online indicator */}
                <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-card" />
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="text-base font-semibold text-foreground truncate">{fullName}</h4>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{user?.email}</span>
                </p>
              </div>
            </div>

            {/* Roles */}
            <div className="flex flex-col gap-2 sm:items-end shrink-0">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                Roles
              </span>
              <div className="flex flex-wrap gap-1.5">
                {user?.roles?.map((role) => (
                  <Badge
                    key={role}
                    variant="secondary"
                    className="gap-1.5 text-[11px] font-mono tracking-wider px-2.5 py-1 bg-primary/8 text-primary border border-primary/15 hover:bg-primary/12 transition-colors"
                  >
                    <Shield className="h-3 w-3" />
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-6 sm:mx-8 h-px bg-border/50" />

        {/* Verification Row */}
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground mb-0.5">Email verification</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {isVerified
                  ? "Your address is verified. All features and mutations are unlocked."
                  : "Verify your email to unlock protected routes and system mutations."}
              </p>
            </div>

            <div className="shrink-0">
              {isLoading ? (
                <div className="h-8 w-28 rounded-full bg-muted animate-pulse" />
              ) : isVerified ? (
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    Verified
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20">
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                    Not verified
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
