import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useLocation, useNavigate, Link } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useConfirmPasswordReset } from "../api/auth.service";

/**
 * Step 2: Reset Password card requiring the 8-character OTP code and new credentials.
 */
export const ResetPasswordCard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const confirmMutation = useConfirmPasswordReset();

  const initialEmail = (location.state as any)?.email ?? "";
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm({
    defaultValues: {
      email: initialEmail,
      code: "",
      newPassword: "",
      confirmPassword: "",
    },
    onSubmit: async ({ value }) => {
      if (value.newPassword !== value.confirmPassword) {
        toast.error("Passwords do not match.");
        return;
      }

      let toastId: string | undefined;
      try {
        toastId = toast.loading("Updating password...");
        await confirmMutation.mutateAsync({
          email: value.email,
          code: value.code,
          newPassword: value.newPassword,
        });
        toast.success("Password reset successfully! Please log in.", { id: toastId });
        navigate("/auth/login");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to reset password.", {
          id: toastId,
        });
      }
    },
  });

  return (
    <Card className="w-full max-w-sm shadow rounded-2xl border border-border/80">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Reset Password</CardTitle>
        <CardDescription className="text-xs">
          Enter the 8-character code sent to your email alongside your new password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="form-reset-password"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup className="space-y-3">
            <form.Field
              name="email"
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Email Address</FieldLabel>
                  <Input
                    type="email"
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    disabled={confirmMutation.isPending}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="m@example.com"
                  />
                </Field>
              )}
            />

            <form.Field
              name="code"
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Reset OTP Code</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    disabled={confirmMutation.isPending}
                    onChange={(e) => field.handleChange(e.target.value.toUpperCase())}
                    placeholder="8K9P2X1Q"
                    className="font-mono uppercase tracking-widest text-center"
                    maxLength={8}
                  />
                </Field>
              )}
            />

            <form.Field
              name="newPassword"
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>New Password</FieldLabel>
                  <div className="relative flex items-center">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      disabled={confirmMutation.isPending}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="pr-10"
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
                </Field>
              )}
            />

            <form.Field
              name="confirmPassword"
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Confirm Password</FieldLabel>
                  <div className="relative flex items-center">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      disabled={confirmMutation.isPending}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="pr-10"
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
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2 pt-2">
        <Button
          type="submit"
          form="form-reset-password"
          disabled={confirmMutation.isPending}
          className="w-full text-xs font-bold h-9 cursor-pointer"
        >
          {confirmMutation.isPending ? "Confirming..." : "Confirm New Password"}
        </Button>
        <Link
          to="/auth/login"
          className="ml-auto inline-block text-xs underline-offset-4 hover:underline text-muted-foreground"
        >
          Back to login
        </Link>
      </CardFooter>
    </Card>
  );
};
