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
import { useDeleteProgram } from "@/srcx/features/program/api/program.service";
import { useCourses } from "@/srcx/features/course/api/course.service";
import { useCurriculums } from "@/srcx/features/curriculum/api/curriculum.service";
import { cn } from "@/srcx/lib/utils";

interface ProgramDeleteDialogProps {
  program: {
    id: number;
    name: string;
    initialism: string;
  };
  icon?: LucideIcon;
  triggerText?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
}

export const ProgramDeleteDialog = ({
  program,
  icon: Icon = Trash2,
  triggerText = "Delete",
  variant = "ghost",
  className,
}: ProgramDeleteDialogProps) => {
  const [open, setOpen] = useState(false);
  const { mutateAsync, isPending: isDeleting } = useDeleteProgram();

  const {
    data: coursesResponse,
    isLoading: isCheckingCourses,
    isError: isCoursesError,
  } = useCourses({ program_id: program.id, page: 1 }, { enabled: open });

  const {
    data: curriculumsResponse,
    isLoading: isCheckingCurriculums,
    isError: isCurriculumsError,
  } = useCurriculums({ program_id: program.id, page: 1 }, { enabled: open });

  const courses = coursesResponse?.data ?? [];
  const curriculums = curriculumsResponse?.data ?? [];

  const hasCourses = courses.length > 0;
  const hasCurriculums = curriculums.length > 0;
  const hasLinkedItems = hasCourses || hasCurriculums;
  const isChecking = isCheckingCourses || isCheckingCurriculums;
  const isCheckError = isCoursesError || isCurriculumsError;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (hasLinkedItems || isChecking) return;

    const toastId = toast.loading(`Deleting ${program.initialism}...`);
    try {
      await mutateAsync(program.id);
      toast.success("Program record deleted successfully.", { id: toastId });
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete program record.", {
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
          <AlertDialogTitle>Delete {program.name}?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 pt-1 text-sm text-muted-foreground">
              <p>
                This action cannot be undone. This will permanently remove the program record from
                the system.
              </p>

              {/* Loader while checking database */}
              {isChecking && (
                <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3 text-xs text-muted-foreground">
                  <Loader2 className="size-4 animate-spin text-primary" />
                  Checking for existing courses and curriculum linked to this program...
                </div>
              )}

              {/* Blocked state visual callout */}
              {!isChecking && hasLinkedItems && (
                <div className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold">Cannot delete program record</p>
                    <p className="text-destructive/90">
                      This program has dependent records attached to it:
                    </p>
                    <ul className="list-disc pl-4 font-medium space-y-0.5">
                      {hasCourses && (
                        <li>
                          <strong>{courses.length}</strong> course(s)
                        </li>
                      )}
                      {hasCurriculums && (
                        <li>
                          <strong>{curriculums.length}</strong> curriculum entry(ies)
                        </li>
                      )}
                    </ul>
                    <p className="pt-1 text-destructive/80">
                      Please remove these associated courses and curriculum records before deleting
                      this program.
                    </p>
                  </div>
                </div>
              )}

              {/* Error fallback if checking failed */}
              {isCheckError && (
                <p className="text-xs text-destructive">
                  Failed to verify linked records. Please try again or check your network
                  connection.
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {hasLinkedItems ? "Close" : "Cancel"}
          </AlertDialogCancel>

          {!hasLinkedItems && (
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting || isChecking || isCheckError}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Yes, delete program"}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
