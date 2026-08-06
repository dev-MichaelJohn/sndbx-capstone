import { Input } from "@/components/ui/input";
import { KeyRound } from "lucide-react";

export function PasswordRequestStep({ form }: { form: any }) {
  return (
    <div className="space-y-5 max-w-sm">
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-0.5">Current password</h4>
        <p className="text-xs text-muted-foreground mb-4">
          Enter your current password to receive an authorization code.
        </p>
      </div>

      <form.Field
        name="currentPassword"
        children={(field: any) => (
          <div className="space-y-2">
            <label
              htmlFor={field.name}
              className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
            >
              Password
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id={field.name}
                name={field.name}
                type="password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Enter current password"
                className="pl-9 h-9 text-sm bg-muted/30 border-border/60"
              />
            </div>
          </div>
        )}
      />
    </div>
  );
}
