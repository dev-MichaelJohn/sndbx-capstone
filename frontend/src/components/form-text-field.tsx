import type { AnyFieldApi } from "@tanstack/react-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface FormTextFieldProps {
  field: AnyFieldApi;
  label: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function FormTextField({
  field,
  label,
  type = "text",
  placeholder,
  disabled,
}: FormTextFieldProps) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Input
        type={type}
        id={field.name}
        name={field.name}
        value={field.state.value ?? ""}
        disabled={disabled}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        placeholder={placeholder}
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
