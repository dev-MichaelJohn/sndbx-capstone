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
import { useEntityDialog } from "@/hooks/use-entity-dialog";
import { useAddQuestion, useUpdateQuestion } from "../api/evaluation-form.service";
import {
  UpsertQuestionReqSchema,
  type EvaluationType,
  type QuestionSelect,
  type UpsertQuestionReq,
} from "backend/types/evaluation-form.type";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface QuestionDialogProps {
  type: EvaluationType;
  formId: number;
  categoryId: number;
  initialData?: QuestionSelect;
  defaultMaxRating?: number;
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
  defaultMaxRating = 5,
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
    max_rating: initialData?.max_rating ?? defaultMaxRating,
    order: initialData?.order ?? nextOrder,
  };

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: ({ value }) => {
        const result = UpsertQuestionReqSchema.safeParse(value);
        if (!result.success) {
          return result.error.issues.map((i) => i.message).join(", ");
        }
        return undefined;
      },
    },
    onSubmit: ({ value }) => {
      dialog.handleFormSubmit({
        value: {
          ...value,
          max_rating: Number(value.max_rating ?? defaultMaxRating),
        },
      });
    },
  });

  const dialog = useEntityDialog<UpsertQuestionReq>({
    form: form as any,
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
    loadingText: isEdit ? "Updating question..." : "Adding question...",
    successText: isEdit ? "Question updated." : "Question added.",
  });

  return (
    <>
      <Dialog open={dialog.open} onOpenChange={dialog.handleOpenChange}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant={variant}
            size={size}
            className={
              className ??
              "h-7 cursor-pointer gap-1 rounded-lg text-xs font-medium active:scale-[0.96]"
            }
          >
            {Icon && <Icon className="size-3.5" />}
            {triggerText && <span>{triggerText}</span>}
          </Button>
        </DialogTrigger>

        <DialogContent className="rounded-2xl sm:max-w-md border border-border/80 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {isEdit ? "Edit Question Statement" : "Add Question Statement"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {isEdit
                ? "Modify statement criteria or evaluation indicators."
                : "Add a rating statement to this evaluation criteria section."}
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="py-2">
            <form.Field
              name="question"
              validators={{
                onChange: ({ value }) =>
                  !value || !value.trim() ? "Question statement is required" : undefined,
              }}
              children={(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name} className="text-xs font-semibold">
                    Question Statement / Indicator
                  </Label>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    disabled={isPending}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g. Explains lesson objectives clearly at the start of class."
                    className="min-h-24 text-xs rounded-xl bg-card border-border/70 resize-y"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-[11px] font-medium text-destructive">
                      {field.state.meta.errors.join(", ")}
                    </p>
                  )}
                </div>
              )}
            />
          </FieldGroup>

          <DialogFooter className="pt-2">
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
                  className="h-8 cursor-pointer rounded-lg text-xs font-bold bg-primary text-primary-foreground shadow-sm active:scale-[0.96]"
                >
                  {isPending ? "Saving..." : isEdit ? "Update Statement" : "Add Statement"}
                </Button>
              )}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Confirmation Modal */}
      <AlertDialog open={dialog.confirmSaveOpen} onOpenChange={dialog.setConfirmSaveOpen}>
        <AlertDialogContent className="rounded-2xl border border-border/80 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold">
              {isEdit ? "Update question statement?" : "Add question statement?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              This statement will be evaluated on a scale up to{" "}
              <strong className="text-foreground">
                {dialog.pendingValue?.max_rating ?? defaultMaxRating}
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
              className="h-8 rounded-lg text-xs font-bold"
            >
              {isPending ? "Saving..." : "Yes, confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Discard Confirmation Modal */}
      <AlertDialog open={dialog.confirmDiscardOpen} onOpenChange={dialog.setConfirmDiscardOpen}>
        <AlertDialogContent className="rounded-2xl border border-border/80 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold">Discard changes?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Closing now will discard your question entry.
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
