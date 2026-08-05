import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { Plus, Pencil, Calendar as CalendarIcon, type LucideIcon } from "lucide-react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { FieldGroup } from "@/components/ui/field";
import { useEntityDialog } from "@/hooks/use-entity-dialog";
import { cn } from "@/lib/utils";

import { useSemesters } from "@/features/semester/api/semester.service";
import { useEvaluationForms } from "@/features/evaluation-management/api/evaluation-form.service";
import { useCreateSchedule, useUpdateSchedule } from "../api/evaluation-schedule.service";
import { formatScheduleRange } from "../utils/schedule-status.util";

import {
  type EvaluationType,
  type ScheduleSelect,
  type UpsertScheduleReq,
} from "backend/types/evaluation-schedule.type";

interface ScheduleUpsertDialogProps {
  type: EvaluationType;
  defaultData?: ScheduleSelect;
  triggerText?: string;
  icon?: LucideIcon;
  variant?: "default" | "outline" | "secondary" | "ghost";
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const toDateString = (date?: string | Date) => {
  if (!date) return "";
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

interface DatePickerProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  hasError?: boolean;
}

const DatePicker = ({ value, onChange, disabled, hasError }: DatePickerProps) => {
  const dateVal = value ? new Date(value) : undefined;

  const handleSelectDate = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    onChange(`${year}-${month}-${day}`);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal text-xs h-9 min-w-0",
            !dateVal && "text-muted-foreground",
            hasError && "border-destructive text-destructive focus-visible:ring-destructive",
          )}
        >
          <CalendarIcon className="mr-2 size-3.5 shrink-0" />
          {dateVal ? (
            dateVal.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          ) : (
            <span>Pick a date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={dateVal} onSelect={handleSelectDate} />
      </PopoverContent>
    </Popover>
  );
};

export const ScheduleUpsertDialog = ({
  type,
  defaultData,
  triggerText,
  icon: Icon,
  variant = defaultData ? "ghost" : "default",
  className,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: ScheduleUpsertDialogProps) => {
  const isEditMode = !!defaultData;
  const TriggerIcon = Icon ?? (isEditMode ? Pencil : Plus);
  const buttonText = triggerText ?? (isEditMode ? "Edit Schedule" : "Schedule Evaluation");

  const { data: semesterResponse, isLoading: isLoadingSemesters } = useSemesters({
    search: "",
    page: 1,
    orderBy: "id",
    orderDir: "desc",
  });
  const { data: forms = [], isLoading: isLoadingForms } = useEvaluationForms(type);

  const semesters = semesterResponse?.data ?? [];

  const createMutation = useCreateSchedule();
  const updateMutation = useUpdateSchedule();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const initialFormData = {
    semester_id: defaultData?.semester_id ?? 0,
    form_id: defaultData?.form_id ?? 0,
    open_at: toDateString(defaultData?.open_at ?? new Date()),
    close_at: toDateString(defaultData?.close_at ?? new Date(Date.now() + 86400000 * 7)),
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
    mutationFn: async (payload) => {
      if (isEditMode && defaultData) {
        return updateMutation.mutateAsync({ type, id: defaultData.id, payload });
      }
      return createMutation.mutateAsync({ type, payload });
    },
    loadingText: isEditMode ? "Saving schedule updates..." : "Creating evaluation schedule...",
    successText: isEditMode
      ? "Evaluation schedule updated successfully."
      : "Evaluation schedule created successfully.",
  });

  const isControlled = controlledOpen !== undefined;

  // Sync controlled `open` prop into internal dialog state
  useEffect(() => {
    if (isControlled && controlledOpen !== dialog.open) {
      dialog.handleOpenChange(controlledOpen);
    }
  }, [isControlled, controlledOpen]);

  // Sync internal close actions (Cancel, Discard, or Submit) back to parent state
  useEffect(() => {
    if (isControlled && !dialog.open) {
      controlledOnOpenChange?.(false);
    }
  }, [isControlled, dialog.open]);

  const handleOpenChange = (newOpen: boolean) => {
    dialog.handleOpenChange(newOpen);
    controlledOnOpenChange?.(newOpen);
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
        {!isControlled && (
          <DialogTrigger asChild>
            <Button
              type="button"
              variant={variant}
              className={cn(
                isEditMode
                  ? "w-full h-8 justify-start px-2 py-1.5 text-xs font-normal rounded-sm"
                  : "rounded-lg p-4 flex items-center justify-center gap-1.5 text-sm",
                className,
              )}
            >
              <TriggerIcon className="size-3.5 shrink-0" />
              <span className="leading-none">{buttonText}</span>
            </Button>
          </DialogTrigger>
        )}

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Edit Evaluation Schedule" : "Schedule Evaluation Period"}
            </DialogTitle>
            <DialogDescription>
              Set the active start and end timeframe for{" "}
              <span className="capitalize font-medium text-foreground">{type}</span> evaluation
              submissions.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="space-y-4">
            {/* Semester Selector */}
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
                      htmlFor="semester-select"
                      className={cn("text-xs font-medium", hasError && "text-destructive")}
                    >
                      Academic Semester
                    </Label>
                    <Select
                      disabled={isPending || isLoadingSemesters}
                      value={field.state.value ? String(field.state.value) : ""}
                      onValueChange={(val) => field.handleChange(Number(val))}
                    >
                      <SelectTrigger
                        id="semester-select"
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

            {/* Evaluation Form Selector */}
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
                      htmlFor="form-select"
                      className={cn("text-xs font-medium", hasError && "text-destructive")}
                    >
                      Evaluation Form
                    </Label>
                    <Select
                      disabled={isPending || isLoadingForms}
                      value={field.state.value ? String(field.state.value) : ""}
                      onValueChange={(val) => field.handleChange(Number(val))}
                    >
                      <SelectTrigger
                        id="form-select"
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

            {/* Calendar Opening Date */}
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
                      disabled={isPending}
                      hasError={hasError}
                    />
                    {renderFieldError(errors)}
                  </div>
                );
              }}
            />

            {/* Calendar Closing Date */}
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
                      disabled={isPending}
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
                  {isPending
                    ? isEditMode
                      ? "Saving..."
                      : "Creating..."
                    : isEditMode
                      ? "Save Changes"
                      : "Create Schedule"}
                </Button>
              )}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal */}
      <AlertDialog open={dialog.confirmSaveOpen} onOpenChange={dialog.setConfirmSaveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isEditMode ? "Save schedule changes?" : "Publish evaluation schedule?"}
            </AlertDialogTitle>
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
            <AlertDialogCancel disabled={isPending}>Go back</AlertDialogCancel>
            <AlertDialogAction onClick={dialog.confirmSave} disabled={isPending}>
              {isPending ? "Saving..." : "Confirm & Save"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Discard Confirmation Modal */}
      <AlertDialog open={dialog.confirmDiscardOpen} onOpenChange={dialog.setConfirmDiscardOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes in this schedule form. Closing now will discard your entries.
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
