import { useState } from "react";
import toast from "react-hot-toast";
import { useForm } from "@tanstack/react-form";
import { CourseSchema, type CourseSelect, type CourseUpdate } from "backend/types/course.type";
import { useUpdateCourse } from "@/features/sys/course.service";

import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { FormTextField } from "@/components/form-text-field";
import { Pencil } from "lucide-react";
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

interface CourseEditDialogProps {
  course: CourseSelect;
  triggerAsDropdownItem?: boolean;
}

export const CourseEditDialog = ({ course }: CourseEditDialogProps) => {
  const [open, setOpen] = useState(false);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);
  const [pendingValue, setPendingValue] = useState<CourseUpdate | null>(null);

  const { mutateAsync, isPending } = useUpdateCourse();

  const initialFormData: CourseUpdate = {
    initialism: course.initialism,
    name: course.name,
  };

  const form = useForm({
    defaultValues: initialFormData,
    validators: {
      onSubmit: CourseSchema.update,
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
    const toastId = toast.loading("Updating course record...");
    try {
      await mutateAsync({
        course_id: course.id,
        ...pendingValue,
      });
      toast.success("Course updated successfully.", { id: toastId });
      setConfirmSaveOpen(false);
      setOpen(false);
      resetEverything();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update course. Please try again.",
        { id: toastId },
      );
      setConfirmSaveOpen(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-full justify-start px-2 py-1.5 text-xs font-normal"
          >
            <Pencil className="mr-2 size-3.5 text-muted-foreground" />
            <span>Edit</span>
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>
              Update the course code or title for standard curriculum cataloging.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            {/* Initialism / Course Code Field */}
            <form.Field
              name="initialism"
              validators={{
                onChange: ({ value }) =>
                  !value || !value.trim() ? "Course code is required" : undefined,
              }}
              children={(field) => (
                <FormTextField
                  field={field}
                  label="Course Code / Initialism"
                  disabled={isPending}
                  placeholder="e.g. IT 101"
                />
              )}
            />

            {/* Course Name Field */}
            <form.Field
              name="name"
              validators={{
                onChange: ({ value }) =>
                  !value || !value.trim() ? "Course name is required" : undefined,
              }}
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
              selector={(state) => [state.canSubmit, state.isDirty] as const}
              children={([canSubmit, isDirty]) => (
                <Button
                  type="button"
                  disabled={!canSubmit || !isDirty || isPending}
                  onClick={() => form.handleSubmit()}
                >
                  {isPending ? "Saving..." : "Save Changes"}
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
            <AlertDialogTitle>Save changes to course?</AlertDialogTitle>
            <AlertDialogDescription>
              This will update details for "{course.initialism}" to "{pendingValue?.initialism}" (
              {pendingValue?.name}).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Go back</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSave} disabled={isPending}>
              {isPending ? "Saving..." : "Yes, save changes"}
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
              You have unsaved edits in this form. Closing now will discard your changes.
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
