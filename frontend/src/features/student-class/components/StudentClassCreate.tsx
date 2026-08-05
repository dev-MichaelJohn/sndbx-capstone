import { useState, useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import type { LucideIcon } from "lucide-react";

import { formatFullName } from "@/lib/nameFormatter";
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

import {
  ExistingStudentSearch,
  type StudentUser,
} from "@/srcx/features/class-student/components/ExistingStudentSearch";

import { useStudentList } from "@/srcx/features/user/api/user.service";
import { useEnrollIrregularStudent } from "../api/student-class.service";
import type { StudentClassInsert } from "backend/types/student-class.type";
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
  const [selectedStudent, setSelectedStudent] = useState<StudentUser | null>(null);

  const { mutateAsync, isPending } = useEnrollIrregularStudent();

  const { data: studentData, isLoading: isStudentsLoading } = useStudentList({
    search: studentSearch.trim().length >= 2 ? studentSearch : undefined,
  });

  const studentList = (studentData?.data ?? []) as StudentUser[];

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

  // Sync internal dialog state to external parent state when dialog closes
  useEffect(() => {
    if (setControlledOpen && controlledOpen !== dialog.open) {
      setControlledOpen(dialog.open);
    }
  }, [dialog.open, controlledOpen, setControlledOpen]);

  // Sync external parent state to internal dialog state when opened
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
    ? `${formatFullName({
        first_name: selectedStudent.first_name,
        middle_name: selectedStudent.middle_name ?? "",
        last_name: selectedStudent.last_name,
        suffix: selectedStudent.suffix ?? "",
      })} will be manually enrolled into this course offering.`
    : "Please select a student to enroll.";

  return (
    <>
      <Dialog open={dialog.open} onOpenChange={handleOpenChange}>
        {Icon && (
          <DialogTrigger asChild>
            <Button type="button" className="rounded-lg p-4 flex items-center justify-center gap-1">
              <Icon className="size-3.5" />
              <span className="leading-none text-sm">{triggerText}</span>
            </Button>
          </DialogTrigger>
        )}
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enroll Irregular Student</DialogTitle>
            <DialogDescription>
              Search and select an active student account to manually enroll them in this course
              offering.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <form.Field
              name="student_account_id"
              children={() => (
                <div className="space-y-2">
                  <Label>Select Student</Label>
                  <ExistingStudentSearch
                    search={studentSearch}
                    onSearchChange={setStudentSearch}
                    users={studentList}
                    isSearching={isStudentsLoading}
                    selected={selectedStudent}
                    onSelect={(user) => {
                      form.setFieldValue("student_account_id", user.id);
                      setSelectedStudent(user);
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
            >
              Cancel
            </Button>
            <form.Subscribe
              selector={(state) => [state.canSubmit] as const}
              children={([canSubmit]) => (
                <Button
                  type="button"
                  disabled={!canSubmit || !selectedStudent || isPending}
                  onClick={() => form.handleSubmit()}
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Student Enrollment?</AlertDialogTitle>
            <AlertDialogDescription>{enrollSummary}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Go back</AlertDialogCancel>
            <AlertDialogAction onClick={dialog.confirmSave} disabled={isPending}>
              {isPending ? "Enrolling..." : "Yes, enroll student"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={dialog.confirmDiscardOpen} onOpenChange={dialog.setConfirmDiscardOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have selected a student. Closing now will cancel this enrollment action.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDiscard}>Discard</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
