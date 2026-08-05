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

import { useDeleteClass } from "../api/class.service";
import { useCourseOfferings } from "@/srcx/features/offerings/api/offerings.service";
import { useClassStudents } from "@/srcx/features/class-student/api/class-student.service";

import type { StudentClassWithDetails } from "backend/types/student-class.type";
import { cn } from "@/srcx/lib/utils";

interface ClassDeleteDialogProps {
  classItem: StudentClassWithDetails;
  icon?: LucideIcon;
  triggerText?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
}

export const ClassDeleteDialog = ({
  classItem,
  icon: Icon = Trash2,
  triggerText = "Delete",
  variant = "ghost",
  className,
}: ClassDeleteDialogProps) => {
  const [open, setOpen] = useState(false);
  const { mutateAsync, isPending: isDeleting } = useDeleteClass();

  // ── Parallel Relation Checks ─────────────────────────────────────────────
  const {
    data: offeringsRes,
    isLoading: isCheckingOfferings,
    isError: isOfferingsError,
  } = useCourseOfferings({ class_id: classItem.id, page: 1 });

  const {
    data: studentsRes,
    isLoading: isCheckingStudents,
    isError: isStudentsError,
  } = useClassStudents({ class_id: classItem.id, page: 1 }, { enabled: open });

  const offeringsCount = offeringsRes?.pagination?.totalItems ?? offeringsRes?.data?.length ?? 0;
  const studentsCount = studentsRes?.pagination?.totalItems ?? studentsRes?.data?.length ?? 0;

  const isChecking = isCheckingOfferings || isCheckingStudents;
  const isCheckError = isOfferingsError || isStudentsError;
  const isBlocked = offeringsCount > 0 || studentsCount > 0;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isBlocked || isChecking) return;

    const toastId = toast.loading(
      `Deleting class ${classItem.course_initialism} ${classItem.class_year_level}${classItem.class_section}...`,
    );
    try {
      await mutateAsync(classItem.id);
      toast.success("Class block deleted successfully.", { id: toastId });
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete class block.", {
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
          <AlertDialogTitle>
            Delete{" "}
            {`${classItem.course_initialism} ${classItem.class_year_level}${classItem.class_section}`}
            ?
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 pt-1 text-sm text-muted-foreground">
              <p>
                This action cannot be undone. This will permanently soft-delete class block{" "}
                <strong>{`${classItem.course_initialism} ${classItem.class_year_level}${classItem.class_section}`}</strong>{" "}
                from the system.
              </p>

              {/* Loader while checking database */}
              {isChecking && (
                <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3 text-xs text-muted-foreground">
                  <Loader2 className="size-4 animate-spin text-primary" />
                  Checking for active offerings and student enrollments...
                </div>
              )}

              {/* Blocked state visual callout */}
              {!isChecking && isBlocked && (
                <div className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold">Cannot delete class block</p>
                    <p className="text-destructive/90 pb-0.5">This class is currently linked to:</p>
                    <ul className="list-disc pl-4 font-medium space-y-0.5">
                      {offeringsCount > 0 && (
                        <li>
                          <strong>{offeringsCount}</strong> active course offering(s)
                        </li>
                      )}
                      {studentsCount > 0 && (
                        <li>
                          <strong>{studentsCount}</strong> enrolled student(s)
                        </li>
                      )}
                    </ul>
                    <p className="pt-1.5 text-destructive/80">
                      Please remove all course offerings and unassign enrolled students before
                      deleting this class block.
                    </p>
                  </div>
                </div>
              )}

              {/* Error fallback if checking failed */}
              {isCheckError && !isChecking && (
                <p className="text-xs text-destructive">
                  Failed to verify linked class records. Please try again or check your network
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
              {isDeleting ? "Deleting..." : "Yes, delete class"}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
