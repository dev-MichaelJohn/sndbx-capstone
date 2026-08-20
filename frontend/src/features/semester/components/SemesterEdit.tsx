import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import toast from "react-hot-toast";
import type { LucideIcon } from "lucide-react";
import { Calendar as CalendarIcon, Pencil } from "lucide-react";
import { format, parseISO, addDays, isValid } from "date-fns";

import {
  SemesterUpdateSchema,
  type SemesterSelect,
  type SemesterUpdate,
} from "backend/types/semester.type";
import { useUpdateSemester } from "../api/semester.service";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
import { FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { FormTextField } from "@/components/form-text-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SingleDatePickerFieldProps {
  label: string;
  value?: string;
  disabled?: boolean;
  hasError?: boolean;
  minDate?: Date;
  onChange: (val: string) => void;
}

const SingleDatePickerField = ({
  label,
  value,
  disabled,
  hasError,
  minDate,
  onChange,
}: SingleDatePickerFieldProps) => {
  const [open, setOpen] = useState(false);
  const parsedDate = value ? parseISO(value) : undefined;
  const isDateValid = parsedDate && isValid(parsedDate);

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onChange(format(date, "yyyy-MM-dd"));
      setOpen(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <Label className={cn("text-xs font-semibold", hasError && "text-destructive")}>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full h-8.5 justify-start text-left text-xs font-normal rounded-xl border-border/70 bg-card px-3 active:scale-[0.96]",
              !isDateValid && "text-muted-foreground",
              hasError && "border-destructive text-destructive focus:ring-destructive",
            )}
          >
            <CalendarIcon className="mr-2 size-3.5 shrink-0 text-muted-foreground" />
            {isDateValid ? (
              <span className="font-medium text-foreground">
                {format(parsedDate, "MMM dd, yyyy")}
              </span>
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 z-50 rounded-2xl border border-border/80 shadow-2xl"
          align="start"
        >
          <Calendar
            mode="single"
            selected={parsedDate}
            onSelect={handleSelect}
            defaultMonth={parsedDate ?? minDate ?? new Date()}
            disabled={minDate ? (date) => date < minDate : undefined}
            autoFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

interface SemesterEditDialogProps {
  semester: SemesterSelect;
  icon?: LucideIcon;
  triggerText?: string;
}

export const SemesterEditDialog = ({
  semester,
  icon: Icon = Pencil,
  triggerText = "Edit Term",
}: SemesterEditDialogProps) => {
  const [open, setOpen] = useState(false);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);
  const [pendingValue, setPendingValue] = useState<SemesterUpdate | null>(null);

  const updateSemesterMutation = useUpdateSemester();

  const initialFormData: SemesterUpdate = {
    semester_term: semester.semester_term,
    school_year_start: semester.school_year_start,
    start_date: semester.start_date,
    end_date: semester.end_date,
  };

  const form = useForm({
    defaultValues: initialFormData,
    validators: {
      onSubmit: ({ value }) => {
        const result = SemesterUpdateSchema.safeParse({
          ...value,
          school_year_start: value.school_year_start ? Number(value.school_year_start) : undefined,
        });
        if (!result.success) {
          return result.error.issues.map((i) => i.message).join(", ");
        }
        return undefined;
      },
    },
    onSubmit: async ({ value }) => {
      setPendingValue({
        ...value,
        school_year_start: value.school_year_start ? Number(value.school_year_start) : undefined,
      });
      setConfirmSaveOpen(true);
    },
  });

  const resetEverything = () => {
    form.reset(initialFormData);
    setPendingValue(null);
    setConfirmSaveOpen(false);
    setConfirmDiscardOpen(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setOpen(true);
      resetEverything();
      return;
    }
    attemptClose();
  };

  const attemptClose = () => {
    if (form.state.isDirty) {
      setConfirmDiscardOpen(true);
      return;
    }
    setOpen(false);
    resetEverything();
  };

  const confirmDiscard = () => {
    setConfirmDiscardOpen(false);
    setOpen(false);
    resetEverything();
  };

  const confirmSave = async () => {
    if (!pendingValue) return;
    const toastId = toast.loading("Updating semester record...");

    try {
      await updateSemesterMutation.mutateAsync({
        semester_id: semester.id,
        ...pendingValue,
      });
      toast.success("Semester updated successfully.", { id: toastId });
      setConfirmSaveOpen(false);
      setOpen(false);
      resetEverything();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update semester.", {
        id: toastId,
      });
      setConfirmSaveOpen(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-8 justify-start px-2.5 py-1.5 text-xs font-normal cursor-pointer rounded-lg text-foreground hover:bg-muted active:scale-[0.96]"
          >
            <Icon className="mr-2 size-3.5 text-muted-foreground" />
            <span>{triggerText}</span>
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md rounded-2xl border border-border/80 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Edit Academic Semester</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Modify school year bounds, term details, and operational schedule dates.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="space-y-3.5 py-1">
            {/* Semester Term Selector */}
            <form.Field
              name="semester_term"
              children={(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name} className="text-xs font-semibold">
                    Semester Term
                  </Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(val) => field.handleChange(val as "1st" | "2nd" | "Summer")}
                    disabled={updateSemesterMutation.isPending}
                  >
                    <SelectTrigger
                      id={field.name}
                      className="h-8.5 text-xs rounded-xl bg-card border-border/70"
                    >
                      <SelectValue placeholder="Select Term" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="1st" className="text-xs">
                        1st Semester
                      </SelectItem>
                      <SelectItem value="2nd" className="text-xs">
                        2nd Semester
                      </SelectItem>
                      <SelectItem value="Summer" className="text-xs">
                        Summer / Midyear
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            />

            {/* School Year Range */}
            <div className="grid grid-cols-2 gap-3">
              {/* SY Start Year */}
              <form.Field
                name="school_year_start"
                children={(field) => (
                  <FormTextField
                    field={field}
                    label="SY Start Year"
                    type="number"
                    disabled={updateSemesterMutation.isPending}
                    placeholder="2026"
                  />
                )}
              />

              {/* SY End Year (Derived / Read-only) */}
              <form.Subscribe
                selector={(state) => state.values.school_year_start}
                children={(startYear) => (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">
                      SY End Year
                    </Label>
                    <Input
                      type="number"
                      value={startYear ? Number(startYear) + 1 : ""}
                      disabled
                      className="h-8.5 rounded-xl bg-muted/40 text-muted-foreground font-mono text-xs cursor-not-allowed"
                    />
                  </div>
                )}
              />
            </div>

            {/* Distinct Separate Start Date & End Date Fields */}
            <div className="grid grid-cols-2 gap-3">
              {/* Start Date */}
              <form.Field
                name="start_date"
                validators={{
                  onChange: ({ value }) => (!value ? "Start date is required" : undefined),
                }}
                children={(field) => (
                  <SingleDatePickerField
                    label="Start Date"
                    value={field.state.value}
                    disabled={updateSemesterMutation.isPending}
                    hasError={field.state.meta.errors.length > 0}
                    onChange={(val) => field.handleChange(val)}
                  />
                )}
              />

              {/* End Date */}
              <form.Field
                name="end_date"
                validators={{
                  onChangeListenTo: ["start_date"],
                  onChange: ({ value, fieldApi }) => {
                    if (!value) return "End date is required";
                    const start = fieldApi.form.getFieldValue("start_date");
                    if (start && new Date(value) <= new Date(start)) {
                      return "End date must be after start date";
                    }
                    return undefined;
                  },
                }}
                children={(field) => {
                  const startDateStr = form.getFieldValue("start_date");
                  const minDate = startDateStr ? addDays(parseISO(startDateStr), 1) : undefined;

                  return (
                    <SingleDatePickerField
                      label="End Date"
                      value={field.state.value}
                      disabled={updateSemesterMutation.isPending}
                      hasError={field.state.meta.errors.length > 0}
                      minDate={minDate}
                      onChange={(val) => field.handleChange(val)}
                    />
                  );
                }}
              />
            </div>
          </FieldGroup>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={attemptClose}
              disabled={updateSemesterMutation.isPending}
              className="h-8.5 rounded-lg text-xs"
            >
              Cancel
            </Button>
            <form.Subscribe
              selector={(state) => [state.canSubmit] as const}
              children={([canSubmit]) => (
                <Button
                  type="button"
                  size="sm"
                  disabled={!canSubmit || updateSemesterMutation.isPending}
                  onClick={() => form.handleSubmit()}
                  className="h-8.5 rounded-lg text-xs font-bold bg-primary text-primary-foreground shadow-sm active:scale-[0.96]"
                >
                  {updateSemesterMutation.isPending ? "Updating..." : "Update Semester"}
                </Button>
              )}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Confirmation Modal */}
      <AlertDialog open={confirmSaveOpen} onOpenChange={setConfirmSaveOpen}>
        <AlertDialogContent className="rounded-2xl border border-border/80 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold">
              Update Semester Record?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              {pendingValue &&
                `This will update SY ${pendingValue.school_year_start}–${Number(pendingValue.school_year_start) + 1} (${pendingValue.semester_term} Semester) running from ${pendingValue.start_date} to ${pendingValue.end_date}.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={updateSemesterMutation.isPending}
              className="h-8 rounded-lg text-xs"
            >
              Keep Editing
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSave}
              disabled={updateSemesterMutation.isPending}
              className="h-8 rounded-lg text-xs font-bold"
            >
              {updateSemesterMutation.isPending ? "Updating..." : "Yes, Update"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Discard Confirmation Modal */}
      <AlertDialog open={confirmDiscardOpen} onOpenChange={setConfirmDiscardOpen}>
        <AlertDialogContent className="rounded-2xl border border-border/80 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold">Discard changes?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              You have unsaved changes in this form. Closing now will lose all modifications.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-8 rounded-lg text-xs">Keep Editing</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDiscard} className="h-8 rounded-lg text-xs">
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
