import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { User, Check } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { FormTextField } from "@/components/form-text-field";
import { useUser } from "@/features/auth/context/user.context";
import { useUpdateUser } from "@/features/user/api/user.service";

/**
 * Modal dialog enabling logged-in users to update their personal profile details
 * via the existing `PUT /protected/users/:id` endpoint.
 */
export const EditPersonalDetailsModal = () => {
  const [open, setOpen] = useState(false);
  const { user } = useUser();
  const updateUserMutation = useUpdateUser();

  const details = user?.personalDetails;

  const form = useForm({
    defaultValues: {
      first_name: details?.first_name ?? "",
      last_name: details?.last_name ?? "",
      middle_name: details?.middle_name ?? "",
      suffix: details?.suffix ?? "",
    },
    onSubmit: async ({ value }) => {
      if (!user) return;
      try {
        await updateUserMutation.mutateAsync({
          id: user.id,
          payload: {
            personalDetails: value,
          },
        });
        toast.success("Profile details updated successfully!");
        setOpen(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to update profile.");
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs font-medium cursor-pointer"
        >
          <User className="size-3.5 text-primary" />
          <span>Edit Profile</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Edit Personal Profile</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Update your personal name details displayed across reports and rosters.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4 py-2"
        >
          <FieldGroup className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <form.Field
                name="first_name"
                children={(field) => (
                  <FormTextField
                    field={field}
                    label="First Name"
                    disabled={updateUserMutation.isPending}
                  />
                )}
              />
              <form.Field
                name="last_name"
                children={(field) => (
                  <FormTextField
                    field={field}
                    label="Last Name"
                    disabled={updateUserMutation.isPending}
                  />
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <form.Field
                name="middle_name"
                children={(field) => (
                  <FormTextField
                    field={field}
                    label="Middle Name"
                    disabled={updateUserMutation.isPending}
                  />
                )}
              />
              <form.Field
                name="suffix"
                children={(field) => (
                  <FormTextField
                    field={field}
                    label="Suffix"
                    placeholder="Jr., III"
                    disabled={updateUserMutation.isPending}
                  />
                )}
              />
            </div>
          </FieldGroup>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={updateUserMutation.isPending}
              className="h-8 rounded-lg text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateUserMutation.isPending}
              className="h-8 gap-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground cursor-pointer"
            >
              <Check className="size-3.5" />
              <span>{updateUserMutation.isPending ? "Saving..." : "Save Changes"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
