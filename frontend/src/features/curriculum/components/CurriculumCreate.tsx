import { useState, useEffect, useRef } from "react";
import { useForm } from "@tanstack/react-form";
import { Plus, type LucideIcon } from "lucide-react";
import { CurriculumSchema, type CurriculumInsert } from "backend/types/curriculum.type";
import type { CourseSelect } from "backend/types/course.type";
import { useCreateCurriculum } from "../api/curriculum.service";
import { useCourses } from "@/features/course/api/course.service";
import { useEntityDialog } from "@/hooks/use-entity-dialog";

import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface CurriculumCreateDialogProps {
  programId: number;
  icon?: LucideIcon;
  triggerText?: string;
}

export const CurriculumCreateDialog = ({
  programId,
  icon: Icon = Plus,
  triggerText = "Add Curriculum Item",
}: CurriculumCreateDialogProps) => {
  const [courseSearch, setCourseSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<CourseSelect | null>(null);

  // Debounce search input by 300ms
  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(courseSearch), 300);
    return () => clearTimeout(handle);
  }, [courseSearch]);

  const { mutateAsync, isPending } = useCreateCurriculum();

  // Server-side search across all courses under this program
  const { data: coursesData, isLoading: isCoursesLoading } = useCourses({
    program_id: programId,
    search: debouncedSearch.trim() || undefined,
    page: 1,
  });
  const courses = coursesData?.data ?? [];

  const initialFormData: CurriculumInsert = {
    program_id: programId,
    course_id: 0,
    year_level: "I",
    semester_term: "1st",
  };

  const handleFormSubmitRef = useRef<any>(null);

  const form = useForm({
    defaultValues: initialFormData,
    validators: { onSubmit: CurriculumSchema.insert },
    onSubmit: (args) => handleFormSubmitRef.current?.(args),
  });

  const dialog = useEntityDialog<CurriculumInsert>({
    form,
    mutationFn: mutateAsync,
    loadingText: "Adding curriculum record...",
    successText: "Curriculum entry added successfully.",
    onReset: () => {
      setCourseSearch("");
      setDebouncedSearch("");
      setSelectedCourse(null);
    },
  });

  handleFormSubmitRef.current = dialog.handleFormSubmit;

  return (
    <>
      <Dialog open={dialog.open} onOpenChange={dialog.handleOpenChange}>
        <DialogTrigger asChild>
          <Button
            type="button"
            className="h-8.5 rounded-xl px-3.5 text-xs font-bold gap-1.5 shadow-sm active:scale-[0.96] cursor-pointer"
          >
            {Icon && <Icon className="size-3.5" />}
            <span>{triggerText}</span>
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md rounded-2xl border border-border/80 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Add Curriculum Item</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Search and assign a course to this program's academic curriculum structure.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="space-y-3.5 py-1">
            {/* Dynamic Search & Select Course */}
            <form.Field
              name="course_id"
              validators={{
                onSubmit: ({ value }) =>
                  !value || value <= 0 ? "Please select a valid course" : undefined,
              }}
              children={(field) => (
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-semibold">Course</Label>

                  {selectedCourse ? (
                    <div className="flex items-center justify-between rounded-xl border bg-muted/30 p-3 text-xs">
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className="font-semibold text-foreground truncate">
                          {selectedCourse.name}
                        </span>
                        <span className="font-mono text-[10px] font-bold text-primary">
                          {selectedCourse.initialism}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isPending}
                        className="h-7 cursor-pointer rounded-lg px-2 text-xs hover:bg-background shrink-0"
                        onClick={() => {
                          setSelectedCourse(null);
                          field.handleChange(0);
                        }}
                      >
                        Change
                      </Button>
                    </div>
                  ) : (
                    <Command
                      className="w-full rounded-xl border border-border/70 shadow-2xs"
                      shouldFilter={false}
                    >
                      <CommandInput
                        placeholder="Search course title or code (e.g. IT 101)..."
                        value={courseSearch}
                        onValueChange={setCourseSearch}
                        className="text-xs"
                      />
                      <CommandList className="max-h-44">
                        {isCoursesLoading ? (
                          <CommandEmpty className="py-4 text-xs text-muted-foreground">
                            Searching courses...
                          </CommandEmpty>
                        ) : courses.length === 0 ? (
                          <CommandEmpty className="py-4 text-xs text-muted-foreground">
                            No matching courses found.
                          </CommandEmpty>
                        ) : (
                          <CommandGroup>
                            {courses.map((course) => (
                              <CommandItem
                                key={course.id}
                                value={String(course.id)}
                                onSelect={() => {
                                  setSelectedCourse(course);
                                  field.handleChange(course.id);
                                }}
                                className="flex cursor-pointer items-center justify-between py-2 text-xs"
                              >
                                <span className="truncate">
                                  <strong className="font-bold text-primary font-mono">
                                    {course.initialism}
                                  </strong>{" "}
                                  — {course.name}
                                </span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}
                      </CommandList>
                    </Command>
                  )}

                  {field.state.meta.errors.length > 0 && (
                    <p className="text-[11px] font-medium text-destructive">
                      {field.state.meta.errors.join(", ")}
                    </p>
                  )}
                </div>
              )}
            />

            {/* Year Level Selection */}
            <form.Field
              name="year_level"
              children={(field) => (
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-semibold">Year Level</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(val) => field.handleChange(val as any)}
                    disabled={isPending}
                  >
                    <SelectTrigger className="w-full h-9 text-xs rounded-xl bg-card border-border/70">
                      <SelectValue placeholder="Select year level" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="I" className="text-xs">
                        Year I (First Year)
                      </SelectItem>
                      <SelectItem value="II" className="text-xs">
                        Year II (Second Year)
                      </SelectItem>
                      <SelectItem value="III" className="text-xs">
                        Year III (Third Year)
                      </SelectItem>
                      <SelectItem value="IV" className="text-xs">
                        Year IV (Fourth Year)
                      </SelectItem>
                      <SelectItem value="V" className="text-xs">
                        Year V (Fifth Year)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            />

            {/* Semester Term Selection */}
            <form.Field
              name="semester_term"
              children={(field) => (
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-semibold">Semester Term</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(val) => field.handleChange(val as any)}
                    disabled={isPending}
                  >
                    <SelectTrigger className="w-full h-9 text-xs rounded-xl bg-card border-border/70">
                      <SelectValue placeholder="Select semester" />
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
          </FieldGroup>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={dialog.attemptClose}
              disabled={isPending}
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
                  disabled={!canSubmit || !selectedCourse || isPending}
                  onClick={() => form.handleSubmit()}
                  className="h-8.5 rounded-lg text-xs font-bold bg-primary text-primary-foreground shadow-sm active:scale-[0.96] cursor-pointer"
                >
                  {isPending ? "Adding..." : "Add to Curriculum"}
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
              Add Course to Curriculum?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              {selectedCourse && (
                <>
                  Are you sure you want to add{" "}
                  <strong className="text-foreground">
                    {selectedCourse.initialism} — {selectedCourse.name}
                  </strong>{" "}
                  to Year {dialog.pendingValue?.year_level} ({dialog.pendingValue?.semester_term}{" "}
                  Semester)?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending} className="h-8 rounded-lg text-xs">
              Go back
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={dialog.confirmSave}
              disabled={isPending}
              className="h-8 rounded-lg text-xs font-bold cursor-pointer"
            >
              {isPending ? "Adding..." : "Yes, add course"}
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
              You have unsaved selections in this form. Closing now will discard your entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-8 rounded-lg text-xs">Keep editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={dialog.confirmDiscard}
              className="h-8 rounded-lg text-xs cursor-pointer"
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
