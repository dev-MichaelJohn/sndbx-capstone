import { useForm } from "@tanstack/react-form";
import type { LucideIcon } from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { FormTextField } from "@/components/form-text-field";
import { useEntityDialog } from "@/hooks/use-entity-dialog";
import { useCreateEvaluationForm } from "../api/evaluation-form.service";
import {
  CreateFormReqSchema,
  type CreateFormReq,
  type EvaluationType,
} from "backend/types/evaluation-form.type";

interface EvaluationFormCreateDialogProps {
  type: EvaluationType;
  icon: LucideIcon;
  triggerText: string;
}

export const EvaluationFormCreateDialog = ({
  type,
  icon: Icon,
  triggerText,
}: EvaluationFormCreateDialogProps) => {
  const { mutateAsync, isPending } = useCreateEvaluationForm(type);

  const initialFormData: CreateFormReq = {
    title: "",
    description: "",
  };

  const form = useForm({
    defaultValues: initialFormData,
    validators: { onSubmit: CreateFormReqSchema },
    onSubmit: (values) => dialog.handleFormSubmit(values),
  });

  const dialog = useEntityDialog<CreateFormReq>({
    form,
    mutationFn: (payload) => mutateAsync({ type, payload }),
    loadingText: "Creating evaluation instrument...",
    successText: "Evaluation instrument created successfully.",
  });

  return (
    <>
      <Dialog open={dialog.open} onOpenChange={dialog.handleOpenChange}>
        <DialogTrigger asChild>
          <Button type="button" className="rounded-lg p-4 flex items-center justify-center gap-1">
            <Icon className="size-3.5" />
            <span className="leading-none text-sm">{triggerText}</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Evaluation Instrument</DialogTitle>
            <DialogDescription>
              Add a new{" "}
              {type === "student"
                ? "Student Evaluation of Teachers (SET)"
                : "Supervisor Evaluation of Faculty (SEF)"}{" "}
              form.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <form.Field
              name="title"
              children={(field) => (
                <FormTextField
                  field={field}
                  label="Form Title"
                  disabled={isPending}
                  placeholder="e.g. SET Instrument AY 2026-2027"
                />
              )}
            />
            <form.Field
              name="description"
              children={(field) => (
                <FormTextField
                  field={field}
                  label="Description"
                  disabled={isPending}
                  placeholder="e.g. Standard evaluation form for instructional effectiveness"
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
                  {isPending ? "Creating..." : "Create Form"}
                </Button>
              )}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={dialog.confirmSaveOpen} onOpenChange={dialog.setConfirmSaveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create new evaluation form?</AlertDialogTitle>
            <AlertDialogDescription>
              This will create a new evaluation instrument template.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Go back</AlertDialogCancel>
            <AlertDialogAction onClick={dialog.confirmSave} disabled={isPending}>
              {isPending ? "Creating..." : "Yes, create form"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={dialog.confirmDiscardOpen} onOpenChange={dialog.setConfirmDiscardOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>Closing now will discard your entry.</AlertDialogDescription>
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
