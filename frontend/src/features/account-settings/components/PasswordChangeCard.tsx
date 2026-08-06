import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { ArrowRight, RotateCcw, Check, Loader2, Lock } from "lucide-react";
import {
  useRequestPasswordChange,
  useConfirmPasswordChange,
} from "../api/account-settings.service";
import { ConfirmPasswordChangeSchema, RequestPasswordChangeSchema } from "backend/types/auth.type";
import { PasswordStepSidebar } from "./PasswordStepSidebar";
import { PasswordRequestStep } from "./PasswordRequestStep";
import { PasswordConfirmStep } from "./PasswordConfirmStep";

export function PasswordChangeCard() {
  const requestMutation = useRequestPasswordChange();
  const confirmMutation = useConfirmPasswordChange();
  const [step, setStep] = useState<"REQUEST" | "CONFIRM">("REQUEST");

  const passwordForm = useForm({
    defaultValues: {
      currentPassword: "",
      code: "",
      newPassword: "",
      confirmPassword: "",
    },
    onSubmit: async ({ value }) => {
      if (step === "REQUEST") {
        const validation = RequestPasswordChangeSchema.safeParse({
          currentPassword: value.currentPassword,
        });

        if (!validation.success) {
          toast.error(validation.error.issues[0]?.message ?? "Invalid current password.");
          return;
        }

        try {
          await requestMutation.mutateAsync(validation.data);
          toast.success("Authorization code sent to your email.");
          setStep("CONFIRM");
        } catch (error: any) {
          toast.error(error?.message ?? "Failed to request password change.");
        }
      } else {
        if (value.newPassword !== value.confirmPassword) {
          toast.error("Passwords don't match.");
          return;
        }

        const validation = ConfirmPasswordChangeSchema.safeParse({
          code: value.code,
          newPassword: value.newPassword,
        });

        if (!validation.success) {
          toast.error(validation.error.issues[0]?.message ?? "Invalid input.");
          return;
        }

        try {
          await confirmMutation.mutateAsync(validation.data);
          toast.success("Password updated successfully.");
          passwordForm.reset();
          setStep("REQUEST");
        } catch (error: any) {
          toast.error(error?.message ?? "Failed to update password.");
        }
      }
    },
  });

  const isPending = requestMutation.isPending || confirmMutation.isPending;

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center gap-2">
        <Lock className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Security
        </span>
      </div>

      <Card className="w-full overflow-hidden border-border/50 shadow-none bg-card">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <PasswordStepSidebar step={step} />

          <div className="lg:col-span-8 flex flex-col bg-card">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                passwordForm.handleSubmit();
              }}
              className="flex flex-col h-full"
            >
              <div className="p-6 sm:p-8 flex-1">
                {step === "REQUEST" ? (
                  <PasswordRequestStep form={passwordForm} />
                ) : (
                  <PasswordConfirmStep form={passwordForm} />
                )}
              </div>

              <div className="px-6 py-4 sm:px-8 border-t border-border/40 bg-muted/10 flex items-center justify-between gap-3 mt-auto">
                <p className="text-xs text-muted-foreground hidden sm:block">
                  {step === "REQUEST"
                    ? "A verification code will be sent to your registered email."
                    : "Enter the code from your email alongside your new password."}
                </p>

                <div className="flex items-center gap-2 ml-auto">
                  {step === "CONFIRM" && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        passwordForm.reset();
                        setStep("REQUEST");
                      }}
                      className="h-9 gap-1.5 text-muted-foreground hover:text-foreground text-sm"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Cancel
                    </Button>
                  )}

                  <Button
                    type="submit"
                    size="sm"
                    disabled={isPending}
                    className="h-9 gap-2 px-5 text-sm"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Processing…
                      </>
                    ) : step === "REQUEST" ? (
                      <>
                        Send code
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    ) : (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        Confirm change
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </Card>
    </div>
  );
}
