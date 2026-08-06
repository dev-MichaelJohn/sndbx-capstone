import { Input } from "@/components/ui/input";
import { ShieldCheck, ShieldAlert } from "lucide-react";

export function PasswordConfirmStep({ form }: { form: any }) {
  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-start gap-3 p-4 rounded-lg bg-emerald-500/8 border border-emerald-500/15">
        <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <p className="text-sm text-emerald-700 dark:text-emerald-400 leading-relaxed">
          Authorization code sent. Check your inbox and enter the 8-character code below.
        </p>
      </div>

      <form.Field
        name="code"
        children={(field: any) => (
          <div className="space-y-2">
            <label
              htmlFor={field.name}
              className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
            >
              Authorization code
            </label>
            <div className="relative max-w-50">
              <ShieldAlert className="absolute left-3 top-2.5 h-4 w-4 text-primary shrink-0" />
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="8K9P2X1Q"
                className="pl-9 h-9 text-sm font-mono uppercase tracking-[0.2em] bg-muted/30 border-border/60"
                maxLength={8}
              />
            </div>
          </div>
        )}
      />

      <div className="pt-4 border-t border-border/40 space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
          New credentials
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <form.Field
            name="newPassword"
            children={(field: any) => (
              <div className="space-y-2">
                <label htmlFor={field.name} className="text-sm font-medium text-foreground">
                  New password
                </label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Enter new password"
                  className="h-9 text-sm bg-muted/30 border-border/60"
                />
              </div>
            )}
          />

          <form.Field
            name="confirmPassword"
            children={(field: any) => (
              <div className="space-y-2">
                <label htmlFor={field.name} className="text-sm font-medium text-foreground">
                  Confirm password
                </label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Re-enter password"
                  className="h-9 text-sm bg-muted/30 border-border/60"
                />
              </div>
            )}
          />
        </div>
      </div>
    </div>
  );
}
