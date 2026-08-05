import { useRef } from "react";
import { useForm } from "@tanstack/react-form";
import type { LucideIcon } from "lucide-react";
import { CourseSchema, type CourseInsert } from "backend/types/course.type";
import { useCreateCourse } from "../api/course.service";
import { useEntityDialog } from "@/hooks/use-entity-dialog";

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
  const { mutateAsync, isPending } = useCreateCourse();

  const initialFormData: CourseInsert = {
    program_id: programId,
    initialism: "",
    name: "",
  };

  const handleFormSubmitRef = useRef<any>(null);

  const form = useForm({
    defaultValues: initialFormData,
    validators: {
      onSubmit: CourseSchema.insert,
    },
    onSubmit: (args) => handleFormSubmitRef.current?.(args),
  });

  const dialog = useEntityDialog<CourseInsert>({
    form,
    mutationFn: mutateAsync,
    loadingText: "Creating course record...",
    successText: "Course created successfully.",
  });

  handleFormSubmitRef.current = dialog.handleFormSubmit;

  const courseSummary = (() => {
    if (!dialog.pendingValue) return "";
    return `This will add standard course entry "${dialog.pendingValue.initialism}" (${dialog.pendingValue.name}) to the program curriculum.`;
  })();

  return (
    <>
      <Dialog open={dialog.open} onOpenChange={dialog.handleOpenChange}>
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
            <Button
              type="button"
              variant="outline"
              onClick={dialog.attemptClose}
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
                  {isPending ? "Creating..." : "Create Course"}
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
            <AlertDialogTitle>Create new course?</AlertDialogTitle>
            <AlertDialogDescription>{courseSummary}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Go back</AlertDialogCancel>
            <AlertDialogAction onClick={dialog.confirmSave} disabled={isPending}>
              {isPending ? "Creating..." : "Yes, create course"}
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
              You have unsaved input in this form. Closing now will discard your entry.
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
