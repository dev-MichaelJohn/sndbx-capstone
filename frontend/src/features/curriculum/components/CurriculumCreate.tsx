import { useState, useRef } from "react";
import { useForm } from "@tanstack/react-form";
import { Check, ChevronsUpDown, type LucideIcon } from "lucide-react";
import { CurriculumSchema, type CurriculumInsert } from "backend/types/curriculum.type";
import { useCreateCurriculum } from "../api/curriculum.service";
import { useCourses } from "@/features/course/api/course.service";
import { useEntityDialog } from "@/hooks/use-entity-dialog";

import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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

interface CurriculumCreateDialogProps {
  programId: number;
  icon?: LucideIcon;
  triggerText?: string;
}

export const CurriculumCreateDialog = ({
  programId,
  icon: Icon,
  triggerText = "Add Curriculum Item",
}: CurriculumCreateDialogProps) => {
  const [courseComboOpen, setCourseComboOpen] = useState(false);
  const [courseSearch, setCourseSearch] = useState("");

  const { mutateAsync, isPending } = useCreateCurriculum();
  const { data: coursesData } = useCourses({ search: courseSearch || undefined, page: 1 });
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
  });

  handleFormSubmitRef.current = dialog.handleFormSubmit;

  return (
    <Dialog open={dialog.open} onOpenChange={dialog.handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" className="rounded-lg p-4 flex items-center justify-center gap-1">
          {Icon && <Icon className="size-4" />}
          <span className="leading-none text-sm">{triggerText}</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Curriculum Item</DialogTitle>
          <DialogDescription>
            Search and assign a course to this program's academic curriculum structure.
          </DialogDescription>
        </DialogHeader>

        <FieldGroup className="space-y-3">
          {/* Searchable Course Dropdown / Combobox */}
          <form.Field
            name="course_id"
            validators={{
              onSubmit: ({ value }) =>
                !value || value <= 0 ? "Please select a course" : undefined,
            }}
            children={(field) => {
              const selectedCourse = courses.find((c) => c.id === field.state.value);

              return (
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-semibold">Course Selection</Label>
                  <Popover open={courseComboOpen} onOpenChange={setCourseComboOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={courseComboOpen}
                        disabled={isPending}
                        className="w-full justify-between h-9 text-xs rounded-xl font-normal"
                      >
                        {selectedCourse
                          ? `${selectedCourse.initialism} — ${selectedCourse.name}`
                          : "Search and select course..."}
                        <ChevronsUpDown className="ml-2 size-3.5 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                      <Command shouldFilter={false}>
                        <CommandInput
                          placeholder="Search course title or code..."
                          value={courseSearch}
                          onValueChange={setCourseSearch}
                          className="text-xs"
                        />
                        <CommandList className="max-h-52">
                          {courses.length === 0 ? (
                            <CommandEmpty className="p-3 text-xs text-muted-foreground text-center">
                              No courses found.
                            </CommandEmpty>
                          ) : (
                            <CommandGroup>
                              {courses.map((course) => (
                                <CommandItem
                                  key={course.id}
                                  value={String(course.id)}
                                  onSelect={() => {
                                    field.handleChange(course.id);
                                    setCourseComboOpen(false);
                                  }}
                                  className="text-xs flex items-center justify-between cursor-pointer"
                                >
                                  <span>
                                    <strong className="font-semibold text-primary">
                                      {course.initialism}
                                    </strong>{" "}
                                    — {course.name}
                                  </span>
                                  {field.state.value === course.id && (
                                    <Check className="size-3.5 text-primary" />
                                  )}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-[11px] font-medium text-destructive">
                      {field.state.meta.errors.join(", ")}
                    </p>
                  )}
                </div>
              );
            }}
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
                  <SelectTrigger className="w-full h-9 text-xs rounded-xl">
                    <SelectValue placeholder="Select year level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="I">Year I (First Year)</SelectItem>
                    <SelectItem value="II">Year II (Second Year)</SelectItem>
                    <SelectItem value="III">Year III (Third Year)</SelectItem>
                    <SelectItem value="IV">Year IV (Fourth Year)</SelectItem>
                    <SelectItem value="V">Year V (Fifth Year)</SelectItem>
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
                  <SelectTrigger className="w-full h-9 text-xs rounded-xl">
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1st">1st Semester</SelectItem>
                    <SelectItem value="2nd">2nd Semester</SelectItem>
                    <SelectItem value="Summer">Summer / Midyear</SelectItem>
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
                className="h-8 rounded-lg text-xs font-medium"
              >
                {isPending ? "Adding..." : "Add to Curriculum"}
              </Button>
            )}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
