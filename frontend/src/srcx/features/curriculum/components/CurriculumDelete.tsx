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

import { useDeleteCurriculum } from "../api/curriculum.service";
import { useCourseOfferings } from "@/srcx/features/offerings/api/offerings.service";
import { useProgram } from "@/srcx/features/program/api/program.service";

import type { CurriculumWithDetails } from "backend/types/curriculum.type";
import { cn } from "@/srcx/lib/utils";

interface CurriculumDeleteDialogProps {
  curriculum: CurriculumWithDetails;
  icon?: LucideIcon;
  triggerText?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
}

export const CurriculumDeleteDialog = ({
  curriculum,
  icon: Icon = Trash2,
  triggerText = "Delete",
  variant = "ghost",
  className,
}: CurriculumDeleteDialogProps) => {
  const [open, setOpen] = useState(false);
  const { mutateAsync, isPending: isDeleting } = useDeleteCurriculum();

  // Resolve program details for title & context
  const { data: program } = useProgram(curriculum.program_id);

  // ── Parallel Relation Checks ─────────────────────────────────────────────
  // Filter course offerings by course_id (and optionally search context)
  const {
    data: offeringsRes,
    isLoading: isCheckingOfferings,
    isError: isOfferingsError,
  } = useCourseOfferings({ page: 1 });

  // Filter offerings associated with this curriculum entry
  const linkedOfferings = (offeringsRes?.data ?? []).filter(
    (offering) => offering.course_curriculum_id === curriculum.id,
  );

  const offeringsCount = linkedOfferings.length;

  const isChecking = isCheckingOfferings;
  const isCheckError = isOfferingsError;
  const isBlocked = offeringsCount > 0;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isBlocked || isChecking) return;

    const toastId = toast.loading(`Deleting curriculum entry...`);
    try {
      await mutateAsync(curriculum.id);
      toast.success("Curriculum entry deleted successfully.", { id: toastId });
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete curriculum entry.", {
        id: toastId,
      });
    }
  };

  const courseDisplayName = curriculum.name
    ? `${curriculum.name} (${curriculum.initialism})`
    : `Course ID: ${curriculum.course_id}`;

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
          <AlertDialogTitle>Delete Curriculum Entry?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 pt-1 text-sm text-muted-foreground">
              <p>
                Are you sure you want to remove <strong>{courseDisplayName}</strong> from Year{" "}
                {curriculum.year_level}, {curriculum.semester_term} Semester
                {program ? ` of ${program.initialism}` : ""}?
              </p>

              {/* Loader while checking database */}
              {isChecking && (
                <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3 text-xs text-muted-foreground">
                  <Loader2 className="size-4 animate-spin text-primary" />
                  Checking for active course offerings referencing this curriculum entry...
                </div>
              )}

              {/* Blocked state visual callout */}
              {!isChecking && isBlocked && (
                <div className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold">Cannot delete curriculum entry</p>
                    <p className="text-destructive/90">
                      This curriculum entry is currently assigned to{" "}
                      <strong>{offeringsCount}</strong> active course offering(s).
                    </p>
                    <p className="pt-1 text-destructive/80">
                      Please remove or reassign all active course offerings for this subject before
                      deleting this curriculum entry.
                    </p>
                  </div>
                </div>
              )}

              {/* Error fallback if checking failed */}
              {isCheckError && !isChecking && (
                <p className="text-xs text-destructive">
                  Failed to verify linked course offerings. Please try again or check your network
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
              {isDeleting ? "Deleting..." : "Yes, delete curriculum entry"}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
