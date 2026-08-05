import { useForm } from "@tanstack/react-form";
import type { LucideIcon } from "lucide-react";

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
import { useEntityDialog } from "@/hooks/use-entity-dialog";
import { useAddQuestion, useUpdateQuestion } from "../api/evaluation-form.service";
import {
  UpsertQuestionReqSchema,
  type EvaluationType,
  type QuestionSelect,
  type UpsertQuestionReq,
} from "backend/types/evaluation-form.type";

interface QuestionDialogProps {
  type: EvaluationType;
  formId: number;
  categoryId: number;
  initialData?: QuestionSelect;
  nextOrder?: number;
  triggerText?: string;
  triggerIcon?: LucideIcon;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "icon";
  className?: string;
}

export const QuestionDialog = ({
  type,
  formId,
  categoryId,
  initialData,
  nextOrder = 1,
  triggerText,
  triggerIcon: Icon,
  variant = "ghost",
  size = "sm",
  className,
}: QuestionDialogProps) => {
  const isEdit = Boolean(initialData);

  const addQuestion = useAddQuestion(type, formId);
  const updateQuestion = useUpdateQuestion(type, formId);

  const isPending = addQuestion.isPending || updateQuestion.isPending;

  const defaultValues: UpsertQuestionReq = {
    question: initialData?.question ?? "",
    max_rating: initialData?.max_rating ?? 5,
    order: initialData?.order ?? nextOrder,
  };

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: ({ value }) => {
        const result = UpsertQuestionReqSchema.safeParse(value);
        if (!result.success) {
          return result.error.issues.map((issue) => issue.message).join(", ");
        }
      },
    },
    onSubmit: (values) => dialog.handleFormSubmit(values),
  });

  const dialog = useEntityDialog<UpsertQuestionReq>({
    form,
    mutationFn: (payload) => {
      if (isEdit && initialData) {
        return updateQuestion.mutateAsync({
          type,
          questionId: initialData.id,
          payload,
        });
      }
      return addQuestion.mutateAsync({ categoryId, payload });
    },
    loadingText: isEdit ? "Updating question statement..." : "Adding question statement...",
    successText: isEdit ? "Question statement updated." : "Question statement added.",
  });

  return (
    <>
      <Dialog open={dialog.open} onOpenChange={dialog.handleOpenChange}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant={variant}
            size={size}
            className={className ?? "h-7 cursor-pointer gap-1 rounded-lg text-xs font-medium"}
          >
            {Icon && <Icon className="size-3.5" />}
            {triggerText && <span>{triggerText}</span>}
          </Button>
        </DialogTrigger>
        <DialogContent className="rounded-xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              {isEdit ? "Edit Question Item" : "Add Question Item"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {isEdit
                ? "Modify question text or evaluation criteria."
                : "Add an evaluation statement or rating criterion."}
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="py-2">
            <form.Field
              name="question"
              children={(field) => (
                <FormTextField
                  field={field}
                  label="Question Statement"
                  disabled={isPending}
                  placeholder="e.g. Starts and ends classes on time."
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
                  {isPending ? "Saving..." : isEdit ? "Update Question" : "Add Question"}
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
              {isEdit ? "Update question statement?" : "Add question statement?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              This item will be saved under this category.
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
              {isPending ? "Saving..." : "Yes, confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={dialog.confirmDiscardOpen} onOpenChange={dialog.setConfirmDiscardOpen}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold">
              Discard unsaved changes?
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
