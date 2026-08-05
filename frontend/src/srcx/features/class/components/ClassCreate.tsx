import { useRef } from "react";
import { useForm } from "@tanstack/react-form";
import type { LucideIcon } from "lucide-react";
import { ClassSchema, type ClassInsert } from "backend/types/class.type";
import { useCreateClass } from "../api/class.service";
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

interface ClassCreateDialogProps {
  programId: number;
  icon?: LucideIcon;
  triggerText?: string;
}

const SECTIONS = ["A", "B", "C", "D", "E", "F"];

export const ClassCreateDialog = ({
  programId,
  icon: Icon,
  triggerText = "Create Class",
}: ClassCreateDialogProps) => {
  const { mutateAsync, isPending } = useCreateClass();

  const initialFormData: ClassInsert = {
    program_id: programId,
    year_level: "I",
    section: "A",
  };

  const handleFormSubmitRef = useRef<any>(null);

  const form = useForm({
    defaultValues: initialFormData,
    validators: {
      onSubmit: ClassSchema.insert,
    },
    onSubmit: (args) => handleFormSubmitRef.current?.(args),
  });

  const dialog = useEntityDialog<ClassInsert>({
    form,
    mutationFn: mutateAsync,
    loadingText: "Creating class record...",
    successText: "Class created successfully.",
  });

  handleFormSubmitRef.current = dialog.handleFormSubmit;

  return (
    <>
      <Dialog open={dialog.open} onOpenChange={dialog.handleOpenChange}>
        <DialogTrigger asChild>
          <Button type="button" className="rounded-lg p-4 flex items-center justify-center gap-1">
            {Icon && <Icon className="size-4" />}
            <span className="leading-none text-sm">{triggerText}</span>
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Class</DialogTitle>
            <DialogDescription>
              Open a new class section under this academic program.
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
              selector={(state) => [state.canSubmit] as const}
              children={([canSubmit]) => (
                <Button
                  type="button"
                  disabled={!canSubmit || isPending}
                  onClick={() => form.handleSubmit()}
                >
                  {isPending ? "Creating..." : "Create Class"}
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
            <AlertDialogTitle>Confirm Class Creation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to create this class section for the program?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Go back</AlertDialogCancel>
            <AlertDialogAction onClick={dialog.confirmSave} disabled={isPending}>
              {isPending ? "Creating..." : "Yes, create class"}
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
              You have unsaved changes. Closing now will discard your entry.
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
