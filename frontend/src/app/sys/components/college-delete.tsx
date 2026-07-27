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
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Loader2, Trash2, type LucideIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useDeleteCollege } from "@/features/sys/college.service";
import type { CollegeWithDean } from "backend/types/college.types";
import { getProgramsViaCollegeID } from "@/features/sys/program.service";

interface CollegeDeleteDialogProps {
  college: CollegeWithDean;
  icon?: LucideIcon;
  triggerText?: string;
}

export const CollegeDeleteDialog = ({
  college,
  icon: Icon = Trash2,
  triggerText = "Delete",
}: CollegeDeleteDialogProps) => {
  const [open, setOpen] = useState(false);
  const { mutateAsync, isPending: isDeleting } = useDeleteCollege();

  const {
    data: programsResponse,
    isLoading: isCheckingPrograms,
    isError: isCheckError,
  } = useQuery({
    queryKey: ["getCollegePrograms", college.id],
    queryFn: () => getProgramsViaCollegeID(college.id),
    enabled: open,
  });

  const programs = programsResponse?.data ?? [];
  const hasPrograms = programs.length > 0;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (hasPrograms || isCheckingPrograms) return;

    const toastId = toast.loading(`Deleting ${college.initialism}...`);
    try {
      await mutateAsync(college.id);
      toast.success("College record deleted successfully.", { id: toastId });
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete college record.", {
        id: toastId,
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 rounded-md px-2.5 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <Icon className="mr-1 size-3.5" />
          {triggerText}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {college.name}?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 pt-1 text-sm text-muted-foreground">
              <p>
                This action cannot be undone. This will permanently remove the college record from
                the system.
              </p>

              {/* Loader while checking database */}
              {isCheckingPrograms && (
                <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3 text-xs text-muted-foreground">
                  <Loader2 className="size-4 animate-spin text-primary" />
                  Checking for existing programs linked to this college...
                </div>
              )}

              {/* Blocked state visual callout */}
              {!isCheckingPrograms && hasPrograms && (
                <div className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold">Cannot delete college record</p>
                    <p className="text-destructive/90">
                      This college has <strong>{programs.length} program(s)</strong> linked to it:
                    </p>
                    <ul className="list-disc pl-4 font-medium">
                      {programs.slice(0, 3).map((prog) => (
                        <li key={prog.id}>
                          {prog.name} ({prog.initialism})
                        </li>
                      ))}
                      {programs.length > 3 && <li>...and {programs.length - 3} more</li>}
                    </ul>
                    <p className="pt-1 text-destructive/80">
                      Please reassign or delete these programs before deleting this college.
                    </p>
                  </div>
                </div>
              )}

              {/* Error fallback if checking failed */}
              {isCheckError && (
                <p className="text-xs text-destructive">
                  Failed to verify linked programs. Please try again or check your network
                  connection.
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {hasPrograms ? "Close" : "Cancel"}
          </AlertDialogCancel>

          {!hasPrograms && (
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting || isCheckingPrograms || isCheckError}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Yes, delete college"}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
