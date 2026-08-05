import { useForm } from "@tanstack/react-form";
import { Plus, type LucideIcon } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FieldGroup } from "@/components/ui/field";
import { useEntityDialog } from "@/hooks/use-entity-dialog";
import { cn } from "@/lib/utils";

import { useSemesters } from "@/features/semester/api/semester.service";
import { useEvaluationForms } from "@/features/evaluation-management/api/evaluation-form.service";
import { useCreateSchedule } from "../api/evaluation-schedule.service";
import { formatScheduleRange } from "../utils/schedule-status.util";
import { DatePicker } from "./DatePicker";

import {
  type EvaluationType,
  type UpsertScheduleReq,
} from "backend/types/evaluation-schedule.type";

interface ScheduleCreateDialogProps {
  type: EvaluationType;
  triggerText?: string;
  icon?: LucideIcon;
  variant?: "default" | "outline" | "secondary" | "ghost";
  className?: string;
}

const toDateString = (date?: string | Date) => {
  if (!date) return "";
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const ScheduleCreateDialog = ({
  type,
  triggerText = "Schedule Evaluation",
  icon: Icon = Plus,
  variant = "default",
  className,
}: ScheduleCreateDialogProps) => {
  const { data: semesterResponse, isLoading: isLoadingSemesters } = useSemesters({
    search: "",
    page: 1,
    orderBy: "id",
    orderDir: "desc",
  });
  const { data: forms = [], isLoading: isLoadingForms } = useEvaluationForms(type);
  const createMutation = useCreateSchedule();

  const semesters = semesterResponse?.data ?? [];

  const initialFormData = {
    semester_id: 0,
    form_id: 0,
    open_at: toDateString(new Date()),
    close_at: toDateString(new Date(Date.now() + 86400000 * 7)),
  };

  const form = useForm({
    defaultValues: initialFormData,
    onSubmit: (values) => {
      const payload: UpsertScheduleReq = {
        semester_id: Number(values.value.semester_id),
        form_id: Number(values.value.form_id),
        open_at: new Date(values.value.open_at),
        close_at: new Date(values.value.close_at),
      };
      dialog.handleFormSubmit({ value: payload });
    },
  });

  const dialog = useEntityDialog<UpsertScheduleReq>({
    form: form as any,
    mutationFn: (payload) => createMutation.mutateAsync({ type, payload }),
    loadingText: "Creating evaluation schedule...",
    successText: "Evaluation schedule created successfully.",
  });

  const renderFieldError = (errors: any[]) => {
    if (!errors || errors.length === 0) return null;
    return (
      <p className="text-[11px] font-medium text-destructive">
        {errors.map((err) => (typeof err === "object" ? err?.message : String(err))).join(", ")}
      </p>
    );
  };

  return (
    <>
      <Dialog open={dialog.open} onOpenChange={dialog.handleOpenChange}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant={variant}
            className={cn(
              "rounded-lg p-4 flex items-center justify-center gap-1.5 text-sm",
              className,
            )}
          >
            <Icon className="size-3.5 shrink-0" />
            <span className="leading-none">{triggerText}</span>
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Evaluation Period</DialogTitle>
            <DialogDescription>
              Set the active start and end timeframe for{" "}
              <span className="capitalize font-medium text-foreground">{type}</span> evaluation
              submissions.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="space-y-4">
            <form.Field
              name="semester_id"
              validators={{
                onSubmit: ({ value }) =>
                  !value || Number(value) <= 0 ? "Select an academic semester" : undefined,
              }}
              children={(field) => {
                const errors = field.state.meta.errors;
                const hasError = errors.length > 0;
                return (
                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="create-semester-select"
                      className={cn("text-xs font-medium", hasError && "text-destructive")}
                    >
                      Academic Semester
                    </Label>
                    <Select
                      disabled={createMutation.isPending || isLoadingSemesters}
                      value={field.state.value ? String(field.state.value) : ""}
                      onValueChange={(val) => field.handleChange(Number(val))}
                    >
                      <SelectTrigger
                        id="create-semester-select"
                        className={cn(
                          "w-full text-xs",
                          hasError && "border-destructive focus:ring-destructive",
                        )}
                      >
                        <SelectValue
                          placeholder={
                            isLoadingSemesters ? "Loading semesters..." : "Select semester"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {semesters.map((sem) => (
                          <SelectItem key={sem.id} value={String(sem.id)} className="text-xs">
                            A.Y. {sem.school_year_start}–{sem.school_year_end} ({sem.semester_term}{" "}
                            Term)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {renderFieldError(errors)}
                  </div>
                );
              }}
            />

            <form.Field
              name="form_id"
              validators={{
                onSubmit: ({ value }) =>
                  !value || Number(value) <= 0 ? "Select an evaluation form" : undefined,
              }}
              children={(field) => {
                const errors = field.state.meta.errors;
                const hasError = errors.length > 0;
                return (
                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="create-form-select"
                      className={cn("text-xs font-medium", hasError && "text-destructive")}
                    >
                      Evaluation Form
                    </Label>
                    <Select
                      disabled={createMutation.isPending || isLoadingForms}
                      value={field.state.value ? String(field.state.value) : ""}
                      onValueChange={(val) => field.handleChange(Number(val))}
                    >
                      <SelectTrigger
                        id="create-form-select"
                        className={cn(
                          "w-full text-xs",
                          hasError && "border-destructive focus:ring-destructive",
                        )}
                      >
                        <SelectValue
                          placeholder={
                            isLoadingForms ? "Loading forms..." : "Select evaluation form"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {forms.map((formItem) => (
                          <SelectItem
                            key={formItem.id}
                            value={String(formItem.id)}
                            className="text-xs"
                          >
                            {formItem.title ?? `Form #${formItem.id}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {renderFieldError(errors)}
                  </div>
                );
              }}
            />

            <form.Field
              name="open_at"
              validators={{
                onSubmit: ({ value }) => (!value ? "Opening date is required" : undefined),
              }}
              children={(field) => {
                const errors = field.state.meta.errors;
                const hasError = errors.length > 0;
                return (
                  <div className="flex flex-col gap-1.5">
                    <Label className={cn("text-xs font-medium", hasError && "text-destructive")}>
                      Opening Date
                    </Label>
                    <DatePicker
                      value={field.state.value}
                      onChange={(val) => field.handleChange(val)}
                      disabled={createMutation.isPending}
                      hasError={hasError}
                    />
                    {renderFieldError(errors)}
                  </div>
                );
              }}
            />

            <form.Field
              name="close_at"
              validators={{
                onSubmit: ({ value, fieldApi }) => {
                  if (!value) return "Closing date is required";
                  const openAt = fieldApi.form.getFieldValue("open_at");
                  if (openAt && new Date(value) <= new Date(openAt)) {
                    return "Closing date must be after opening date";
                  }
                  return undefined;
                },
              }}
              children={(field) => {
                const errors = field.state.meta.errors;
                const hasError = errors.length > 0;
                return (
                  <div className="flex flex-col gap-1.5">
                    <Label className={cn("text-xs font-medium", hasError && "text-destructive")}>
                      Closing Date
                    </Label>
                    <DatePicker
                      value={field.state.value}
                      onChange={(val) => field.handleChange(val)}
                      disabled={createMutation.isPending}
                      hasError={hasError}
                    />
                    {renderFieldError(errors)}
                  </div>
                );
              }}
            />
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={dialog.attemptClose}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <form.Subscribe
              selector={(state) => [state.canSubmit] as const}
              children={([canSubmit]) => (
                <Button
                  type="button"
                  disabled={!canSubmit || createMutation.isPending}
                  onClick={() => form.handleSubmit()}
                >
                  {createMutation.isPending ? "Creating..." : "Create Schedule"}
                </Button>
              )}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={dialog.confirmSaveOpen} onOpenChange={dialog.setConfirmSaveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish evaluation schedule?</AlertDialogTitle>
            <AlertDialogDescription>
              This will set the evaluation window for Form #{dialog.pendingValue?.form_id} to{" "}
              <strong className="text-foreground">
                {dialog.pendingValue
                  ? formatScheduleRange(dialog.pendingValue.open_at, dialog.pendingValue.close_at)
                  : ""}
              </strong>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={createMutation.isPending}>Go back</AlertDialogCancel>
            <AlertDialogAction onClick={dialog.confirmSave} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Saving..." : "Confirm & Save"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={dialog.confirmDiscardOpen} onOpenChange={dialog.setConfirmDiscardOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved entries?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved entries in this form. Closing now will discard them.
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
