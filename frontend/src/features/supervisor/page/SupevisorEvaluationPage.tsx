import { useState } from "react";
import { ArrowLeft, CheckCircle2, UserCheck } from "lucide-react";
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
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  useSupervisorOfferings,
  useSupervisorEvaluation,
  useSubmitSupervisorEvaluation,
  useSupervisorSchedules,
} from "../api/supervisor.service";
import { useEvaluationFormTree } from "@/features/evaluation-management/api/evaluation-form.service";
import { SupervisorTargetList } from "@/features/evaluation-execution/components/SupervisorTargetList";
import { EvaluationFormContainer } from "@/features/evaluation-execution/components/EvaluationFormContainer";
import type { CourseOfferingWithDetails } from "backend/types/offerings.type";

export const SupervisorEvaluationPage = () => {
  const [selectedOffering, setSelectedOffering] = useState<CourseOfferingWithDetails | null>(null);

  const { data: offeringsRes, isLoading: isLoadingOfferings } = useSupervisorOfferings({ page: 1 });
  const { data: schedules = [] } = useSupervisorSchedules();
  const submitEval = useSubmitSupervisorEvaluation();

  const offerings = offeringsRes?.data ?? [];
  const activeSchedule = schedules[0]; // Active supervisor schedule

  // Form tree for SEF
  const { data: formTree, isLoading: isLoadingForm } = useEvaluationFormTree(
    "supervisor",
    activeSchedule?.form_id ?? 0,
  );

  // Existing draft or submission for selected target
  const { data: existingEvalData } = useSupervisorEvaluation(
    activeSchedule?.id,
    selectedOffering?.id,
    { enabled: Boolean(selectedOffering && activeSchedule) },
  );

  const existingEval = existingEvalData?.evaluation;
  const existingRatings = existingEvalData?.ratings ?? [];

  // Map existing ratings
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
            <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Faculty Evaluation (SEF)
            </h1>
            {activeSchedule ? (
              <Badge
                variant="outline"
                className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 gap-1 text-[11px]"
              >
                <CheckCircle2 className="size-3" /> Schedule Active
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-amber-500/30 bg-amber-500/10 text-amber-400 text-[11px]"
              >
                Schedule Inactive
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Evaluate instructional performance for faculty members under your supervisor scope.
          </p>
        </div>

        {/* Target List Card */}
        <Card className="rounded-xl border bg-card shadow-xs">
          <CardHeader className="border-b">
            <div className="flex items-center gap-2">
              <UserCheck className="size-4 text-primary" />
              <CardTitle className="text-base font-semibold">Faculty Evaluation Targets</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Select a faculty course offering to complete the SEF evaluation instrument.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <SupervisorTargetList
              offerings={offerings}
              isLoading={isLoadingOfferings}
              onSelectOffering={setSelectedOffering}
            />
          </CardContent>
        </Card>
      </div>

      {/* SEF Execution Dialog */}
      <Dialog
        open={Boolean(selectedOffering)}
        onOpenChange={(open) => !open && setSelectedOffering(null)}
      >
        <DialogContent className="max-w-4xl h-[88vh] flex flex-col p-0 rounded-2xl overflow-hidden">
          <DialogHeader className="p-4 border-b bg-muted/20 flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-base font-bold">
                Evaluating: {selectedOffering?.first_name} {selectedOffering?.last_name}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {selectedOffering?.course_name} ({selectedOffering?.course_initialism}) • Year{" "}
                {selectedOffering?.year_level}
              </DialogDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedOffering(null)}
              className="h-8 text-xs gap-1"
            >
              <ArrowLeft className="size-3.5" /> Back to list
            </Button>
          </DialogHeader>

          <ScrollArea className="flex-1 p-6">
            {isLoadingForm || !formTree ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                Loading SEF evaluation form...
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
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupervisorEvaluationPage;
