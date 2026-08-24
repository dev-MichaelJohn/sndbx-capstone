import { useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useUser } from "@/features/auth/context/user.context";
import {
  useVerificationStatus,
  useRequestEmailVerification,
  useConfirmEmailVerification,
} from "@/features/account-settings/api/account-settings.service";
import { VerifyEmailConfirmSchema } from "backend/types/auth.type";

const MAX_OTP_LENGTH = 8;
const OTPSlots = () =>
  Array.from({ length: MAX_OTP_LENGTH }, (_, index) => (
    <InputOTPSlot key={index} index={index} className="flex-1 text-sm font-bold font-mono" />
  ));

export default function EmailVerificationDialog() {
  const { user, isLoading: isUserLoading } = useUser();
  const { data: status, isLoading: isCheckingStatus } = useVerificationStatus(Boolean(user));
  const requestOtpMutation = useRequestEmailVerification();
  const confirmOtpMutation = useConfirmEmailVerification();

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"PROMPT" | "VERIFY">("PROMPT");
  const [resendAt, setResendAt] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isUserLoading || isCheckingStatus) return;

    const isVerified = status?.isVerified ?? (user as any)?.is_verified;

    if (user && isVerified === false) {
      setIsOpen(true);
    } else if (isVerified === true) {
      setIsOpen(false);
    }
  }, [status, isCheckingStatus, user, isUserLoading]);

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
        toast.success("Email verified successfully!");
        setIsOpen(false);
      } catch (error: any) {
        const msg = error?.message ?? "Failed to verify code.";
        setErrorMessage(msg);
        toast.error(msg);
      }
    },
  });

  if (isUserLoading || !user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && setIsOpen(true)}>
      <DialogContent className="sm:max-w-md rounded-2xl" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Account Verification Required
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {step === "PROMPT"
              ? "Your email address is currently unverified. You must verify your institutional account to proceed."
              : "Enter the 8-character verification code sent to your registered email address."}
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-400">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {step === "PROMPT" ? (
          <div className="flex flex-col gap-3 mt-2">
            <Button
              onClick={handleRequestOtp}
              disabled={requestOtpMutation.isPending || countdown > 0}
              className="h-9 text-xs font-medium bg-primary text-primary-foreground cursor-pointer"
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
                <div className="space-y-1.5 flex flex-col items-center">
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
                    <p className="text-xs text-destructive text-center mt-1">
                      {field.state.meta.errors.join(", ")}
                    </p>
                  )}
                </div>
              )}
            />

            <div className="flex flex-col gap-2 pt-2">
              <Button
                type="submit"
                disabled={confirmOtpMutation.isPending}
                className="h-9 text-xs font-medium cursor-pointer"
              >
                {confirmOtpMutation.isPending ? "Verifying..." : "Confirm Verification"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={handleRequestOtp}
                disabled={requestOtpMutation.isPending || countdown > 0}
                className="h-8 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
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
