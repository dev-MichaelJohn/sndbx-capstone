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
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
            <FileCheck className="size-3.5" />
            <span>Means of Verification</span>
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Suggested Means of Verification</DialogTitle>
            <DialogDescription className="line-clamp-2">
              Configure verification evidence/documents required for: "{questionText}"
            </DialogDescription>
          </DialogHeader>

          {/* Existing Means List */}
          <div className="space-y-3 my-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Configured Verification Evidence
            </h4>

            {isLoading ? (
              <Skeleton className="h-16 w-full rounded-lg" />
            ) : means.length === 0 ? (
              <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
                No means of verification added for this item yet.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {means.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-lg border bg-muted/20 p-2.5 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-[10px]">
                        ID: {m.id}
                      </Badge>
                      <span className="font-medium">{m.descriptor}</span>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
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
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
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
              className="w-full gap-1 mt-2"
            >
              <Plus className="size-3.5" />
              <span>{addMean.isPending ? "Adding..." : "Add Verification Means"}</span>
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Means of Verification?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete verification item "{deleteTarget?.descriptor}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMean.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMean}
              disabled={deleteMean.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMean.isPending ? "Deleting..." : "Delete Item"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
