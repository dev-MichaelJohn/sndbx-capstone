import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { ClassStudentSchema, type ClassStudentInsert } from "backend/types/class-student.type";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { StudentCombobox } from "./student-combobox";

interface EnrollStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: number;
  onSubmit: (data: ClassStudentInsert) => void;
  isLoading?: boolean;
}

export const EnrollStudentDialog = ({
  open,
  onOpenChange,
  classId,
  onSubmit,
  isLoading,
}: EnrollStudentDialogProps) => {
  const form = useForm({
    defaultValues: {
      class_id: classId,
      student_account_id: 0,
    } as ClassStudentInsert,
    validators: {
      onChange: ClassStudentSchema.insert,
    },
    onSubmit: async ({ value }) => {
      onSubmit(value);
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        class_id: classId,
        student_account_id: 0,
      });
    }
  }, [open, classId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enroll Student</DialogTitle>
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
            name="student_account_id"
            children={(field) => {
              const errors = field.state.meta.errors;
              const errorMessage =
                errors.length > 0
                  ? errors.map((err) => err?.message ?? String(err)).join(", ")
                  : undefined;

              return (
                <div className="space-y-2">
                  <Label>Select Student Account</Label>
                  <StudentCombobox
                    value={field.state.value}
                    onChange={(val) => field.handleChange(val)}
                    error={errorMessage}
                  />
                </div>
              );
            }}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting || isLoading}>
                  {isLoading || isSubmitting ? "Enrolling..." : "Enroll Student"}
                </Button>
              )}
            />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
