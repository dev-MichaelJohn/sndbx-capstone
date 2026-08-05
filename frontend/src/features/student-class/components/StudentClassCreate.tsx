import { useState, useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";

import { EligibleStudentSearch } from "./EligibleStudentSearch";
import {
  useEligibleStudentsForOffering,
  useEnrollIrregularStudent,
} from "../api/student-class.service";
import type { EligibleStudentOption, StudentClassInsert } from "backend/types/student-class.type";
import { useEntityDialog } from "@/hooks/use-entity-dialog";

interface CourseOfferingStudentEnrollDialogProps {
  courseOfferingId: number;
  icon?: LucideIcon;
  triggerText?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const CourseOfferingStudentEnrollDialog = ({
  courseOfferingId,
  icon: Icon,
  triggerText = "Enroll Student",
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: CourseOfferingStudentEnrollDialogProps) => {
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<EligibleStudentOption | null>(null);

  const { mutateAsync, isPending } = useEnrollIrregularStudent();

  const { data: eligibleStudents, isLoading: isStudentsLoading } = useEligibleStudentsForOffering(
    courseOfferingId,
    studentSearch,
  );

  const initialFormData: StudentClassInsert = {
    course_offering_id: courseOfferingId,
    student_account_id: 0,
  };

  const form = useForm({
    defaultValues: initialFormData,
    onSubmit: (values) => dialog.handleFormSubmit(values),
  });

  const resetStudentState = () => {
    setStudentSearch("");
    setSelectedStudent(null);
  };

  const dialog = useEntityDialog<StudentClassInsert>({
    form,
    mutationFn: mutateAsync,
    loadingText: "Enrolling student...",
    successText: "Student successfully enrolled in course offering.",
    onReset: resetStudentState,
  });

  useEffect(() => {
    if (setControlledOpen && controlledOpen !== dialog.open) {
      setControlledOpen(dialog.open);
    }
  }, [dialog.open, controlledOpen, setControlledOpen]);

  useEffect(() => {
    if (controlledOpen && !dialog.open) {
      dialog.handleOpenChange(true);
    }
  }, [controlledOpen]);

  const handleOpenChange = (newOpen: boolean) => {
    dialog.handleOpenChange(newOpen);
  };

  const handleConfirmDiscard = () => {
    dialog.confirmDiscard();
    setControlledOpen?.(false);
  };

  const enrollSummary = selectedStudent
    ? `${selectedStudent.student_name} will be enrolled into this course offering.`
    : "Please select a student to enroll.";

  return (
    <>
      <Dialog open={dialog.open} onOpenChange={handleOpenChange}>
        {Icon && (
          <DialogTrigger asChild>
            <Button
              type="button"
              className="flex items-center justify-center gap-1.5 rounded-lg text-xs font-medium"
            >
              <Icon className="size-3.5" />
              <span>{triggerText}</span>
            </Button>
          </DialogTrigger>
        )}
        <DialogContent className="rounded-xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Enroll Student in Offering
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Search and select an active student account to enroll them directly into this course
              offering roster.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="py-2">
            <form.Field
              name="student_account_id"
              children={() => (
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Select Student</Label>
                  <EligibleStudentSearch
                    search={studentSearch}
                    onSearchChange={setStudentSearch}
                    students={eligibleStudents}
                    isLoading={isStudentsLoading}
                    selected={selectedStudent}
                    onSelect={(student) => {
                      form.setFieldValue("student_account_id", student.student_account_id);
                      setSelectedStudent(student);
                    }}
                    onClear={() => {
                      setSelectedStudent(null);
                      form.setFieldValue("student_account_id", 0);
                    }}
                  />
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
              className="h-8 rounded-lg text-xs"
            >
              Cancel
            </Button>
            <form.Subscribe
              selector={(state) => [state.canSubmit] as const}
              children={([canSubmit]) => (
                <Button
                  type="button"
                  size="sm"
                  disabled={!canSubmit || !selectedStudent || isPending}
                  onClick={() => form.handleSubmit()}
                  className="h-8 rounded-lg text-xs"
                >
                  {isPending ? "Enrolling..." : "Enroll Student"}
                </Button>
              )}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialogs */}
      <AlertDialog open={dialog.confirmSaveOpen} onOpenChange={dialog.setConfirmSaveOpen}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold">
              Confirm Student Enrollment?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              {enrollSummary}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending} className="h-8 rounded-lg text-xs">
              Go back
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={dialog.confirmSave}
              disabled={isPending}
              className="h-8 rounded-lg text-xs"
            >
              {isPending ? "Enrolling..." : "Yes, enroll student"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={dialog.confirmDiscardOpen} onOpenChange={dialog.setConfirmDiscardOpen}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold">
              Discard changes?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              You have selected a student. Closing now will cancel this enrollment action.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-8 rounded-lg text-xs">Keep editing</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDiscard} className="h-8 rounded-lg text-xs">
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
