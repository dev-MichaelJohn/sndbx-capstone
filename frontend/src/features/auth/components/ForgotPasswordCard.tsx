import { useForm } from "@tanstack/react-form";
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
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Link, useNavigate } from "react-router";
import toast from "react-hot-toast";
import { useRequestPasswordReset } from "../api/auth.service";

/**
 * Step 1: Forgot Password card for requesting a reset OTP via email.
 */
export const ForgotPasswordCard = () => {
  const navigate = useNavigate();
  const requestMutation = useRequestPasswordReset();

  const form = useForm({
    defaultValues: {
      email: "",
    },
    onSubmit: async ({ value }) => {
      let toastId: string | undefined;
      try {
        toastId = toast.loading("Sending reset code...");
        await requestMutation.mutateAsync(value.email);
        toast.success("Reset code sent! Check your inbox.", { id: toastId });
        navigate("/auth/reset-password", { state: { email: value.email } });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to send reset code.", {
          id: toastId,
        });
      }
    },
  });

  return (
    <Card className="w-full max-w-sm shadow rounded-2xl border border-border/80">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Forgot Password</CardTitle>
        <CardDescription className="text-xs">
          Enter your institutional email address to receive a password reset verification code.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="form-forgot-password"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
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
                    disabled={requestMutation.isPending}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="m@example.com"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <FieldError errors={field.state.meta.errors} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button
          type="submit"
          form="form-forgot-password"
          disabled={requestMutation.isPending}
          className="w-full text-xs font-bold h-9 cursor-pointer"
        >
          {requestMutation.isPending ? "Sending Code..." : "Send Reset Code"}
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
