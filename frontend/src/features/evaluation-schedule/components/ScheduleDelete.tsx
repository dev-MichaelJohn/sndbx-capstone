import { useState } from "react";
import { AlertCircle, Trash2, type LucideIcon } from "lucide-react";
import toast from "react-hot-toast";

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
import { useDeleteSchedule } from "../api/evaluation-schedule.service";
import { formatScheduleRange, getScheduleStatus } from "../utils/schedule-status.util";
import { cn } from "@/lib/utils";

import type { EvaluationType, ScheduleSelect } from "backend/types/evaluation-schedule.type";

interface ScheduleDeleteDialogProps {
  type: EvaluationType;
  schedule: ScheduleSelect;
  icon?: LucideIcon;
  triggerText?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
}

export const ScheduleDeleteDialog = ({
  type,
  schedule,
  icon: Icon = Trash2,
  triggerText = "Delete Schedule",
  variant = "ghost",
  className,
}: ScheduleDeleteDialogProps) => {
  const [open, setOpen] = useState(false);
  const { mutateAsync, isPending: isDeleting } = useDeleteSchedule();

  const status = getScheduleStatus(schedule.open_at, schedule.close_at);
  const isActive = status === "active";

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isActive) return;

    const toastId = toast.loading("Removing evaluation schedule...");
    try {
      await mutateAsync({ type, id: schedule.id });
      toast.success("Evaluation schedule deleted successfully.", { id: toastId });
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete evaluation schedule.",
        { id: toastId },
      );
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
          <AlertDialogTitle>Delete Evaluation Schedule?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 pt-1 text-sm text-muted-foreground">
              <p>
                This will soft-delete the scheduled evaluation window for{" "}
                <strong className="text-foreground">
                  {formatScheduleRange(schedule.open_at, schedule.close_at)}
                </strong>
                .
              </p>

              {isActive && (
                <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold">Schedule is currently Active</p>
                    <p>
                      Active evaluation periods cannot be deleted directly while respondents may be
                      submitting evaluations. Please update or wait for the period to close.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>

          {!isActive && (
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Yes, delete schedule"}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
