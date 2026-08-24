// frontend/src/features/account-settings/components/PasswordConfirmStep.tsx
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ShieldCheck, Eye, EyeOff } from "lucide-react";

const MAX_OTP_LENGTH = 8;
const OTPSlots = () =>
  Array.from({ length: MAX_OTP_LENGTH }, (_, index) => (
    <InputOTPSlot key={index} index={index} className="flex-1 text-sm font-bold font-mono" />
  ));

export function PasswordConfirmStep({ form }: { form: any }) {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
              className="text-xs font-medium text-muted-foreground uppercase tracking-wider block"
            >
              Authorization code
            </label>
            <InputOTP
              id={field.name}
              name={field.name}
              maxLength={MAX_OTP_LENGTH}
              containerClassName="w-full"
              value={field.state.value}
              onChange={(value) => field.handleChange(value.toUpperCase())}
              onBlur={field.handleBlur}
            >
              <InputOTPGroup className="w-full">{OTPSlots()}</InputOTPGroup>
            </InputOTP>
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
                <div className="relative flex items-center">
                  <Input
                    id={field.name}
                    name={field.name}
                    type={showNewPassword ? "text" : "password"}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Enter new password"
                    className="h-9 pr-10 text-sm bg-muted/30 border-border/60"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 size-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </Button>
                </div>
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
                <div className="relative flex items-center">
                  <Input
                    id={field.name}
                    name={field.name}
                    type={showConfirmPassword ? "text" : "password"}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Re-enter password"
                    className="h-9 pr-10 text-sm bg-muted/30 border-border/60"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 size-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          />
        </div>
      </div>
    </div>
  );
}
