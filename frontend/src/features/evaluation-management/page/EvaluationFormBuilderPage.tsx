import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { AlertTriangle, ArrowLeft, ArrowDown, ArrowUp, Edit2, Plus, Trash2 } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import {
  getSupervisorMeans,
  useDeleteCategory,
  useDeleteQuestion,
  useEvaluationFormTree,
  useUpdateCategory,
  useUpdateQuestion,
} from "../api/evaluation-form.service";
import { CategoryDialog } from "../components/CategoryDialog";
import { QuestionDialog } from "../components/QuestionDialog";
import { SupervisorMeansDialog } from "../components/SupervisorMeansDialog";
import type {
  CategorySelect,
  EvaluationCategoryNode,
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
  const updateCategory = useUpdateCategory(activeType, parsedFormId);
  const updateQuestion = useUpdateQuestion(activeType, parsedFormId);

  const isDeleting = deleteCategory.isPending || deleteQuestion.isPending;

  const handleBack = () => {
    navigate("../..", { relative: "path" });
  };

  // ── Reorder Categories ──────────────────────────────────────────────────────
  const handleMoveCategory = async (index: number, direction: "up" | "down") => {
    if (!formTree) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= formTree.categories.length) return;

    const currentCat = formTree.categories[index];
    const targetCat = formTree.categories[targetIndex];

    if (!currentCat || !targetCat) return;

    try {
      await Promise.all([
        updateCategory.mutateAsync({
          type: activeType,
          categoryId: currentCat.id,
          payload: { order: targetCat.order },
        }),
        updateCategory.mutateAsync({
          type: activeType,
          categoryId: targetCat.id,
          payload: { order: currentCat.order },
        }),
      ]);
      toast.success("Category order updated.");
    } catch {
      toast.error("Failed to reorder categories.");
    }
  };

  // ── Reorder Questions ──────────────────────────────────────────────────────
  const handleMoveQuestion = async (
    category: EvaluationCategoryNode,
    index: number,
    direction: "up" | "down",
  ) => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= category.questions.length) return;

    const currentQ = category.questions[index];
    const targetQ = category.questions[targetIndex];

    if (!currentQ || !targetQ) return;

    try {
      await Promise.all([
        updateQuestion.mutateAsync({
          type: activeType,
          questionId: currentQ.id,
          payload: { order: targetQ.order },
        }),
        updateQuestion.mutateAsync({
          type: activeType,
          questionId: targetQ.id,
          payload: { order: currentQ.order },
        }),
      ]);
      toast.success("Question order updated.");
    } catch {
      toast.error("Failed to reorder questions.");
    }
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
        <p className="text-xs text-muted-foreground">
          {error instanceof Error ? error.message : "Failed to load form tree."}
        </p>
        <Button variant="outline" size="sm" onClick={handleBack} className="h-8 rounded-lg text-xs">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
        {/* Header Navigation */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={handleBack}
              className="size-9 shrink-0 cursor-pointer rounded-lg border-border/60 hover:bg-muted/80 hover:text-foreground"
              title="Back"
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                  {formTree.title}
                </h1>
                <span className="inline-flex items-center rounded-md border border-border/50 bg-muted/50 px-2 py-0.5 text-[11px] font-medium capitalize text-muted-foreground">
                  {activeType}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                {formTree.description || "Configure categories and evaluation statements"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
        </div>

        {/* Tree Container */}
        <div className="flex flex-col gap-4">
          {formTree.categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card p-12 text-center">
              <p className="text-xs text-muted-foreground">
                No criteria categories created yet. Click &quot;Add Category&quot; to begin
                building.
              </p>
            </div>
          ) : (
            formTree.categories.map((category, catIdx) => (
              <div
                key={category.id}
                className="overflow-hidden rounded-xl border bg-card shadow-xs"
              >
                <div className="flex items-center justify-between border-b px-4 py-3 bg-muted/20">
                  <div>
                    <h3 className="text-sm font-semibold tracking-tight text-foreground">
                      {catIdx + 1}. {category.name}
                    </h3>
                    {category.description && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{category.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Category Order Control */}
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={catIdx === 0}
                      onClick={() => handleMoveCategory(catIdx, "up")}
                      className="size-7 cursor-pointer rounded-lg text-muted-foreground hover:bg-muted"
                      title="Move Category Up"
                    >
                      <ArrowUp className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={catIdx === formTree.categories.length - 1}
                      onClick={() => handleMoveCategory(catIdx, "down")}
                      className="size-7 cursor-pointer rounded-lg text-muted-foreground hover:bg-muted"
                      title="Move Category Down"
                    >
                      <ArrowDown className="size-3.5" />
                    </Button>

                    <div className="h-4 w-px bg-border/60 mx-1" />

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
                      className="size-7 cursor-pointer rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
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
                </div>

                <div className="p-4">
                  {category.questions.length === 0 ? (
                    <p className="text-xs italic text-muted-foreground/60">
                      No question items added under this category.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {category.questions.map((q, qIdx) => (
                        <li
                          key={q.id}
                          className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 px-3 py-2 text-xs"
                        >
                          <span className="font-medium text-foreground">
                            {catIdx + 1}.{qIdx + 1} {q.question}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {/* Question Order Controls */}
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={qIdx === 0}
                              onClick={() => handleMoveQuestion(category, qIdx, "up")}
                              className="size-6 cursor-pointer rounded-lg text-muted-foreground hover:bg-muted"
                              title="Move Question Up"
                            >
                              <ArrowUp className="size-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={qIdx === category.questions.length - 1}
                              onClick={() => handleMoveQuestion(category, qIdx, "down")}
                              className="size-6 cursor-pointer rounded-lg text-muted-foreground hover:bg-muted"
                              title="Move Question Down"
                            >
                              <ArrowDown className="size-3" />
                            </Button>

                            <div className="h-3 w-px bg-border/60 mx-0.5" />

                            {activeType === "supervisor" && (
                              <SupervisorMeansDialog questionId={q.id} questionText={q.question} />
                            )}

                            <span className="inline-flex items-center rounded-md border border-border/50 bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                              Max Rating: {q.max_rating}
                            </span>

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
                              className="size-7 cursor-pointer rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => handleInitiateDeleteQuestion(q)}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete / Block Alert Modal */}
      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-base font-semibold">
              {blockedReason && <AlertTriangle className="size-4 shrink-0 text-destructive" />}
              {blockedReason
                ? "Cannot Delete Record"
                : `Delete ${deleteTarget?.type === "category" ? "Category" : "Question Item"}?`}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
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
            <AlertDialogCancel disabled={isDeleting} className="h-8 rounded-lg text-xs">
              {blockedReason ? "Understood" : "Cancel"}
            </AlertDialogCancel>

            {!blockedReason && (
              <AlertDialogAction
                onClick={handleConfirmDelete}
                disabled={isDeleting || isCheckingBlock}
                className="h-8 rounded-lg bg-destructive text-xs text-destructive-foreground hover:bg-destructive/90"
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
