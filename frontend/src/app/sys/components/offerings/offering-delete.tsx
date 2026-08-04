import { useState } from "react";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AlertCircle, Loader2, Trash2, type LucideIcon } from "lucide-react";
import toast from "react-hot-toast";

import { useDeleteCourseOffering } from "@/features/sys/offerings.service";
import { useCourseOfferingStudents } from "@/features/sys/student-class.service";

import type { CourseOfferingWithDetails } from "backend/types/offerings.type";
import { cn } from "@/lib/utils";

interface CourseOfferingDeleteDialogProps {
  offering: CourseOfferingWithDetails;
  icon?: LucideIcon;
  triggerText?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
}

export const CourseOfferingDeleteDialog = ({
  offering,
  icon: Icon = Trash2,
  triggerText = "Remove",
  variant = "ghost",
  className,
}: CourseOfferingDeleteDialogProps) => {
  const [open, setOpen] = useState(false);
  const { mutateAsync, isPending: isDeleting } = useDeleteCourseOffering();

  // Check for enrolled students tied to this course offering
  const {
    data: studentsRes,
    isLoading: isCheckingStudents,
    isError: isStudentsError,
  } = useCourseOfferingStudents(offering.id, { page: 1 }, { enabled: open });

  const studentsCount = studentsRes?.pagination?.totalItems ?? studentsRes?.data?.length ?? 0;

  const isChecking = isCheckingStudents;
  const isCheckError = isStudentsError;
  const isBlocked = studentsCount > 0;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isBlocked || isChecking) return;

    const toastId = toast.loading(`Deleting course offering...`);
    try {
      await mutateAsync(offering.id);
      toast.success("Course offering deleted successfully.", { id: toastId });
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete course offering.", {
        id: toastId,
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant={variant}
          size="sm"
          className={cn(
            "w-full h-8 justify-start px-2 py-1.5 text-xs font-normal cursor-pointer rounded-sm text-destructive hover:text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive focus-visible:outline-none",
            className,
          )}
        >
          <Icon className="mr-2 size-3.5 shrink-0" />
          <span>{triggerText}</span>
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Course Offering?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 pt-1 text-sm text-muted-foreground">
              <p>
                Are you sure you want to remove the course offering for{" "}
                <strong>{offering.course_name}</strong> ({offering.course_initialism})? This action
                cannot be undone.
              </p>

              {/* Loader while checking database */}
              {isChecking && (
                <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3 text-xs text-muted-foreground">
                  <Loader2 className="size-4 animate-spin text-primary" />
                  Checking for enrolled students in this course offering...
                </div>
              )}

              {/* Blocked state visual callout */}
              {!isChecking && isBlocked && (
                <div className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold">Cannot delete course offering</p>
                    <p className="text-destructive/90">
                      There are currently <strong>{studentsCount}</strong> student(s) enrolled in
                      this offering.
                    </p>
                    <p className="pt-1 text-destructive/80">
                      Please unenroll or drop all students from this course offering before deleting
                      it.
                    </p>
                  </div>
                </div>
              )}

              {/* Error fallback if checking failed */}
              {isCheckError && !isChecking && (
                <p className="text-xs text-destructive">
                  Failed to verify student enrollments. Please try again or check your network
                  connection.
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {isBlocked ? "Close" : "Cancel"}
          </AlertDialogCancel>

          {!isBlocked && (
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting || isChecking || isCheckError}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Yes, delete offering"}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
