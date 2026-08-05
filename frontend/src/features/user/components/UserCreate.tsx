import { useMemo } from "react";
import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { FormTextField } from "@/components/form-text-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateUser } from "../api/user.service";
import type { CreateUserReqType, SystemRole } from "backend/types/user.type";
import { useEntityDialog } from "@/hooks/use-entity-dialog";
import { useUser } from "@/features/auth/context/user.context";

interface UserCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ALL_SYSTEM_ROLES: { label: string; value: SystemRole }[] = [
  { label: "Student", value: "STUDENT" },
  { label: "Faculty", value: "FACULTY" },
  { label: "Supervisor", value: "SUPERVISOR" },
  { label: "Administrator", value: "ADMIN" },
  { label: "System Administrator", value: "SYS_ADMIN" },
];

export const UserCreateDialog = ({ open, onOpenChange }: UserCreateDialogProps) => {
  if (!open) return null;

  return <UserCreateFormModal key={open ? "open" : "closed"} onClose={() => onOpenChange(false)} />;
};

interface UserCreateFormModalProps {
  onClose: () => void;
}

const UserCreateFormModal = ({ onClose }: UserCreateFormModalProps) => {
  const { user: currentUser } = useUser();
  const createMutation = useCreateUser();

  const availableRoles = useMemo(() => {
    const userRoles = currentUser?.roles ?? [];
    const isSysAdmin = userRoles.includes("SYS_ADMIN");

    return ALL_SYSTEM_ROLES.filter((r) => {
      if (r.value === "SYS_ADMIN") return false;
      if (r.value === "ADMIN") return isSysAdmin;
      return true;
    });
  }, [currentUser]);

  const initialFormData: CreateUserReqType = {
    credentials: {
      email: "",
      password: "",
    },
    personalDetails: {
      institutional_id: "",
      first_name: "",
      last_name: "",
      middle_name: "",
      suffix: "",
    },
    role: availableRoles[0]?.value ?? "STUDENT",
  };

  const form = useForm({
    defaultValues: initialFormData,
    onSubmit: (values) => dialog.handleFormSubmit(values),
  });

  const dialog = useEntityDialog<CreateUserReqType>({
    form,
    mutationFn: async (payload) => {
      const { password, email } = payload.credentials;

      const sanitizedPayload: CreateUserReqType = {
        ...payload,
        credentials: {
          email,
          ...(password?.trim() ? { password: password.trim() } : {}),
        },
      };

      const res = await createMutation.mutateAsync(sanitizedPayload);
      onClose();
      return res;
    },
    loadingText: "Creating user account...",
    successText: "User account created successfully.",
  });

  const isPending = createMutation.isPending;

  const handleAttemptClose = () => {
    if (form.state.isDirty) {
      dialog.attemptClose();
    } else {
      onClose();
    }
  };

  const handleConfirmDiscard = () => {
    dialog.confirmDiscard();
    onClose();
  };

  return (
    <>
      <Dialog open={true} onOpenChange={(nextOpen) => !nextOpen && handleAttemptClose()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create User Account</DialogTitle>
            <DialogDescription>
              Register a new user account with personal details and assign an initial system role.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="space-y-3">
            <form.Field
              name="role"
              children={(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>System Role</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(val) => field.handleChange(val as SystemRole)}
                    disabled={isPending}
                  >
                    <SelectTrigger id={field.name} className="w-full text-xs">
                      <SelectValue placeholder="Select system role" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRoles.map((r) => (
                        <SelectItem key={r.value} value={r.value} className="text-xs">
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <form.Field
                name="credentials.email"
                children={(field) => (
                  <FormTextField
                    field={field}
                    label="Email Address"
                    type="email"
                    placeholder="user@pit.edu.ph"
                    disabled={isPending}
                  />
                )}
              />
              <form.Field
                name="credentials.password"
                children={(field) => (
                  <FormTextField
                    field={field}
                    label="Password (Optional)"
                    type="password"
                    placeholder="Auto-generated if empty"
                    disabled={isPending}
                  />
                )}
              />
            </div>

            <form.Field
              name="personalDetails.institutional_id"
              children={(field) => (
                <FormTextField
                  field={field}
                  label="Institutional ID"
                  placeholder="e.g. 2024-00123"
                  disabled={isPending}
                />
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <form.Field
                name="personalDetails.first_name"
                children={(field) => (
                  <FormTextField field={field} label="First Name" disabled={isPending} />
                )}
              />
              <form.Field
                name="personalDetails.last_name"
                children={(field) => (
                  <FormTextField field={field} label="Last Name" disabled={isPending} />
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <form.Field
                name="personalDetails.middle_name"
                children={(field) => (
                  <FormTextField field={field} label="Middle Name" disabled={isPending} />
                )}
              />
              <form.Field
                name="personalDetails.suffix"
                children={(field) => (
                  <FormTextField
                    field={field}
                    label="Suffix"
                    placeholder="Jr., III"
                    disabled={isPending}
                  />
                )}
              />
            </div>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleAttemptClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <form.Subscribe
              selector={(state) => [state.canSubmit] as const}
              children={([canSubmit]) => (
                <Button
                  type="button"
                  disabled={!canSubmit || isPending}
                  onClick={() => form.handleSubmit()}
                >
                  {isPending ? "Creating..." : "Create Account"}
                </Button>
              )}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={dialog.confirmSaveOpen} onOpenChange={dialog.setConfirmSaveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create user account?</AlertDialogTitle>
            <AlertDialogDescription>
              A new account will be created. If no password was provided, an auto-generated password
              will be emailed to the user.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Go back</AlertDialogCancel>
            <AlertDialogAction onClick={dialog.confirmSave} disabled={isPending}>
              {isPending ? "Creating..." : "Yes, create account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={dialog.confirmDiscardOpen} onOpenChange={dialog.setConfirmDiscardOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved form entries. Closing now will discard your progress.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDiscard}>Discard</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
