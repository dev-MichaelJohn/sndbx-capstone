import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import type { CourseOfferingUpdate, CourseOfferingWithDetails } from "backend/types/offerings.type";
import { CourseOfferingSchema } from "backend/types/offerings.type";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UpdateOfferingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offering: CourseOfferingWithDetails | null;
  onSubmit: (data: CourseOfferingUpdate) => void;
  isLoading?: boolean;
}

export const UpdateOfferingDialog = ({
  open,
  onOpenChange,
  offering,
  onSubmit,
  isLoading,
}: UpdateOfferingDialogProps) => {
  const form = useForm({
    defaultValues: {
      faculty_id: offering?.faculty_id ?? 0,
      semester_id: offering?.semester_id ?? 0,
      course_curriculum_id: offering?.course_curriculum_id ?? 0,
    } as CourseOfferingUpdate,
    validators: {
      onChange: CourseOfferingSchema.update,
    },
    onSubmit: async ({ value }) => {
      onSubmit(value);
    },
  });

  useEffect(() => {
    if (offering && open) {
      form.reset({
        faculty_id: offering.faculty_id,
        semester_id: offering.semester_id,
        course_curriculum_id: offering.course_curriculum_id,
      });
    }
  }, [offering, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Offering: {offering?.course_initialism}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4 pt-2"
        >
          <form.Field
            name="faculty_id"
            children={(field) => (
              <div className="space-y-1">
                <Label htmlFor={field.name}>Faculty Account ID</Label>
                <Input
                  id={field.name}
                  type="number"
                  placeholder="Enter Faculty ID"
                  value={field.state.value ?? ""}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                />
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
                  {isLoading || isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              )}
            />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
