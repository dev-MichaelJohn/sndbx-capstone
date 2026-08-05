import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { FileCheck, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FormTextField } from "@/components/form-text-field";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAddSupervisorMean,
  useDeleteSupervisorMean,
  useSupervisorMeans,
} from "../api/evaluation-form.service";
import {
  UpsertMeanReqSchema,
  type MeanSelect,
  type UpsertMeanReq,
} from "backend/types/evaluation-form.type";

interface SupervisorMeansDialogProps {
  questionId: number;
  questionText: string;
}

export const SupervisorMeansDialog = ({ questionId, questionText }: SupervisorMeansDialogProps) => {
  const [open, setOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MeanSelect | null>(null);

  const { data: means = [], isLoading } = useSupervisorMeans(questionId);
  const addMean = useAddSupervisorMean(questionId);
  const deleteMean = useDeleteSupervisorMean(questionId);

  const form = useForm({
    defaultValues: {
      descriptor: "",
    } as UpsertMeanReq,
    validators: {
      onSubmit: ({ value }) => {
        const result = UpsertMeanReqSchema.safeParse(value);
        if (!result.success) {
          return result.error.issues.map((i) => i.message).join(", ");
        }
      },
    },
    onSubmit: async ({ value }) => {
      try {
        await addMean.mutateAsync({
          questionId,
          payload: value,
        });
        toast.success("Means of verification added.");
        form.reset();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to add verification means.");
      }
    },
  });

  const handleDeleteMean = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMean.mutateAsync(deleteTarget.id);
      toast.success("Means of verification deleted.");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete item.");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-7 cursor-pointer gap-1 rounded-lg border-border/60 text-xs font-medium hover:bg-muted"
          >
            <FileCheck className="size-3.5 text-muted-foreground" />
            <span>Means of Verification</span>
          </Button>
        </DialogTrigger>

        <DialogContent className="rounded-xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Suggested Means of Verification
            </DialogTitle>
            <DialogDescription className="line-clamp-2 text-xs text-muted-foreground">
              Configure verification evidence/documents required for: &quot;{questionText}&quot;
            </DialogDescription>
          </DialogHeader>

          {/* Existing Means List */}
          <div className="my-2 space-y-3">
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Configured Verification Evidence
            </h4>

            {isLoading ? (
              <Skeleton className="h-16 w-full rounded-lg" />
            ) : means.length === 0 ? (
              <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
                No means of verification added for this item yet.
              </div>
            ) : (
              <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                {means.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-lg border bg-muted/20 p-2.5 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-[10px]">
                        ID: {m.id}
                      </Badge>
                      <span className="font-medium text-foreground">{m.descriptor}</span>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6 cursor-pointer rounded-lg text-muted-foreground hover:bg-rose-500/10 hover:text-rose-400"
                      onClick={() => setDeleteTarget(m)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Mean Verification Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-3 border-t pt-3"
          >
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Add Verification Evidence
            </h4>

            <form.Field
              name="descriptor"
              children={(field) => (
                <FormTextField
                  field={field}
                  label="Document / Verification Requirement"
                  placeholder="e.g. Daily time record, LMS logs, Class schedule"
                  disabled={addMean.isPending}
                />
              )}
            />

            <Button
              type="submit"
              size="sm"
              disabled={addMean.isPending}
              className="mt-2 h-8 w-full cursor-pointer gap-1 rounded-lg text-xs font-medium"
            >
              <Plus className="size-3.5" />
              <span>{addMean.isPending ? "Adding..." : "Add Verification Means"}</span>
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold">
              Delete Means of Verification?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to delete verification item &quot;{deleteTarget?.descriptor}
              &quot;?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMean.isPending} className="h-8 rounded-lg text-xs">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMean}
              disabled={deleteMean.isPending}
              className="h-8 rounded-lg bg-rose-600 text-xs text-white hover:bg-rose-500"
            >
              {deleteMean.isPending ? "Deleting..." : "Delete Item"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
