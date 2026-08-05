import { useForm } from "@tanstack/react-form";
import type { LucideIcon } from "lucide-react";

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
import { Button } from "@/components/ui/button";
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
import { FormTextField } from "@/components/form-text-field";
import { useEntityDialog } from "@/hooks/use-entity-dialog";
import { useAddCategory, useUpdateCategory } from "../api/evaluation-form.service";
import {
  UpsertCategoryReqSchema,
  type CategorySelect,
  type EvaluationType,
  type UpsertCategoryReq,
} from "backend/types/evaluation-form.type";

interface CategoryDialogProps {
  type: EvaluationType;
  formId: number;
  initialData?: CategorySelect;
  nextOrder?: number;
  triggerText?: string;
  triggerIcon?: LucideIcon;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "icon";
  className?: string;
}

export const CategoryDialog = ({
  type,
  formId,
  initialData,
  nextOrder = 1,
  triggerText,
  triggerIcon: Icon,
  variant = "outline",
  size = "sm",
  className,
}: CategoryDialogProps) => {
  const isEdit = Boolean(initialData);

  const addCategory = useAddCategory(type, formId);
  const updateCategory = useUpdateCategory(type, formId);

  const isPending = addCategory.isPending || updateCategory.isPending;

  const defaultValues: UpsertCategoryReq = {
    name: initialData?.name ?? "",
    description: initialData?.description ?? "",
    order: initialData?.order ?? nextOrder,
  };

  const form = useForm({
    defaultValues,
    validators: { onSubmit: UpsertCategoryReqSchema },
    onSubmit: (values) => dialog.handleFormSubmit(values),
  });

  const dialog = useEntityDialog<UpsertCategoryReq>({
    form,
    mutationFn: (payload) => {
      if (isEdit && initialData) {
        return updateCategory.mutateAsync({
          type,
          categoryId: initialData.id,
          payload,
        });
      }
      return addCategory.mutateAsync({ type, formId, payload });
    },
    loadingText: isEdit ? "Updating category..." : "Adding category...",
    successText: isEdit ? "Category updated successfully." : "Category added successfully.",
  });

  return (
    <>
      <Dialog open={dialog.open} onOpenChange={dialog.handleOpenChange}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant={variant}
            size={size}
            className={className ?? "h-8 cursor-pointer gap-1.5 rounded-lg text-xs font-medium"}
          >
            {Icon && <Icon className="size-3.5" />}
            {triggerText && <span>{triggerText}</span>}
          </Button>
        </DialogTrigger>
        <DialogContent className="rounded-xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              {isEdit ? "Edit Category" : "Add Category"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {isEdit
                ? "Update category details and order."
                : "Group question items under an evaluation domain."}
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="py-2">
            <form.Field
              name="name"
              children={(field) => (
                <FormTextField
                  field={field}
                  label="Category Name"
                  disabled={isPending}
                  placeholder="e.g. Teaching Effectiveness"
                />
              )}
            />
            <form.Field
              name="description"
              children={(field) => (
                <FormTextField
                  field={field}
                  label="Description"
                  disabled={isPending}
                  placeholder="e.g. Adherence to academic syllabi and course content"
                />
              )}
            />
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={dialog.attemptClose}
              disabled={isPending}
              className="h-8 rounded-lg text-xs"
            >
              Cancel
            </Button>
            <form.Subscribe
              selector={(state) => [state.canSubmit] as const}
              children={([canSubmit]) => (
                <Button
                  type="button"
                  disabled={!canSubmit || isPending}
                  onClick={() => form.handleSubmit()}
                  className="h-8 cursor-pointer rounded-lg text-xs font-medium"
                >
                  {isPending ? "Saving..." : isEdit ? "Update Category" : "Add Category"}
                </Button>
              )}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={dialog.confirmSaveOpen} onOpenChange={dialog.setConfirmSaveOpen}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold">
              {isEdit ? "Update category changes?" : "Add category to evaluation form?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              {isEdit
                ? "This will update category details across the evaluation instrument."
                : "This will add a new criteria section to this form."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending} className="h-8 rounded-lg text-xs">
              Go back
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={dialog.confirmSave}
              disabled={isPending}
              className="h-8 rounded-lg text-xs font-medium"
            >
              {isPending ? "Saving..." : "Yes, confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={dialog.confirmDiscardOpen} onOpenChange={dialog.setConfirmDiscardOpen}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold">
              Discard unsaved changes?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Closing now will discard your entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-8 rounded-lg text-xs">Keep editing</AlertDialogCancel>
            <AlertDialogAction onClick={dialog.confirmDiscard} className="h-8 rounded-lg text-xs">
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
