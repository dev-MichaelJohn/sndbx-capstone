import { useRef } from "react";
import { useForm } from "@tanstack/react-form";
import { ClassSchema, type ClassSelect, type ClassUpdate } from "backend/types/class.type";
import { useUpdateClass } from "../api/class.service";
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

interface ClassEditDialogProps {
  classData: ClassSelect;
}

const SECTIONS = ["A", "B", "C", "D", "E", "F"];

export const ClassEditDialog = ({ classData }: ClassEditDialogProps) => {
  const { mutateAsync, isPending } = useUpdateClass();

  const initialFormData: ClassUpdate = {
    year_level: classData.year_level,
    section: classData.section,
  };

  const handleFormSubmitRef = useRef<any>(null);

  const form = useForm({
    defaultValues: initialFormData,
    validators: {
      onSubmit: ClassSchema.update,
    },
    onSubmit: (args) => handleFormSubmitRef.current?.(args),
  });

  const dialog = useEntityDialog<ClassUpdate>({
    form,
    mutationFn: (values) =>
      mutateAsync({
        id: classData.id,
        ...values,
      }),
    loadingText: "Updating class record...",
    successText: "Class updated successfully.",
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
            <DialogTitle>Edit Class Selection</DialogTitle>
            <DialogDescription>
              Update the designated year level or section for this class.
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
                      <SelectItem value="I">I (First Year)</SelectItem>
                      <SelectItem value="II">II (Second Year)</SelectItem>
                      <SelectItem value="III">III (Third Year)</SelectItem>
                      <SelectItem value="IV">IV (Fourth Year)</SelectItem>
                      <SelectItem value="V">V (Fifth Year)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            />

            {/* Section Selection */}
            <form.Field
              name="section"
              children={(field) => (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Section</label>
                  <Select
                    value={field.state.value}
                    onValueChange={(val) => field.handleChange(val as any)}
                    disabled={isPending}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      {SECTIONS.map((sec) => (
                        <SelectItem key={sec} value={sec}>
                          Section {sec}
                        </SelectItem>
                      ))}
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
              This will update the year level or section placement for this class.
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
