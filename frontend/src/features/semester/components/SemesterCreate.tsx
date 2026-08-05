import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import toast from "react-hot-toast";
import type { LucideIcon } from "lucide-react";
import { CalendarIcon, Plus } from "lucide-react";
import { format, parseISO, addDays } from "date-fns";
import type { DateRange } from "react-day-picker";

import { SemesterInsertSchema, type SemesterInsert } from "backend/types/semester.type";
import { useCreateSemester } from "../api/semester.service";

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

interface SemesterCreateDialogProps {
  icon?: LucideIcon;
  triggerText?: string;
}

const currentYear = new Date().getFullYear();

export const SemesterCreateDialog = ({
  icon: Icon = Plus,
  triggerText = "Add Semester",
}: SemesterCreateDialogProps) => {
  const [open, setOpen] = useState(false);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);
  const [pendingValue, setPendingValue] = useState<SemesterInsert | null>(null);

  const createSemesterMutation = useCreateSemester();

  const today = new Date();
  const defaultEndDate = addDays(today, 120);

  const initialFormData: SemesterInsert = {
    semester_term: "1st",
    school_year_start: currentYear,
    start_date: format(today, "yyyy-MM-dd"),
    end_date: format(defaultEndDate, "yyyy-MM-dd"),
  };

  const form = useForm({
    defaultValues: initialFormData,
    validators: { onSubmit: SemesterInsertSchema },
    onSubmit: async ({ value }) => {
      setPendingValue(value);
      setConfirmSaveOpen(true);
    },
  });

  const resetEverything = () => {
    form.reset();
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
    const toastId = toast.loading("Creating semester record...");

    try {
      await createSemesterMutation.mutateAsync(pendingValue);
      toast.success("Semester created successfully.", { id: toastId });
      setConfirmSaveOpen(false);
      setOpen(false);
      resetEverything();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create semester.", {
        id: toastId,
      });
      setConfirmSaveOpen(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button size="sm" className="h-8 rounded-lg text-xs font-medium">
            <Icon className="mr-1.5 size-3.5" />
            <span>{triggerText}</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Academic Semester</DialogTitle>
            <DialogDescription>
              Set up school year boundaries, semester terms, and operational dates.
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
                    disabled={createSemesterMutation.isPending}
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
                    disabled={createSemesterMutation.isPending}
                    placeholder={String(currentYear)}
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
                          disabled={createSemesterMutation.isPending}
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
              disabled={createSemesterMutation.isPending}
            >
              Cancel
            </Button>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting] as const}
              children={([canSubmit]) => (
                <Button
                  type="button"
                  size="sm"
                  disabled={!canSubmit || createSemesterMutation.isPending}
                  onClick={() => form.handleSubmit()}
                >
                  {createSemesterMutation.isPending ? "Saving..." : "Save Semester"}
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
            <AlertDialogTitle>Create Semester Record?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingValue &&
                `This will set up SY ${pendingValue.school_year_start}–${Number(pendingValue.school_year_start) + 1} (${pendingValue.semester_term} Semester) running from ${pendingValue.start_date} to ${pendingValue.end_date}.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={createSemesterMutation.isPending}>
              Keep Editing
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmSave} disabled={createSemesterMutation.isPending}>
              {createSemesterMutation.isPending ? "Creating..." : "Yes, Save"}
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
              You have unsaved entries in this form. Closing now will lose all input.
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
