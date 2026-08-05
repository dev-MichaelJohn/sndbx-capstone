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
import { useDeleteCourse } from "../api/course.service";
import { useCurriculums } from "@/features/curriculum/api/curriculum.service";
import { useProgram } from "@/features/program/api/program.service";
import type { CourseSelect } from "backend/types/course.type";
import type { CurriculumWithDetails } from "backend/types/curriculum.type";
import { cn } from "@/lib/utils";

interface CourseDeleteDialogProps {
  course: CourseSelect;
  icon?: LucideIcon;
  triggerText?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
}

// Sub-component to safely call useProgram per item without violating React hook rules
const CurriculumListItem = ({ item }: { item: CurriculumWithDetails }) => {
  const { data: programData } = useProgram(item.program_id);

  // Fallback to embedded relation if available, otherwise use data from useProgram hook
  const programName = programData?.name;
  const programInitialism = programData?.initialism;

  const displayProgram = programName
    ? `${programName} (${programInitialism})`
    : `Program ID: ${item.program_id}`;

  return (
    <li>
      {displayProgram} — Year {item.year_level}, {item.semester_term} Semester
    </li>
  );
};

export const CourseDeleteDialog = ({
  course,
  icon: Icon = Trash2,
  triggerText = "Delete",
  variant = "ghost",
  className,
}: CourseDeleteDialogProps) => {
  const [open, setOpen] = useState(false);
  const { mutateAsync, isPending: isDeleting } = useDeleteCourse();

  const {
    data: curriculumsResponse,
    isLoading: isCheckingCurriculums,
    isError: isCheckError,
  } = useCurriculums({ course_id: course.id, page: 1 }, { enabled: open });

  const curriculums = curriculumsResponse?.data ?? [];
  const hasCurriculums = curriculums.length > 0;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (hasCurriculums || isCheckingCurriculums) return;

    const toastId = toast.loading(`Deleting ${course.initialism}...`);
    try {
      await mutateAsync(course.id);
      toast.success("Course record deleted successfully.", { id: toastId });
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete course record.", {
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
          <AlertDialogTitle>Delete {course.name}?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 pt-1 text-sm text-muted-foreground">
              <p>
                This action cannot be undone. This will permanently remove the course record from
                the system.
              </p>

              {/* Loader while checking database */}
              {isCheckingCurriculums && (
                <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3 text-xs text-muted-foreground">
                  <Loader2 className="size-4 animate-spin text-primary" />
                  Checking for curriculum entries referencing this course...
                </div>
              )}

              {/* Blocked state visual callout */}
              {!isCheckingCurriculums && hasCurriculums && (
                <div className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold">Cannot delete course record</p>
                    <p className="text-destructive/90">
                      This course is currently referenced in <strong>{curriculums.length}</strong>{" "}
                      curriculum entry(ies):
                    </p>
                    <ul className="list-disc pl-4 font-medium space-y-0.5">
                      {curriculums.slice(0, 3).map((item) => (
                        <CurriculumListItem key={item.id} item={item} />
                      ))}
                      {curriculums.length > 3 && <li>...and {curriculums.length - 3} more</li>}
                    </ul>
                    <p className="pt-1 text-destructive/80">
                      Please remove this course from all program curricula before deleting it.
                    </p>
                  </div>
                </div>
              )}

              {/* Error fallback if checking failed */}
              {isCheckError && (
                <p className="text-xs text-destructive">
                  Failed to verify linked curriculum entries. Please try again or check your network
                  connection.
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {hasCurriculums ? "Close" : "Cancel"}
          </AlertDialogCancel>

          {!hasCurriculums && (
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting || isCheckingCurriculums || isCheckError}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Yes, delete course"}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
