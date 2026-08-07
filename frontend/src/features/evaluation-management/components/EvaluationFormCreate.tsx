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
    min_rating: 1,
    max_rating: 5,
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
          <Button
            type="button"
            className="h-8 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-medium"
          >
            <Icon className="size-3.5" />
            <span className="leading-none text-xs">{triggerText}</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="rounded-xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Create Evaluation Instrument
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Add a new{" "}
              {type === "student"
                ? "Student Evaluation of Teachers (SET)"
                : "Supervisor Evaluation of Faculty (SEF)"}{" "}
              form with custom score bounds.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="py-2 space-y-3">
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

            <div className="grid grid-cols-2 gap-3">
              <form.Field
                name="min_rating"
                children={(field) => (
                  <FormTextField
                    field={field}
                    label="Min Score Bound"
                    type="number"
                    disabled={isPending}
                    placeholder="1"
                  />
                )}
              />
              <form.Field
                name="max_rating"
                children={(field) => (
                  <FormTextField
                    field={field}
                    label="Max Score Bound"
                    type="number"
                    disabled={isPending}
                    placeholder="5"
                  />
                )}
              />
            </div>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={dialog.attemptClose}
              disabled={isPending}
              className="h-8 rounded-lg text-xs"
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
                  className="h-8 cursor-pointer rounded-lg text-xs font-medium"
                >
                  {isPending ? "Creating..." : "Create Form"}
                </Button>
              )}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={dialog.confirmSaveOpen} onOpenChange={dialog.setConfirmSaveOpen}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold">
              Create new evaluation form?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              This will create a new evaluation instrument template with score range{" "}
              <strong>
                {dialog.pendingValue?.min_rating} to {dialog.pendingValue?.max_rating}
              </strong>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending} className="h-8 rounded-lg text-xs">
              Go back
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={dialog.confirmSave}
              disabled={isPending}
              className="h-8 rounded-lg text-xs font-medium"
            >
              {isPending ? "Creating..." : "Yes, create form"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={dialog.confirmDiscardOpen} onOpenChange={dialog.setConfirmDiscardOpen}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold">
              Discard changes?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Closing now will discard your entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-8 rounded-lg text-xs">Keep editing</AlertDialogCancel>
            <AlertDialogAction onClick={dialog.confirmDiscard} className="h-8 rounded-lg text-xs">
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
