import { useState, useEffect } from "react";
import { useForm } from "@tanstack/react-form";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FieldGroup } from "@/components/ui/field";
import { useEntityDialog } from "@/hooks/use-entity-dialog";
import { cn } from "@/lib/utils";

import { useSemesters } from "@/features/semester/api/semester.service";
import { useEvaluationForms } from "@/features/evaluation-management/api/evaluation-form.service";
import { useUpdateSchedule } from "../api/evaluation-schedule.service";
import { formatScheduleRange } from "../utils/schedule-status.util";
import { DatePicker } from "./DatePicker";

import {
  type EvaluationType,
  type ScheduleSelect,
  type UpsertScheduleReq,
} from "backend/types/evaluation-schedule.type";

interface ScheduleEditDialogProps {
  type: EvaluationType;
  schedule: ScheduleSelect;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const toDateString = (date?: string | Date) => {
  if (!date) return "";
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const ScheduleEditDialog = ({
  type,
  schedule,
  open,
  onOpenChange,
}: ScheduleEditDialogProps) => {
  const [wasDialogOpen, setWasDialogOpen] = useState(false);

  const { data: semesterResponse, isLoading: isLoadingSemesters } = useSemesters({
    search: "",
    page: 1,
    orderBy: "id",
    orderDir: "desc",
  });
  const { data: forms = [], isLoading: isLoadingForms } = useEvaluationForms(type);
  const updateMutation = useUpdateSchedule();

  const semesters = semesterResponse?.data ?? [];

  const initialFormData = {
    semester_id: schedule.semester_id,
    form_id: schedule.form_id,
    open_at: toDateString(schedule.open_at),
    close_at: toDateString(schedule.close_at),
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
    mutationFn: (payload) => updateMutation.mutateAsync({ type, id: schedule.id, payload }),
    loadingText: "Saving schedule updates...",
    successText: "Evaluation schedule updated successfully.",
  });

  // Open internal dialog state when parent requests open
  useEffect(() => {
    if (open) {
      dialog.handleOpenChange(true);
    }
  }, [open]);

  // Track once dialog has officially opened in state
  useEffect(() => {
    if (dialog.open) {
      setWasDialogOpen(true);
    }
  }, [dialog.open]);

  // Notify parent component ONLY after the dialog has opened and then closed
  useEffect(() => {
    if (wasDialogOpen && !dialog.open) {
      onOpenChange(false);
    }
  }, [wasDialogOpen, dialog.open, onOpenChange]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      dialog.attemptClose();
    } else {
      dialog.handleOpenChange(true);
    }
  };

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
      <Dialog open={dialog.open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Evaluation Schedule</DialogTitle>
            <DialogDescription>
              Update active timeframe or form assignment for{" "}
              <span className="capitalize font-medium text-foreground">{type}</span> evaluation.
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
                      htmlFor="edit-semester-select"
                      className={cn("text-xs font-medium", hasError && "text-destructive")}
                    >
                      Academic Semester
                    </Label>
                    <Select
                      disabled={updateMutation.isPending || isLoadingSemesters}
                      value={field.state.value ? String(field.state.value) : ""}
                      onValueChange={(val) => field.handleChange(Number(val))}
                    >
                      <SelectTrigger
                        id="edit-semester-select"
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
                      htmlFor="edit-form-select"
                      className={cn("text-xs font-medium", hasError && "text-destructive")}
                    >
                      Evaluation Form
                    </Label>
                    <Select
                      disabled={updateMutation.isPending || isLoadingForms}
                      value={field.state.value ? String(field.state.value) : ""}
                      onValueChange={(val) => field.handleChange(Number(val))}
                    >
                      <SelectTrigger
                        id="edit-form-select"
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
                      disabled={updateMutation.isPending}
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
                      disabled={updateMutation.isPending}
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
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <form.Subscribe
              selector={(state) => [state.canSubmit] as const}
              children={([canSubmit]) => (
                <Button
                  type="button"
                  disabled={!canSubmit || updateMutation.isPending}
                  onClick={() => form.handleSubmit()}
                >
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              )}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={dialog.confirmSaveOpen} onOpenChange={dialog.setConfirmSaveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save schedule changes?</AlertDialogTitle>
            <AlertDialogDescription>
              This will update the evaluation window for Form #{dialog.pendingValue?.form_id} to{" "}
              <strong className="text-foreground">
                {dialog.pendingValue
                  ? formatScheduleRange(dialog.pendingValue.open_at, dialog.pendingValue.close_at)
                  : ""}
              </strong>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updateMutation.isPending}>Go back</AlertDialogCancel>
            <AlertDialogAction onClick={dialog.confirmSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Confirm & Save"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={dialog.confirmDiscardOpen} onOpenChange={dialog.setConfirmDiscardOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes in this form. Closing now will discard them.
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
