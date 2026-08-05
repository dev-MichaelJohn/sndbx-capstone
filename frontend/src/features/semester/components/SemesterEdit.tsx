import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import toast from "react-hot-toast";
import type { LucideIcon } from "lucide-react";
import { CalendarIcon, Pencil } from "lucide-react";
import { format, parseISO } from "date-fns";
import type { DateRange } from "react-day-picker";

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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { FormTextField } from "@/components/form-text-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SemesterEditDialogProps {
  semester: SemesterSelect;
  icon?: LucideIcon;
  triggerText?: string;
}

export const SemesterEditDialog = ({
  semester,
  icon: Icon = Pencil,
  triggerText = "Edit",
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
    validators: { onSubmit: SemesterUpdateSchema },
    onSubmit: async ({ value }) => {
      setPendingValue(value);
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
          <div className="flex w-full items-center gap-2 px-2 py-1.5 text-xs">
            <Icon className="size-3.5" />
            <span>{triggerText}</span>
          </div>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Academic Semester</DialogTitle>
            <DialogDescription>
              Modify school year bounds, term details, and schedule limits.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            {/* Semester Term */}
            <form.Field
              name="semester_term"
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Semester Term</FieldLabel>
                  <Select
                    value={field.state.value}
                    onValueChange={(val) => field.handleChange(val as "1st" | "2nd" | "Summer")}
                    disabled={updateSemesterMutation.isPending}
                  >
                    <SelectTrigger id={field.name} className="h-9">
                      <SelectValue placeholder="Select Term" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1st">1st Semester</SelectItem>
                      <SelectItem value="2nd">2nd Semester</SelectItem>
                      <SelectItem value="Summer">Summer / Midyear</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
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
                  <Field>
                    <FieldLabel>SY End Year</FieldLabel>
                    <Input
                      type="number"
                      value={startYear ? Number(startYear) + 1 : ""}
                      disabled
                      className="h-9 bg-muted text-muted-foreground"
                    />
                  </Field>
                )}
              />
            </div>

            {/* Date Range Picker using date-fns */}
            <form.Subscribe
              selector={(state) => [state.values.start_date, state.values.end_date] as const}
              children={([startDateStr, endDateStr]) => {
                const dateRange: DateRange | undefined = {
                  from: startDateStr ? parseISO(startDateStr) : undefined,
                  to: endDateStr ? parseISO(endDateStr) : undefined,
                };

                const handleRangeSelect = (range: DateRange | undefined) => {
                  form.setFieldValue(
                    "start_date",
                    range?.from ? format(range.from, "yyyy-MM-dd") : "",
                  );
                  form.setFieldValue("end_date", range?.to ? format(range.to, "yyyy-MM-dd") : "");
                };

                return (
                  <Field>
                    <FieldLabel>Semester Duration</FieldLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="date-range"
                          variant="outline"
                          disabled={updateSemesterMutation.isPending}
                          className={cn(
                            "w-full justify-start text-left font-normal h-9",
                            !dateRange.from && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 size-4" />
                          {dateRange.from ? (
                            dateRange.to ? (
                              <>
                                {format(dateRange.from, "LLL dd, yyyy")} –{" "}
                                {format(dateRange.to, "LLL dd, yyyy")}
                              </>
                            ) : (
                              format(dateRange.from, "LLL dd, yyyy")
                            )
                          ) : (
                            <span>Pick duration dates</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          autoFocus
                          mode="range"
                          defaultMonth={dateRange.from}
                          selected={dateRange}
                          onSelect={handleRangeSelect}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                  </Field>
                );
              }}
            />
          </FieldGroup>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={attemptClose}
              disabled={updateSemesterMutation.isPending}
            >
              Cancel
            </Button>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isDirty] as const}
              children={([canSubmit, isDirty]) => (
                <Button
                  type="button"
                  size="sm"
                  disabled={!canSubmit || !isDirty || updateSemesterMutation.isPending}
                  onClick={() => form.handleSubmit()}
                >
                  {updateSemesterMutation.isPending ? "Saving..." : "Update Semester"}
                </Button>
              )}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Confirmation Alert */}
      <AlertDialog open={confirmSaveOpen} onOpenChange={setConfirmSaveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Semester Record?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingValue &&
                `This will update SY ${pendingValue.school_year_start}–${Number(pendingValue.school_year_start) + 1} (${pendingValue.semester_term} Semester) duration to run from ${pendingValue.start_date} to ${pendingValue.end_date}.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updateSemesterMutation.isPending}>
              Keep Editing
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmSave} disabled={updateSemesterMutation.isPending}>
              {updateSemesterMutation.isPending ? "Updating..." : "Yes, Update"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Discard Confirmation Alert */}
      <AlertDialog open={confirmDiscardOpen} onOpenChange={setConfirmDiscardOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes in this form. Closing now will lose all modifications.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Editing</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDiscard}>Discard</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
