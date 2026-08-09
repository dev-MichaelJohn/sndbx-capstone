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
            <div className="relative flex items-center">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id={field.name}
                name={field.name}
                type={showPassword ? "text" : "password"}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Enter current password"
                className="pl-9 pr-10 h-9 text-sm bg-muted/30 border-border/60"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-1 top-1/2 -translate-y-1/2 size-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </Button>
            </div>
          </div>
        )}
      />
    </div>
  );
}
