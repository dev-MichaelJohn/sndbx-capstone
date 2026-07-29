import { useState } from "react";
import toast from "react-hot-toast";
import { useForm } from "@tanstack/react-form";
import type { LucideIcon } from "lucide-react";
import { CourseSchema, type CourseInsert } from "backend/types/course.type";
import { useCreateCourse } from "@/features/sys/course.service";

import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { FormTextField } from "@/components/form-text-field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

interface CourseCreateDialogProps {
  programId: number;
  icon?: LucideIcon;
  triggerText?: string;
}

export const CourseCreateDialog = ({
  programId,
  icon: Icon,
  triggerText = "Add Course",
}: CourseCreateDialogProps) => {
  const [open, setOpen] = useState(false);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);
  const [pendingValue, setPendingValue] = useState<CourseInsert | null>(null);

  const { mutateAsync, isPending } = useCreateCourse();

  const initialFormData: CourseInsert = {
    program_id: programId,
    initialism: "",
    name: "",
  };

  const form = useForm({
    defaultValues: initialFormData,
    validators: {
      onSubmit: CourseSchema.insert,
    },
    onSubmit: async ({ value }) => {
      setPendingValue(value);
      setConfirmSaveOpen(true);
    },
  });

  const resetEverything = () => {
    form.reset();
    setPendingValue(null);
    setConfirmSaveOpen(false);
    setConfirmDiscardOpen(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setOpen(true);
      resetEverything();
      return;
    }
    attemptClose();
  };

  const attemptClose = () => {
    if (form.state.isDirty) {
      setConfirmDiscardOpen(true);
      return;
    }
    setOpen(false);
    resetEverything();
  };

  const confirmDiscard = () => {
    setConfirmDiscardOpen(false);
    setOpen(false);
    resetEverything();
  };

  const confirmSave = async () => {
    if (!pendingValue) return;
    const toastId = toast.loading("Creating course record...");
    try {
      await mutateAsync(pendingValue);
      toast.success("Course created successfully.", { id: toastId });
      setConfirmSaveOpen(false);
      setOpen(false);
      resetEverything();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create course. Please try again.",
        { id: toastId },
      );
      setConfirmSaveOpen(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button type="button" className="rounded-lg p-4 flex items-center justify-center gap-1">
            {Icon && <Icon className="size-3.5" />}
            <span className="leading-none text-sm">{triggerText}</span>
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Course</DialogTitle>
            <DialogDescription>Add a new course entry to this program's catalog.</DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <form.Field
              name="initialism"
              children={(field) => (
                <FormTextField
                  field={field}
                  label="Course Code / Initialism"
                  disabled={isPending}
                  placeholder="e.g. IT 101"
                />
              )}
            />

            <form.Field
              name="name"
              children={(field) => (
                <FormTextField
                  field={field}
                  label="Course Name"
                  disabled={isPending}
                  placeholder="e.g. Introduction to Computing"
                />
              )}
            />
          </FieldGroup>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={attemptClose} disabled={isPending}>
              Cancel
            </Button>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting] as const}
              children={([canSubmit]) => (
                <Button
                  type="button"
                  disabled={!canSubmit || isPending}
                  onClick={() => form.handleSubmit()}
                >
                  {isPending ? "Creating..." : "Create Course"}
                </Button>
              )}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Confirmation Modal */}
      <AlertDialog open={confirmSaveOpen} onOpenChange={setConfirmSaveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create new course?</AlertDialogTitle>
            <AlertDialogDescription>
              This will add standard course entry "{pendingValue?.initialism}" ({pendingValue?.name}
              ) to the program curriculum.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Go back</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSave} disabled={isPending}>
              {isPending ? "Creating..." : "Yes, create course"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Discard Confirmation Modal */}
      <AlertDialog open={confirmDiscardOpen} onOpenChange={setConfirmDiscardOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved input in this form. Closing now will discard your entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDiscard}>Discard</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
