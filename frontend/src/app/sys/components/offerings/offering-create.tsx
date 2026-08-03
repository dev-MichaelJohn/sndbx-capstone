import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import type { CourseOfferingInsert } from "backend/types/offerings.type";
import { CourseOfferingSchema } from "backend/types/offerings.type";

import { useSemesters } from "@/features/sys/semester.service";
import { useCurriculums } from "@/features/sys/curriculum.service";
import { useFacultyList } from "@/features/sys/user.service";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface OfferingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: number;
  programId?: number;
  onSubmit: (data: CourseOfferingInsert) => void;
  isLoading?: boolean;
}

export const OfferingDialog = ({
  open,
  onOpenChange,
  classId,
  programId,
  onSubmit,
  isLoading,
}: OfferingDialogProps) => {
  const { data: semestersData, isLoading: isSemestersLoading } = useSemesters({
    page: 1,
    search: undefined,
    orderBy: "id",
    orderDir: "desc",
  });
  const { data: curriculumData, isLoading: isCurriculumLoading } = useCurriculums({
    program_id: programId,
    page: 1,
  });
  const { data: facultyData, isLoading: isFacultyLoading } = useFacultyList();

  const semesters = semestersData?.data ?? [];
  const curriculumCourses = curriculumData?.data ?? [];
  const facultyList = facultyData?.data ?? [];

  const form = useForm({
    defaultValues: {
      class_id: classId,
      course_curriculum_id: 0,
      semester_id: 0,
      faculty_id: 0,
    } as CourseOfferingInsert,
    validators: {
      onChange: CourseOfferingSchema.insert,
    },
    onSubmit: async ({ value }) => {
      onSubmit(value);
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        class_id: classId,
        course_curriculum_id: 0,
        semester_id: 0,
        faculty_id: 0,
      });
    }
  }, [open, classId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Course Offering</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4 pt-2"
        >
          {/* Course Curriculum Select */}
          <form.Field
            name="course_curriculum_id"
            children={(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name}>Course Curriculum</Label>
                <Select
                  value={field.state.value ? String(field.state.value) : ""}
                  onValueChange={(val) => field.handleChange(Number(val))}
                  disabled={isCurriculumLoading}
                >
                  <SelectTrigger id={field.name} className="w-full text-xs">
                    <SelectValue
                      placeholder={
                        isCurriculumLoading ? "Loading courses..." : "Select curriculum course"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {curriculumCourses.map((item) => (
                      <SelectItem key={item.id} value={String(item.id)} className="text-xs">
                        {item.initialism} — {item.name} (Yr {item.year_level}, {item.semester_term})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-destructive">
                    {field.state.meta.errors.map((err) => err?.message ?? String(err)).join(", ")}
                  </p>
                )}
              </div>
            )}
          />

          {/* Academic Semester Select */}
          <form.Field
            name="semester_id"
            children={(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name}>Academic Semester</Label>
                <Select
                  value={field.state.value ? String(field.state.value) : ""}
                  onValueChange={(val) => field.handleChange(Number(val))}
                  disabled={isSemestersLoading}
                >
                  <SelectTrigger id={field.name} className="w-full text-xs">
                    <SelectValue
                      placeholder={
                        isSemestersLoading ? "Loading semesters..." : "Select active semester"
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
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-destructive">
                    {field.state.meta.errors.map((err) => err?.message ?? String(err)).join(", ")}
                  </p>
                )}
              </div>
            )}
          />

          {/* Faculty Select */}
          <form.Field
            name="faculty_id"
            children={(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name}>Assigned Faculty</Label>
                <Select
                  value={field.state.value ? String(field.state.value) : ""}
                  onValueChange={(val) => field.handleChange(Number(val))}
                  disabled={isFacultyLoading}
                >
                  <SelectTrigger id={field.name} className="w-full text-xs">
                    <SelectValue
                      placeholder={
                        isFacultyLoading ? "Loading faculty..." : "Select assigned instructor"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {facultyList.map((faculty) => (
                      <SelectItem key={faculty.id} value={String(faculty.id)} className="text-xs">
                        {faculty.first_name} {faculty.last_name}{" "}
                        {faculty.institutional_id ? `(${faculty.institutional_id})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-destructive">
                    {field.state.meta.errors.map((err) => err?.message ?? String(err)).join(", ")}
                  </p>
                )}
              </div>
            )}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button type="submit" size="sm" disabled={!canSubmit || isSubmitting || isLoading}>
                  {(isLoading || isSubmitting) && (
                    <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                  )}
                  {isLoading || isSubmitting ? "Creating..." : "Create Offering"}
                </Button>
              )}
            />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
