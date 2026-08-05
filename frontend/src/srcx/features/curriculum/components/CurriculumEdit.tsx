import { useRef } from "react";
import { useForm } from "@tanstack/react-form";
import {
  CurriculumSchema,
  type CurriculumSelect,
  type CurriculumUpdate,
} from "backend/types/curriculum.type";
import { useUpdateCurriculum } from "../api/curriculum.service";
import { useEntityDialog } from "@/hooks/use-entity-dialog";

import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface CurriculumEditDialogProps {
  curriculum: CurriculumSelect & { initialism?: string; name?: string };
}

export const CurriculumEditDialog = ({ curriculum }: CurriculumEditDialogProps) => {
  const { mutateAsync, isPending } = useUpdateCurriculum();

  const initialFormData: CurriculumUpdate = {
    year_level: curriculum.year_level,
    semester_term: curriculum.semester_term,
  };

  const handleFormSubmitRef = useRef<any>(null);

  const form = useForm({
    defaultValues: initialFormData,
    validators: {
      onSubmit: CurriculumSchema.update,
    },
    onSubmit: (args) => handleFormSubmitRef.current?.(args),
  });

  const dialog = useEntityDialog<CurriculumUpdate>({
    form,
    mutationFn: (values) =>
      mutateAsync({
        curriculum_id: curriculum.id,
        ...values,
      }),
    loadingText: "Updating curriculum record...",
    successText: "Curriculum updated successfully.",
    onReset: () => form.reset(initialFormData),
  });

  handleFormSubmitRef.current = dialog.handleFormSubmit;

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
            <DialogTitle>Edit Curriculum Placement</DialogTitle>
            <DialogDescription>
              Update year level or semester term for {curriculum.initialism ?? "this course"}.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            {/* Year Level Selection */}
            <form.Field
              name="year_level"
              children={(field) => (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Year Level</label>
                  <Select
                    value={field.state.value}
                    onValueChange={(val) => field.handleChange(val as any)}
                    disabled={isPending}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select year level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="I">I</SelectItem>
                      <SelectItem value="II">II</SelectItem>
                      <SelectItem value="III">III</SelectItem>
                      <SelectItem value="IV">IV</SelectItem>
                      <SelectItem value="V">V</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            />

            {/* Semester Term Selection */}
            <form.Field
              name="semester_term"
              children={(field) => (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Semester Term</label>
                  <Select
                    value={field.state.value}
                    onValueChange={(val) => field.handleChange(val as any)}
                    disabled={isPending}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1st">1st</SelectItem>
                      <SelectItem value="2nd">2nd</SelectItem>
                      <SelectItem value="Summer">Summer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
            <AlertDialogTitle>Save changes?</AlertDialogTitle>
            <AlertDialogDescription>
              This will update the curriculum placement for this course.
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

      {/* Discard Confirmation Modal */}
      <AlertDialog open={dialog.confirmDiscardOpen} onOpenChange={dialog.setConfirmDiscardOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved edits. Closing now will discard your changes.
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
