import { useState } from "react";
import { UserLoginSchema } from "backend/types/user.type";
import { useForm } from "@tanstack/react-form";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useValidateLogin } from "@/features/auth/api/auth.service";
import { useAuth } from "@/features/auth/context/auth.context";
import { useNavigate } from "react-router";

export const LoginForm = () => {
  const { mutateAsync, isPending } = useValidateLogin();
  const { setPendingAuth } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: UserLoginSchema,
    },
    onSubmit: async ({ value }) => {
      let toastId: string | undefined;
      try {
        toastId = toast.loading("Logging in...");
        const result = await mutateAsync(value);
        const { data, message } = result;
        if (!data) throw new Error("Unexpected response from server.");

        setPendingAuth({ email: data.email, password: value.password, resendAt: data.resendAt });
        toast.success(message, { id: toastId });
        navigate("/auth/otp");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Login failed.";
        toast.error(message, { id: toastId });
        form.setFieldMeta("email", (meta) => ({
          ...meta,
          errorMap: { onSubmit: message },
        }));
        form.setFieldMeta("password", (meta) => ({
          ...meta,
          errorMap: { onSubmit: message },
        }));
      }
    },
  });

  return (
    <form
      id="form-login"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <FieldGroup>
        <form.Field
          name="email"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                <Input
                  type="email"
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  disabled={isPending}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="m@example.com"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />
        <form.Field
          name="password"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                <div className="relative flex items-center">
                  <Input
                    type={showPassword ? "text" : "password"}
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    disabled={isPending}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    className="pr-10"
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
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />
      </FieldGroup>
    </form>
  );
};
