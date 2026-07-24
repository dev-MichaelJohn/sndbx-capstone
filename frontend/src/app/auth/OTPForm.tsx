import { VerifyOTPSchema } from "backend/types/otp.type";
import { useForm } from "@tanstack/react-form";
import toast from "react-hot-toast";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useAuthFlow } from "@/features/auth/auth.context";
import { Navigate } from "react-router";

export const OTPForm = () => {
  const { pendingAuth } = useAuthFlow();
  if (!pendingAuth) return <Navigate to="/auth/login" replace></Navigate>;

  const form = useForm({
    defaultValues: {
      email: pendingAuth.email,
      code: "",
    },
    validators: {
      onSubmit: VerifyOTPSchema,
    },
    onSubmit: () => {
      toast.success("You submitted!");
    },
  });

  const MAX_OTP_LENGTH = 8;
  const OTPSlots = () =>
    Array.from({ length: MAX_OTP_LENGTH }, (_, index) => (
      <InputOTPSlot key={index} index={index} className="flex-1" />
    ));

  return (
    <form
      id="form-otp"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <FieldGroup>
        <form.Field
          name="code"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>OTP Code</FieldLabel>
                <InputOTP
                  id={field.name}
                  name={field.name}
                  maxLength={MAX_OTP_LENGTH}
                  pattern={REGEXP_ONLY_DIGITS}
                  containerClassName="w-full"
                  value={field.state.value}
                  onChange={(value) => field.handleChange(value)}
                  onBlur={field.handleBlur}
                >
                  <InputOTPGroup className="w-full">{OTPSlots()}</InputOTPGroup>
                </InputOTP>
                {isInvalid && (
                  <FieldError
                    errors={field.state.meta.errors}
                    className="[&_ul]:list-none [&_ul]:pl-0 [&_ul]:ps-0"
                  />
                )}
              </Field>
            );
          }}
        />
      </FieldGroup>
    </form>
  );
};
