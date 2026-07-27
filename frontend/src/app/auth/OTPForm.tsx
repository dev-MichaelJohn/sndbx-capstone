import { VerifyOTPSchema } from "backend/types/otp.type";
import { useForm } from "@tanstack/react-form";
import toast from "react-hot-toast";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useAuthFlow } from "@/features/auth/auth.context";
import { useNavigate } from "react-router";
import { setBearerToken, useValidateOTP } from "@/features/auth/auth.service";
import { useUser } from "@/features/auth/user.context";
import { getHomeRouteForRoles } from "@/lib/role-route";

export const OTPForm = () => {
  const { pendingAuth, setPendingAuth } = useAuthFlow();
  const { mutateAsync, isPending } = useValidateOTP();
  const navigate = useNavigate();
  const { setUser } = useUser();
  const form = useForm({
    defaultValues: {
      email: pendingAuth?.email ?? "",
      code: "",
    },
    validators: {
      onSubmit: VerifyOTPSchema,
    },
    onSubmit: async ({ value }) => {
      let toastId: string | undefined;
      try {
        toastId = toast.loading("Verifying OTP...");
        const result = await mutateAsync(value);
        const { data, message } = result;
        if (!data) throw new Error("Unexpected response from server.");

        setBearerToken(data.token);

        // TODO: this should re-route the user to the appropriate dashboard
        setUser(data.info);
        setPendingAuth(null);
        toast.success(message, { id: toastId });
        navigate(getHomeRouteForRoles(data.info.roles), { replace: true });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Login failed.";
        toast.error(message, { id: toastId });
      }
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
                  disabled={isPending}
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
