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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Evaluation Instruments</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage student (SET) and supervisor (SEF) evaluation forms and question items
            </p>
          </div>

          <Tabs
            value={activeType}
            onValueChange={(val) => setActiveType(val as EvaluationType)}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid w-full grid-cols-2 sm:w-65">
              <TabsTrigger value="student">Student (SET)</TabsTrigger>
              <TabsTrigger value="supervisor">Supervisor (SEF)</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Card className="flex flex-col gap-0 overflow-hidden rounded-xl pb-0 shadow-xs">
          <CardHeader className="flex flex-col items-center justify-between gap-2.5 border-b px-6 sm:flex-row">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search evaluation forms..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 rounded-lg pl-8"
              />
            </div>

            <EvaluationFormCreateDialog
              type={activeType}
              icon={Plus}
              triggerText="Add Instrument"
            />
          </CardHeader>

          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={filteredForms}
              getRowId={(row) => row.id}
              isLoading={isLoading}
              isError={isError}
              error={error}
              emptyMessage={`No ${activeType} evaluation forms found.`}
            />
          </CardContent>
        </Card>
      </div>

      {/* Delete Modal with Block Guard */}
      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {blockedReason && <AlertTriangle className="size-5 text-destructive shrink-0" />}
              {blockedReason ? "Cannot Delete Form" : "Delete Evaluation Form?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
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
            <AlertDialogCancel disabled={deleteForm.isPending}>
              {blockedReason ? "Understood" : "Cancel"}
            </AlertDialogCancel>

            {!blockedReason && (
              <AlertDialogAction
                onClick={handleConfirmDelete}
                disabled={deleteForm.isPending || isCheckingBlock}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
