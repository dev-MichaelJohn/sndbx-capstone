import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { KeyRound, Eye, EyeOff } from "lucide-react";

export function PasswordRequestStep({ form }: { form: any }) {
  const [showPassword, setShowPassword] = useState(false);

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
                type={showPassword ? "text" : "password"}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Enter current password"
                className="pl-9 pr-9 h-9 text-sm bg-muted/30 border-border/60"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-1 top-1 h-7 size-7 p-0 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </Button>
            </div>
          </div>
        )}
      />
    </div>
  );
}
