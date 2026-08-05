import { useRef } from "react";
import { useForm } from "@tanstack/react-form";
import type { LucideIcon } from "lucide-react";
import { CurriculumSchema, type CurriculumInsert } from "backend/types/curriculum.type";
import { useCreateCurriculum } from "../api/curriculum.service";
import { useCourses } from "@/features/course/api/course.service";
import { useEntityDialog } from "@/hooks/use-entity-dialog";

import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
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
  icon: Icon,
  triggerText = "Add Curriculum Item",
}: CurriculumCreateDialogProps) => {
  const { mutateAsync, isPending } = useCreateCurriculum();

  const { data: coursesData } = useCourses({ page: 1 });
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
    validators: {
      onSubmit: CurriculumSchema.insert,
    },
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
    <>
      <Dialog open={dialog.open} onOpenChange={dialog.handleOpenChange}>
        <DialogTrigger asChild>
          <Button type="button" className="rounded-lg p-4 flex items-center justify-center gap-1">
            {Icon && <Icon className="size-4" />}
            <span className="leading-none text-sm">{triggerText}</span>
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Curriculum Item</DialogTitle>
            <DialogDescription>
              Assign a course to this program's academic curriculum structure.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            {/* Course Selection */}
            <form.Field
              name="course_id"
              children={(field) => (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Course</label>
                  <Select
                    value={field.state.value ? String(field.state.value) : ""}
                    onValueChange={(val) => field.handleChange(Number(val))}
                    disabled={isPending}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={String(course.id)}>
                          {course.initialism} - {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {field.state.meta.errors ? (
                    <p className="text-xs text-destructive">{field.state.meta.errors.join(", ")}</p>
                  ) : null}
                </div>
              )}
            />

            {/* Year Level Selection */}
            <form.Field
              name="year_level"
              children={(field) => (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Year Level</label>
                  <Select
                    value={field.state.value}
                    onValueChange={(val) => field.handleChange(val as any)}
                    disabled={isPending}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select year level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="I">I</SelectItem>
                      <SelectItem value="II">II</SelectItem>
                      <SelectItem value="III">III</SelectItem>
                      <SelectItem value="IV">IV</SelectItem>
                      <SelectItem value="V">V</SelectItem>
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
                  <label className="text-sm font-medium">Semester Term</label>
                  <Select
                    value={field.state.value}
                    onValueChange={(val) => field.handleChange(val as any)}
                    disabled={isPending}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1st">1st</SelectItem>
                      <SelectItem value="2nd">2nd</SelectItem>
                      <SelectItem value="Summer">Summer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
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
                  {isPending ? "Adding..." : "Add to Curriculum"}
                </Button>
              )}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Confirmation Modal */}
      <AlertDialog open={dialog.confirmSaveOpen} onOpenChange={dialog.setConfirmSaveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Curriculum Addition</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to add this course to the program curriculum?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Go back</AlertDialogCancel>
            <AlertDialogAction onClick={dialog.confirmSave} disabled={isPending}>
              {isPending ? "Adding..." : "Yes, add course"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Discard Confirmation Modal */}
      <AlertDialog open={dialog.confirmDiscardOpen} onOpenChange={dialog.setConfirmDiscardOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Closing now will discard your entry.
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
