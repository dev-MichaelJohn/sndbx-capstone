import { useState, useMemo } from "react";
import { ArrowLeft, CheckCircle2, UserCheck, AlertTriangle, Lock } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import {
  useSupervisorOfferings,
  useSupervisorEvaluation,
  useSubmitSupervisorEvaluation,
  useSupervisorSchedules,
} from "../api/supervisor.service";
import { useSupervisorEvaluationsSummary } from "@/features/evaluation-execution/api/evaluation-execution.service";
import { useEvaluationFormTree } from "@/features/evaluation-management/api/evaluation-form.service";
import { SupervisorTargetList } from "@/features/evaluation-execution/components/SupervisorTargetList";
import { EvaluationFormContainer } from "@/features/evaluation-execution/components/EvaluationFormContainer";
import type { CourseOfferingWithDetails } from "backend/types/offerings.type";

export const SupervisorEvaluationPage = () => {
  const [selectedOffering, setSelectedOffering] = useState<CourseOfferingWithDetails | null>(null);

  const { data: schedules = [] } = useSupervisorSchedules();

  const activeSchedule = useMemo(() => {
    if (!schedules || schedules.length === 0) return null;
    const now = Date.now();
    return (
      schedules.find((s) => {
        const open = new Date(s.open_at).getTime();
        const close = new Date(s.close_at).getTime();
        return now >= open && now <= close;
      }) ?? null
    );
  }, [schedules]);

  const { data: offeringsRes, isLoading: isLoadingOfferings } = useSupervisorOfferings({
    semester_id: activeSchedule?.semester_id,
    page: 1,
  });

  const offerings = offeringsRes?.data ?? [];

  const { data: summaryList = [] } = useSupervisorEvaluationsSummary(activeSchedule?.id, {
    enabled: Boolean(activeSchedule),
  });

  const submitEval = useSubmitSupervisorEvaluation();

  const statusMap = useMemo(() => {
    const map: Record<number, { isSubmitted: boolean; hasDraft: boolean }> = {};
    summaryList.forEach((item) => {
      map[item.course_offering_id] = {
        isSubmitted: item.is_submitted,
        hasDraft: !item.is_submitted,
      };
    });
    return map;
  }, [summaryList]);

  const { data: formTree, isLoading: isLoadingForm } = useEvaluationFormTree(
    "supervisor",
    activeSchedule?.form_id ?? 0,
  );

  const { data: existingEvalData, isLoading: isLoadingEval } = useSupervisorEvaluation(
    activeSchedule?.id,
    selectedOffering?.id,
    { enabled: Boolean(selectedOffering && activeSchedule) },
  );

  const existingEval = existingEvalData?.evaluation;
  const existingRatings = existingEvalData?.ratings ?? [];

  const initialRatingsMap: Record<number, number> = {};
  if (Array.isArray(existingRatings)) {
    existingRatings.forEach((item: any) => {
      if (item.question_id && item.rating) {
        initialRatingsMap[item.question_id] = item.rating;
      }
    });
  }

  const isSubmitted = Boolean(existingEval?.submitted_at);

  const handleSaveEvaluation = async (payload: {
    ratings: Array<{ question_id: number; rating: number }>;
    comment: string;
    is_draft: boolean;
  }) => {
    if (!activeSchedule || !selectedOffering) return;

    try {
      await submitEval.mutateAsync({
        schedule_id: activeSchedule.id,
        course_offering_id: selectedOffering.id,
        comment: payload.comment,
        is_draft: payload.is_draft,
        ratings: payload.ratings,
      });

      toast.success(
        payload.is_draft
          ? "Evaluation draft saved."
          : "Supervisor evaluation submitted successfully.",
      );
      if (!payload.is_draft) {
        setSelectedOffering(null);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save evaluation.");
    }
  };

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Faculty Evaluation (SEF)
            </h1>
            {activeSchedule ? (
              <Badge
                variant="outline"
                className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 gap-1 text-[11px] font-semibold"
              >
                <CheckCircle2 className="size-3" /> SEF Schedule Active
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 gap-1 text-[11px] font-semibold"
              >
                <AlertTriangle className="size-3" /> SEF Inactive
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Evaluate instructional performance for faculty members under your supervisor scope in
            the active academic term.
          </p>
        </div>

        {/* Schedule Inactive Alert */}
        {!activeSchedule && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-700 dark:text-amber-300">
            <AlertTriangle className="size-4 shrink-0 mt-0.5" />
            <div className="space-y-1 leading-relaxed">
              <p className="font-bold">No SEF Evaluation Schedule Active</p>
              <p>
                There is currently no active evaluation window for <strong>Supervisor (SEF)</strong>
                . Faculty targets will be enabled once a schedule is published.
              </p>
            </div>
          </div>
        )}

        {/* Target List Card */}
        {activeSchedule && (
          <Card className="rounded-2xl border border-border/60 bg-card shadow-xs">
            <CardHeader className="border-b">
              <div className="flex items-center gap-2">
                <UserCheck className="size-4 text-primary" />
                <CardTitle className="text-base font-bold">
                  Active Faculty Evaluation Targets
                </CardTitle>
              </div>
              <CardDescription className="text-xs">
                Select an active faculty course offering below to complete your SEF evaluation for
                this term.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <SupervisorTargetList
                offerings={offerings}
                statusMap={statusMap}
                isLoading={isLoadingOfferings}
                onSelectOffering={(offering) => setSelectedOffering(offering)}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* SEF Execution Modal */}
      <Dialog
        open={Boolean(selectedOffering)}
        onOpenChange={(open) => !open && setSelectedOffering(null)}
      >
        <DialogContent className="sm:max-w-4xl lg:max-w-5xl w-full h-[88vh] flex flex-col p-0 rounded-2xl overflow-hidden shadow-2xl border border-border/80">
          <DialogHeader className="shrink-0 p-4 border-b bg-muted/20 flex flex-row items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-base font-bold">
                  Evaluating: {selectedOffering?.first_name} {selectedOffering?.last_name}
                </DialogTitle>
                {isSubmitted && (
                  <Badge
                    variant="outline"
                    className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] gap-1 font-semibold"
                  >
                    <Lock className="size-3" /> Submitted (Read Only)
                  </Badge>
                )}
              </div>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {selectedOffering?.course_name} ({selectedOffering?.course_initialism}) • Year{" "}
                {selectedOffering?.year_level}
              </DialogDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedOffering(null)}
              className="h-8 text-xs gap-1 cursor-pointer rounded-lg active:scale-[0.96]"
            >
              <ArrowLeft className="size-3.5" /> Back to list
            </Button>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isLoadingForm || isLoadingEval || !formTree ? (
              <div className="p-8 text-center text-xs text-muted-foreground animate-pulse">
                Loading SEF evaluation form & ratings...
              </div>
            ) : (
              <EvaluationFormContainer
                type="supervisor"
                formTree={formTree}
                initialRatings={initialRatingsMap}
                initialComment={existingEval?.comment ?? ""}
                isSubmitted={isSubmitted}
                isSaving={submitEval.isPending}
                onSave={handleSaveEvaluation}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupervisorEvaluationPage;
