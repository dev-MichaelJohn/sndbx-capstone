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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEntityDialog } from "@/hooks/use-entity-dialog";
import { useCreateEvaluationForm } from "../api/evaluation-form.service";
import {
  CreateFormReqSchema,
  type CreateFormReq,
  type EvaluationType,
} from "backend/types/evaluation-form.type";
import { Textarea } from "@/components/ui/textarea";

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
    validators: {
      onSubmit: ({ value }) => {
        const result = CreateFormReqSchema.safeParse({
          ...value,
          min_rating: Number(value.min_rating),
          max_rating: Number(value.max_rating),
        });
        if (!result.success) {
          return result.error.issues.map((i) => i.message).join(", ");
        }
        return undefined;
      },
    },
    onSubmit: ({ value }) => {
      const payload: CreateFormReq = {
        title: value.title.trim(),
        description: value.description?.trim() || undefined,
        min_rating: Number(value.min_rating),
        max_rating: Number(value.max_rating),
      };
      dialog.handleFormSubmit({ value: payload });
    },
  });

  const dialog = useEntityDialog<CreateFormReq>({
    form: form as any,
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

        <DialogContent className="rounded-2xl sm:max-w-md border border-border/80 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Create Evaluation Instrument</DialogTitle>
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
              validators={{
                onChange: ({ value }) => (!value || !value.trim() ? "Title required" : undefined),
              }}
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
                <div className="space-y-1.5">
                  <Label htmlFor={field.name} className="text-xs font-semibold">
                    Description (Optional)
                  </Label>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    disabled={isPending}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g. Standard evaluation form for instructional effectiveness"
                    className="min-h-20 text-xs rounded-xl bg-card border-border/70 resize-y"
                  />
                </div>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <form.Field
                name="min_rating"
                children={(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={field.name} className="text-xs font-medium">
                      Min Score Bound
                    </Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="number"
                      min={0}
                      value={field.state.value}
                      disabled={isPending}
                      onChange={(e) => field.handleChange(e.target.valueAsNumber || 0)}
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                )}
              />

              <form.Field
                name="max_rating"
                validators={{
                  onChangeListenTo: ["min_rating"],
                  onChange: ({ value, fieldApi }) => {
                    const min = fieldApi.form.getFieldValue("min_rating");
                    if (Number(value) <= Number(min)) {
                      return "Max score must be greater than min score";
                    }
                    return undefined;
                  },
                }}
                children={(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={field.name} className="text-xs font-medium">
                      Max Score Bound
                    </Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="number"
                      min={1}
                      value={field.state.value}
                      disabled={isPending}
                      onChange={(e) => field.handleChange(e.target.valueAsNumber || 0)}
                      className="h-8 text-xs font-mono"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-[11px] font-medium text-destructive">
                        {field.state.meta.errors.join(", ")}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>
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
                  {isPending ? "Creating..." : "Create Form"}
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
              Create new evaluation form?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              This will create a new evaluation instrument template with score range{" "}
              <strong className="text-foreground font-semibold">
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
              className="h-8 rounded-lg text-xs font-bold"
            >
              {isPending ? "Creating..." : "Yes, create form"}
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
              Closing now will discard your entries.
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
