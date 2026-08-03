import { useForm } from "@tanstack/react-form";
import toast from "react-hot-toast";
import { UserPlus } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { StudentClassSchema, type StudentClassInsert } from "backend/types/student-class.type";
import { useEnrollIrregularStudent } from "@/features/sys/student-class.service";

interface CourseOfferingStudentEnrollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseOfferingId: number;
}

export const CourseOfferingStudentEnrollDialog = ({
  open,
  onOpenChange,
  courseOfferingId,
}: CourseOfferingStudentEnrollDialogProps) => {
  const enrollMutation = useEnrollIrregularStudent();

  const form = useForm({
    defaultValues: {
      course_offering_id: courseOfferingId,
      student_account_id: 0,
    } as StudentClassInsert,
    validators: {
      onChange: StudentClassSchema.insert,
    },
    onSubmit: async ({ value }) => {
      try {
        await enrollMutation.mutateAsync({
          ...value,
          course_offering_id: courseOfferingId,
        });
        toast.success("Student enrolled in course offering successfully.");
        form.reset();
        onOpenChange(false);
      } catch (error) {
        toast.error((error as Error).message);
      }
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) form.reset();
        onOpenChange(val);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enroll Irregular Student</DialogTitle>
          <DialogDescription>
            Provide the active student account ID to add them to this course offering.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4 py-4"
        >
          <form.Field
            name="student_account_id"
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name} className="text-xs font-medium">
                  Student Account ID
                </Label>
                <Input
                  id={field.name}
                  type="number"
                  placeholder="Enter student account ID..."
                  value={field.state.value || ""}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.valueAsNumber || 0)}
                  className="h-9 text-xs"
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-[11px] text-destructive">
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
              </div>
            )}
          />

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                form.reset();
                onOpenChange(false);
              }}
              disabled={enrollMutation.isPending}
              className="cursor-pointer text-xs"
            >
              Cancel
            </Button>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  size="sm"
                  disabled={!canSubmit || enrollMutation.isPending || isSubmitting}
                  className="cursor-pointer text-xs"
                >
                  <UserPlus className="mr-1.5 size-3.5" />
                  {enrollMutation.isPending || isSubmitting ? "Enrolling..." : "Enroll Student"}
                </Button>
              )}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
