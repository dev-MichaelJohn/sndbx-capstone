import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { CourseOfferingSchema, type CourseOfferingInsert } from "backend/types/offerings.type";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface OfferingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: number;
  onSubmit: (data: CourseOfferingInsert) => void;
  isLoading?: boolean;
}

export const OfferingDialog = ({
  open,
  onOpenChange,
  classId,
  onSubmit,
  isLoading,
}: OfferingDialogProps) => {
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
          {/* Curriculum Course ID */}
          <form.Field
            name="course_curriculum_id"
            children={(field) => (
              <div className="space-y-1">
                <Label htmlFor={field.name}>Course Curriculum ID</Label>
                <Input
                  id={field.name}
                  type="number"
                  placeholder="Enter Curriculum ID"
                  value={field.state.value || ""}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-destructive">
                    {field.state.meta.errors.map((err) => err?.message ?? String(err)).join(", ")}
                  </p>
                )}
              </div>
            )}
          />

          {/* Semester ID */}
          <form.Field
            name="semester_id"
            children={(field) => (
              <div className="space-y-1">
                <Label htmlFor={field.name}>Semester ID</Label>
                <Input
                  id={field.name}
                  type="number"
                  placeholder="Enter Semester ID"
                  value={field.state.value || ""}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-destructive">
                    {field.state.meta.errors.map((err) => err?.message ?? String(err)).join(", ")}
                  </p>
                )}
              </div>
            )}
          />

          {/* Faculty ID */}
          <form.Field
            name="faculty_id"
            children={(field) => (
              <div className="space-y-1">
                <Label htmlFor={field.name}>Faculty Account ID</Label>
                <Input
                  id={field.name}
                  type="number"
                  placeholder="Enter Faculty ID"
                  value={field.state.value || ""}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-destructive">
                    {field.state.meta.errors.map((err) => err?.message ?? String(err)).join(", ")}
                  </p>
                )}
              </div>
            )}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting || isLoading}>
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
