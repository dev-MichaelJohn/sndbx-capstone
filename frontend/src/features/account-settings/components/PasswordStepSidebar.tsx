import { Check } from "lucide-react";

interface PasswordStepSidebarProps {
  step: "REQUEST" | "CONFIRM";
}

export function PasswordStepSidebar({ step }: PasswordStepSidebarProps) {
  return (
    <div className="lg:col-span-4 p-6 sm:p-8 bg-muted/25 border-b lg:border-b-0 lg:border-r border-border/50 flex flex-col gap-6">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Change password</h3>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          Two-step verification keeps your account secure. A code will be sent to your registered
          email before changes apply.
        </p>
      </div>

      <div className="flex flex-col gap-1 mt-auto">
        {/* Step 1 */}
        <div
          className={`group flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${step === "REQUEST" ? "bg-primary/8 text-foreground" : "text-muted-foreground"}`}
        >
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold shrink-0 transition-all duration-200 ${step === "REQUEST" ? "bg-primary text-primary-foreground" : step === "CONFIRM" ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"}`}
          >
            {step === "CONFIRM" ? <Check className="h-3.5 w-3.5" /> : "1"}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium leading-none">Re-authenticate</span>
            <span className="text-xs text-muted-foreground mt-0.5">Confirm current password</span>
          </div>
        </div>

        <div className="ml-[1.1rem] w-px h-4 bg-border/60" />

        {/* Step 2 */}
        <div
          className={`group flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${step === "CONFIRM" ? "bg-emerald-500/8 text-foreground" : "text-muted-foreground"}`}
        >
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold shrink-0 transition-all duration-200 ${step === "CONFIRM" ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"}`}
          >
            2
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium leading-none">Set new password</span>
            <span className="text-xs text-muted-foreground mt-0.5">
              Enter OTP and new credentials
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
