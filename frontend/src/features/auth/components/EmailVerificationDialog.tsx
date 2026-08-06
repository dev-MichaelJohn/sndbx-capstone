import { useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import {
  useVerificationStatus,
  useRequestEmailVerification,
  useConfirmEmailVerification,
} from "@/features/account-settings/api/account-settings.service";
import { VerifyEmailConfirmSchema } from "backend/types/auth.type";

export default function EmailVerificationDialog() {
  const { data: status, isLoading: isCheckingStatus } = useVerificationStatus();
  const requestOtpMutation = useRequestEmailVerification();
  const confirmOtpMutation = useConfirmEmailVerification();

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"PROMPT" | "VERIFY">("PROMPT");
  const [resendAt, setResendAt] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Auto-open dialog if authenticated user is unverified
  useEffect(() => {
    if (!isCheckingStatus && status && !status.isVerified) {
      setIsOpen(true);
    } else if (status?.isVerified) {
      setIsOpen(false);
    }
  }, [status, isCheckingStatus]);

  // Resend cooldown timer
  useEffect(() => {
    if (!resendAt) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((resendAt - Date.now()) / 1000));
      setCountdown(remaining);
      if (remaining === 0) setResendAt(null);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendAt]);

  const handleRequestOtp = () => {
    requestOtpMutation.mutate(undefined, {
      onSuccess: (data) => {
        toast.success("Verification code sent to your registered email.");
        if (data?.resendAt) setResendAt(data.resendAt);
        setStep("VERIFY");
      },
      onError: (error) => toast.error(error.message),
    });
  };

  const form = useForm({
    defaultValues: {
      code: "",
    },
    onSubmit: async ({ value }) => {
      const validation = VerifyEmailConfirmSchema.safeParse(value);
      if (!validation.success) {
        toast.error(validation.error.issues[0]?.message ?? "Invalid OTP code format.");
        return;
      }

      try {
        await confirmOtpMutation.mutateAsync(value);
        toast.success("Email verified successfully!");
        setIsOpen(false);
      } catch (error: any) {
        toast.error(error?.message ?? "Failed to verify code.");
      }
    },
  });

  if (isCheckingStatus) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && setIsOpen(true)}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Account Verification Required</DialogTitle>
          <DialogDescription>
            {step === "PROMPT"
              ? "Your email address is currently unverified. You must verify your institutional account to proceed."
              : "Enter the 8-character verification code sent to your email address."}
          </DialogDescription>
        </DialogHeader>

        {step === "PROMPT" ? (
          <div className="flex flex-col gap-3 mt-4">
            <Button
              onClick={handleRequestOtp}
              disabled={requestOtpMutation.isPending || countdown > 0}
            >
              {requestOtpMutation.isPending
                ? "Sending code..."
                : countdown > 0
                  ? `Resend code in ${countdown}s`
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
            className="space-y-4 mt-2"
          >
            <form.Field
              name="code"
              children={(field) => (
                <div className="space-y-1.5">
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="ENTER 8-CHAR OTP"
                    className="text-center tracking-widest font-mono uppercase"
                    maxLength={8}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-xs text-destructive">{field.state.meta.errors.join(", ")}</p>
                  )}
                </div>
              )}
            />

            <div className="flex flex-col gap-2 pt-2">
              <Button type="submit" disabled={confirmOtpMutation.isPending}>
                {confirmOtpMutation.isPending ? "Verifying..." : "Confirm Verification"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={handleRequestOtp}
                disabled={requestOtpMutation.isPending || countdown > 0}
              >
                {countdown > 0 ? `Resend code in ${countdown}s` : "Resend Code"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
