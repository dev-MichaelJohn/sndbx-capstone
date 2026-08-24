import { useState, useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { Navigate, Outlet } from "react-router";
import { ShieldAlert, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

import { useUser } from "@/features/auth/context/user.context";
import {
  useRequestEmailVerification,
  useConfirmEmailVerification,
  useVerificationStatus,
} from "@/features/account-settings/api/account-settings.service";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VerifyEmailConfirmSchema } from "backend/types/auth.type";

const MAX_OTP_LENGTH = 8;
const OTPSlots = () =>
  Array.from({ length: MAX_OTP_LENGTH }, (_, index) => (
    <InputOTPSlot key={index} index={index} className="h-9 flex-1 text-xs font-bold font-mono" />
  ));

export const RequireVerification = () => {
  const { user, isLoading: isUserLoading, logout } = useUser();
  const { data: statusData, isLoading: isStatusLoading } = useVerificationStatus(Boolean(user));

  const requestOtpMutation = useRequestEmailVerification();
  const confirmOtpMutation = useConfirmEmailVerification();

  const [step, setStep] = useState<"PROMPT" | "VERIFY">("PROMPT");
  const [resendAt, setResendAt] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!resendAt) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((resendAt - Date.now()) / 1000));
      setCountdown(remaining);
      if (remaining === 0) setResendAt(null);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendAt]);

  const form = useForm({
    defaultValues: { code: "" },
    onSubmit: async ({ value }) => {
      setErrorMessage(null);
      const validation = VerifyEmailConfirmSchema.safeParse(value);
      if (!validation.success) {
        const msg = validation.error.issues[0]?.message ?? "Invalid OTP code format.";
        setErrorMessage(msg);
        toast.error(msg);
        return;
      }

      try {
        await confirmOtpMutation.mutateAsync(value);
        toast.success("Account verified successfully! Welcome to PIT-FES.");
      } catch (error: any) {
        const msg = error?.message ?? "Failed to verify code.";
        setErrorMessage(msg);
        toast.error(msg);
      }
    },
  });

  const handleRequestOtp = () => {
    setErrorMessage(null);
    requestOtpMutation.mutate(undefined, {
      onSuccess: (data) => {
        toast.success("Verification code sent to your registered email.");
        if (data?.resendAt) setResendAt(data.resendAt);
        setStep("VERIFY");
      },
      onError: (error) => {
        const msg = error.message || "Failed to send verification code.";
        setErrorMessage(msg);
        toast.error(msg);
      },
    });
  };

  if (isUserLoading || (user && isStatusLoading)) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-xs font-mono text-muted-foreground">Verifying security state...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth/login" replace />;

  const isVerified = statusData?.isVerified ?? (user as any)?.is_verified;
  if (isVerified) return <Outlet />;

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-muted/20 p-4">
      <Card className="w-full max-w-sm rounded-2xl border border-border/80 bg-card p-2 shadow-xl">
        {/* Centered Icon Header */}
        <CardHeader className="flex flex-col items-center text-center pb-2 pt-4 px-4 space-y-1">
          <div className="flex size-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 mb-1.5 shadow-2xs">
            <ShieldAlert className="size-5.5" />
          </div>
          <CardTitle className="text-base font-bold tracking-tight text-foreground">
            Email Verification Required
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground leading-snug px-1">
            {step === "PROMPT"
              ? `Please verify your email (${user.email}) to unlock the evaluation portal.`
              : `An 8-character code was sent to ${user.email}. Enter it below.`}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3.5 pt-1 px-4 pb-4">
          {errorMessage && (
            <div className="flex items-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 p-2.5 text-xs text-rose-400">
              <AlertCircle className="size-3.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {step === "PROMPT" ? (
            <div className="flex flex-col gap-2 pt-1">
              <Button
                onClick={handleRequestOtp}
                disabled={requestOtpMutation.isPending || countdown > 0}
                className="h-8.5 text-xs font-semibold bg-primary text-primary-foreground cursor-pointer rounded-lg"
              >
                {requestOtpMutation.isPending
                  ? "Sending Code..."
                  : countdown > 0
                    ? `Resend Code in ${countdown}s`
                    : "Send Verification Code"}
              </Button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
              className="space-y-3"
            >
              <form.Field
                name="code"
                children={(field) => (
                  <div className="space-y-1 flex flex-col items-center">
                    <InputOTP
                      id={field.name}
                      name={field.name}
                      maxLength={MAX_OTP_LENGTH}
                      containerClassName="w-full justify-center"
                      value={field.state.value}
                      disabled={confirmOtpMutation.isPending}
                      onChange={(value) => {
                        setErrorMessage(null);
                        field.handleChange(value.toUpperCase());
                      }}
                      onBlur={field.handleBlur}
                    >
                      <InputOTPGroup className="w-full">{OTPSlots()}</InputOTPGroup>
                    </InputOTP>

                    {field.state.meta.errors.length > 0 && (
                      <p className="text-[11px] font-medium text-destructive text-center mt-1">
                        {field.state.meta.errors.join(", ")}
                      </p>
                    )}
                  </div>
                )}
              />

              <div className="flex flex-col gap-1.5 pt-0.5">
                <Button
                  type="submit"
                  disabled={confirmOtpMutation.isPending}
                  className="h-8.5 text-xs font-bold cursor-pointer rounded-lg"
                >
                  {confirmOtpMutation.isPending ? "Verifying..." : "Confirm Verification"}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleRequestOtp}
                  disabled={requestOtpMutation.isPending || countdown > 0}
                  className="h-7 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {countdown > 0 ? `Resend code in ${countdown}s` : "Resend Code"}
                </Button>
              </div>
            </form>
          )}

          <div className="border-t border-border/50 pt-2 text-center">
            <Button
              type="button"
              variant="link"
              onClick={() => logout()}
              className="text-[11px] text-muted-foreground hover:text-destructive cursor-pointer h-auto p-0"
            >
              Log Out of Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
