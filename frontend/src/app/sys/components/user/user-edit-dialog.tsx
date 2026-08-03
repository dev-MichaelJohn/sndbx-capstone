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
import { FormTextField } from "@/components/form-text-field";
import { useUpdateUser } from "@/features/sys/user.service";
import type { UserWithDetails, UpdateUserReqType } from "backend/types/user.type";
import { useEntityDialog } from "@/hooks/use-entity-dialog";

interface UserEditDialogProps {
  user: UserWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UserEditDialog = ({ user, open, onOpenChange }: UserEditDialogProps) => {
  if (!user || !open) return null;

  return <UserEditFormModal key={user.id} user={user} onClose={() => onOpenChange(false)} />;
};

interface UserEditFormModalProps {
  user: UserWithDetails;
  onClose: () => void;
}

const UserEditFormModal = ({ user, onClose }: UserEditFormModalProps) => {
  const updateMutation = useUpdateUser();

  const initialFormData: UpdateUserReqType = {
    credentials: {
      email: user.email ?? "",
    },
    personalDetails: {
      institutional_id: user.institutional_id ?? "",
      first_name: user.first_name ?? "",
      last_name: user.last_name ?? "",
      middle_name: user.middle_name ?? "",
      suffix: user.suffix ?? "",
    },
  };

  const form = useForm({
    defaultValues: initialFormData,
    onSubmit: (values) => {
      dialog.handleFormSubmit(values);
    },
  });

  const dialog = useEntityDialog<UpdateUserReqType>({
    form,
    mutationFn: async (payload) => {
      const res = await updateMutation.mutateAsync({ id: user.id, payload });
      onClose();
      return res;
    },
    loadingText: "Updating user account...",
    successText: "User account updated successfully.",
  });

  const isPending = updateMutation.isPending;

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
            <DialogTitle>Edit User Account</DialogTitle>
            <DialogDescription>
              Update account email and personal details. System role modifications are managed
              separately.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="space-y-3">
            <form.Field
              name="credentials.email"
              children={(field) => (
                <FormTextField
                  field={field}
                  label="Email Address"
                  type="email"
                  disabled={isPending}
                />
              )}
            />

            <form.Field
              name="personalDetails.institutional_id"
              children={(field) => (
                <FormTextField field={field} label="Institutional ID" disabled={isPending} />
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
                  {isPending ? "Saving..." : "Save Changes"}
                </Button>
              )}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialogs */}
      <AlertDialog open={dialog.confirmSaveOpen} onOpenChange={dialog.setConfirmSaveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save changes to user account?</AlertDialogTitle>
            <AlertDialogDescription>
              An update notification email will be dispatched to the user regarding these changes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Go back</AlertDialogCancel>
            <AlertDialogAction onClick={dialog.confirmSave} disabled={isPending}>
              {isPending ? "Saving..." : "Yes, save changes"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={dialog.confirmDiscardOpen} onOpenChange={dialog.setConfirmDiscardOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved edits in this form. Closing now will discard your changes.
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
