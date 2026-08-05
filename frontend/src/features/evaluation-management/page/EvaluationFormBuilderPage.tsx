import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { AlertTriangle, ArrowLeft, Edit2, Plus, Trash2 } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import {
  getSupervisorMeans,
  useDeleteCategory,
  useDeleteQuestion,
  useEvaluationFormTree,
} from "../api/evaluation-form.service";
import { CategoryDialog } from "../components/CategoryDialog";
import { QuestionDialog } from "../components/QuestionDialog";
import { SupervisorMeansDialog } from "../components/SupervisorMeansDialog";
import type {
  CategorySelect,
  EvaluationType,
  QuestionSelect,
} from "backend/types/evaluation-form.type";
import { EvaluationFormPreview } from "../components/EvaluationFormPreview";

type DeleteTarget =
  | { type: "category"; data: CategorySelect & { questions: QuestionSelect[] } }
  | { type: "question"; data: QuestionSelect }
  | null;

export const EvaluationFormBuilderPage = () => {
  const navigate = useNavigate();
  const { type, formId } = useParams<{ type: EvaluationType; formId: string }>();

  const activeType = (type as EvaluationType) ?? "student";
  const parsedFormId = Number(formId);

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
  const [blockedReason, setBlockedReason] = useState<string | null>(null);
  const [isCheckingBlock, setIsCheckingBlock] = useState(false);

  const {
    data: formTree,
    isLoading,
    isError,
    error,
  } = useEvaluationFormTree(activeType, parsedFormId);

  const deleteCategory = useDeleteCategory(activeType, parsedFormId);
  const deleteQuestion = useDeleteQuestion(activeType, parsedFormId);

  const isDeleting = deleteCategory.isPending || deleteQuestion.isPending;

  const handleBack = () => {
    navigate("../..", { relative: "path" });
  };

  const handleInitiateDeleteCategory = (
    category: CategorySelect & { questions: QuestionSelect[] },
  ) => {
    setDeleteTarget({ type: "category", data: category });

    if (category.questions && category.questions.length > 0) {
      setBlockedReason(
        `This category cannot be deleted because it contains ${category.questions.length} question item(s). You must delete or move all questions inside this category first.`,
      );
    } else {
      setBlockedReason(null);
    }
  };

  const handleInitiateDeleteQuestion = async (question: QuestionSelect) => {
    setDeleteTarget({ type: "question", data: question });
    setBlockedReason(null);

    if (activeType === "supervisor") {
      setIsCheckingBlock(true);
      try {
        const means = await getSupervisorMeans(question.id);
        if (means && means.length > 0) {
          setBlockedReason(
            `This question cannot be deleted because it has ${means.length} supervisor mean descriptor(s) attached. Please remove all mean descriptors first.`,
          );
        }
      } catch {
        // Fallthrough if check fails
      } finally {
        setIsCheckingBlock(false);
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || blockedReason) return;

    try {
      if (deleteTarget.type === "category") {
        await deleteCategory.mutateAsync({ type: activeType, categoryId: deleteTarget.data.id });
        toast.success("Category deleted successfully.");
      } else {
        await deleteQuestion.mutateAsync({ type: activeType, questionId: deleteTarget.data.id });
        toast.success("Question item deleted successfully.");
      }
      setDeleteTarget(null);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to delete record. Ensure it has no dependencies.",
      );
    }
  };

  if (!parsedFormId || isNaN(parsedFormId)) {
    return <div className="p-6 text-xs text-muted-foreground">Invalid Form Identifier.</div>;
  }

  if (isLoading) {
    return (
      <div className="flex h-full flex-1 flex-col gap-6 p-6">
        <Skeleton className="h-10 w-1/3 rounded-lg" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !formTree) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center gap-4 p-6">
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "Failed to load form tree."}
        </p>
        <Button variant="outline" onClick={handleBack}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-lg"
              onClick={handleBack}
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight">{formTree.title}</h1>
                <Badge variant="outline" className="capitalize text-xs">
                  {activeType}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {formTree.description || "Configure categories and evaluation statements"}
              </p>
            </div>
          </div>

          <EvaluationFormPreview
            type={activeType}
            formTree={formTree}
            triggerText="Preview Form"
            variant="outline"
          />

          <CategoryDialog
            type={activeType}
            formId={parsedFormId}
            nextOrder={formTree.categories.length + 1}
            triggerText="Add Category"
            triggerIcon={Plus}
          />
        </div>

        {/* Tree Container */}
        <div className="flex flex-col gap-4">
          {formTree.categories.length === 0 ? (
            <Card className="p-8 text-center text-sm text-muted-foreground">
              No criteria categories created yet. Click "Add Category" to begin building.
            </Card>
          ) : (
            formTree.categories.map((category, catIdx) => (
              <Card key={category.id} className="rounded-xl shadow-xs">
                <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                  <div>
                    <CardTitle className="text-base font-semibold">
                      {catIdx + 1}. {category.name}
                    </CardTitle>
                    {category.description && (
                      <p className="mt-1 text-xs text-muted-foreground">{category.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <CategoryDialog
                      type={activeType}
                      formId={parsedFormId}
                      initialData={category}
                      triggerIcon={Edit2}
                      variant="ghost"
                      size="icon"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleInitiateDeleteCategory(category)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                    <QuestionDialog
                      type={activeType}
                      formId={parsedFormId}
                      categoryId={category.id}
                      nextOrder={category.questions.length + 1}
                      triggerText="Add Item"
                      triggerIcon={Plus}
                      variant="outline"
                      size="sm"
                    />
                  </div>
                </CardHeader>

                <CardContent className="pt-4">
                  {category.questions.length === 0 ? (
                    <p className="text-xs italic text-muted-foreground">
                      No question items added under this category.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {category.questions.map((q, qIdx) => (
                        <li
                          key={q.id}
                          className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2 text-sm"
                        >
                          <span className="text-sm font-medium">
                            {catIdx + 1}.{qIdx + 1} {q.question}
                          </span>

                          <div className="flex items-center gap-2">
                            {/* Supervisor Mean Descriptors Button */}
                            {activeType === "supervisor" && (
                              <SupervisorMeansDialog questionId={q.id} questionText={q.question} />
                            )}

                            <Badge variant="secondary" className="text-[10px]">
                              Max Rating: {q.max_rating}
                            </Badge>
                            <QuestionDialog
                              type={activeType}
                              formId={parsedFormId}
                              categoryId={category.id}
                              initialData={q}
                              triggerIcon={Edit2}
                              variant="ghost"
                              size="icon"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => handleInitiateDeleteQuestion(q)}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Delete / Block Alert Modal */}
      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {blockedReason && <AlertTriangle className="size-5 text-destructive shrink-0" />}
              {blockedReason
                ? "Cannot Delete Record"
                : `Delete ${deleteTarget?.type === "category" ? "Category" : "Question Item"}?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isCheckingBlock ? (
                "Checking dependent records..."
              ) : blockedReason ? (
                <span className="text-destructive">{blockedReason}</span>
              ) : (
                `Are you sure you want to delete ${
                  deleteTarget?.type === "category"
                    ? `"${deleteTarget.data.name}"`
                    : `"${deleteTarget?.data.question}"`
                }? This action cannot be undone.`
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {blockedReason ? "Understood" : "Cancel"}
            </AlertDialogCancel>

            {!blockedReason && (
              <AlertDialogAction
                onClick={handleConfirmDelete}
                disabled={isDeleting || isCheckingBlock}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EvaluationFormBuilderPage;
