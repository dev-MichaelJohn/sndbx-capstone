import { useState, useMemo } from "react";
import { Plus, Search, AlertTriangle } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/main-data-table";

import {
  useDeleteEvaluationForm,
  useEvaluationForms,
  getFormTree,
} from "../api/evaluation-form.service";
import { getEvaluationFormColumns } from "../components/EvaluationFormColumns";
import { EvaluationFormCreateDialog } from "../components/EvaluationFormCreate";
import type { EvaluationType, FormSelect } from "backend/types/evaluation-form.type";

export const EvaluationFormPage = () => {
  const [activeType, setActiveType] = useState<EvaluationType>("student");
  const [search, setSearch] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<FormSelect | null>(null);
  const [isCheckingBlock, setIsCheckingBlock] = useState(false);
  const [blockedReason, setBlockedReason] = useState<string | null>(null);

  const { data: forms = [], isLoading, isError, error } = useEvaluationForms(activeType);
  const deleteForm = useDeleteEvaluationForm(activeType);

  const handleInitiateDelete = async (form: FormSelect) => {
    setDeleteTarget(form);
    setBlockedReason(null);
    setIsCheckingBlock(true);

    try {
      const tree = await getFormTree(activeType, form.id);
      if (tree.categories && tree.categories.length > 0) {
        const totalQuestions = tree.categories.reduce(
          (acc, cat) => acc + (cat.questions?.length || 0),
          0,
        );
        setBlockedReason(
          `This form cannot be deleted because it contains ${tree.categories.length} category/categories and ${totalQuestions} question item(s). You must remove all categories and questions inside the builder before deleting this form.`,
        );
      }
    } catch {
      // Fallthrough to allow delete attempt if tree fetch fails
    } finally {
      setIsCheckingBlock(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || blockedReason) return;

    try {
      await deleteForm.mutateAsync({ type: activeType, formId: deleteTarget.id });
      toast.success("Evaluation form deleted successfully.");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to delete form. Ensure it has no dependent records.",
      );
    }
  };

  const columns = useMemo(
    () =>
      getEvaluationFormColumns({
        type: activeType,
        onDelete: handleInitiateDelete,
      }),
    [activeType],
  );

  const filteredForms = useMemo(() => {
    if (!search.trim()) return forms;
    const q = search.toLowerCase();
    return forms.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)),
    );
  }, [forms, search]);

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Evaluation Instruments
            </h1>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Manage student (SET) and supervisor (SEF) evaluation forms and question items.
            </p>
          </div>

          <Tabs
            value={activeType}
            onValueChange={(val) => setActiveType(val as EvaluationType)}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid h-9 w-full grid-cols-2 rounded-lg bg-muted/60 p-1 sm:w-64">
              <TabsTrigger value="student" className="rounded-md text-xs font-medium">
                Student (SET)
              </TabsTrigger>
              <TabsTrigger value="supervisor" className="rounded-md text-xs font-medium">
                Supervisor (SEF)
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Table Shell */}
        <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
          <div className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search evaluation forms..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 rounded-lg pl-8 text-xs"
              />
            </div>

            <EvaluationFormCreateDialog
              type={activeType}
              icon={Plus}
              triggerText="Add Instrument"
            />
          </div>

          <DataTable
            columns={columns}
            data={filteredForms}
            getRowId={(row) => row.id}
            isLoading={isLoading}
            isError={isError}
            error={error}
            emptyMessage={`No ${activeType} evaluation forms found.`}
          />
        </div>
      </div>

      {/* Delete Modal with Block Guard */}
      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-base font-semibold">
              {blockedReason && <AlertTriangle className="size-4 shrink-0 text-destructive" />}
              {blockedReason ? "Cannot Delete Form" : "Delete Evaluation Form?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              {isCheckingBlock ? (
                "Checking form dependencies..."
              ) : blockedReason ? (
                <span className="text-destructive">{blockedReason}</span>
              ) : (
                `Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteForm.isPending} className="h-8 rounded-lg text-xs">
              {blockedReason ? "Understood" : "Cancel"}
            </AlertDialogCancel>

            {!blockedReason && (
              <AlertDialogAction
                onClick={handleConfirmDelete}
                disabled={deleteForm.isPending || isCheckingBlock}
                className="h-8 rounded-lg bg-destructive text-xs text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteForm.isPending ? "Deleting..." : "Delete Form"}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EvaluationFormPage;
