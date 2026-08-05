import { useRef } from "react";
import { useForm } from "@tanstack/react-form";
import { CourseSchema, type CourseSelect, type CourseUpdate } from "backend/types/course.type";
import { useUpdateCourse } from "../api/course.service";
import { useEntityDialog } from "@/hooks/use-entity-dialog";

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
  const { mutateAsync, isPending } = useUpdateCourse();

  const initialFormData: CourseUpdate = {
    initialism: course.initialism,
    name: course.name,
  };

  const handleFormSubmitRef = useRef<any>(null);

  const form = useForm({
    defaultValues: initialFormData,
    validators: {
      onSubmit: CourseSchema.update,
    },
    onSubmit: (args) => handleFormSubmitRef.current?.(args),
  });

  const dialog = useEntityDialog<CourseUpdate>({
    form,
    mutationFn: (values) =>
      mutateAsync({
        course_id: course.id,
        ...values,
      }),
    loadingText: "Updating course record...",
    successText: "Course updated successfully.",
    onReset: () => form.reset(initialFormData),
  });

  handleFormSubmitRef.current = dialog.handleFormSubmit;

  const courseSummary = (() => {
    if (!dialog.pendingValue) return "";
    return `This will update details for "${course.initialism}" to "${dialog.pendingValue.initialism}" (${dialog.pendingValue.name}).`;
  })();

  return (
    <>
      <Dialog open={dialog.open} onOpenChange={dialog.handleOpenChange}>
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
            <Button
              type="button"
              variant="outline"
              onClick={dialog.attemptClose}
              disabled={isPending}
            >
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
      <AlertDialog open={dialog.confirmSaveOpen} onOpenChange={dialog.setConfirmSaveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save changes to course?</AlertDialogTitle>
            <AlertDialogDescription>{courseSummary}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Go back</AlertDialogCancel>
            <AlertDialogAction onClick={dialog.confirmSave} disabled={isPending}>
              {isPending ? "Saving..." : "Yes, save changes"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Discard Confirmation Modal */}
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
            <AlertDialogAction onClick={dialog.confirmDiscard}>Discard</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
