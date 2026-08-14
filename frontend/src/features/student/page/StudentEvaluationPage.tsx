import { useState, useMemo } from "react";
import { ArrowLeft, CheckCircle2, Clock, Lock, User, AlertTriangle } from "lucide-react";
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

import { useUser } from "@/features/auth/context/user.context";
import { useMyEnrolledClasses, useActiveStudentSchedule } from "../api/student.service";
import {
  useStudentEvaluation,
  useSubmitStudentEvaluation,
} from "@/features/evaluation-execution/api/evaluation-execution.service";
import { useEvaluationFormTree } from "@/features/evaluation-management/api/evaluation-form.service";
import { EvaluationFormContainer } from "@/features/evaluation-execution/components/EvaluationFormContainer";
import type { StudentClassWithDetails } from "backend/types/student-class.type";

const StudentCourseItem = ({
  item,
  activeScheduleId,
  onSelect,
}: {
  item: StudentClassWithDetails;
  activeScheduleId?: number;
  onSelect: (item: StudentClassWithDetails) => void;
}) => {
  const { data: evalData } = useStudentEvaluation(activeScheduleId, item.id, {
    enabled: Boolean(activeScheduleId && item.id),
  });

  const evaluation = evalData?.evaluation;
  const isSubmitted = Boolean(evaluation?.submitted_at);
  const hasDraft = Boolean(evaluation && !evaluation.submitted_at);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border/60 bg-card p-4 shadow-2xs">
      <div className="space-y-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-semibold text-foreground truncate">{item.course_name}</h4>
          <Badge variant="outline" className="font-mono text-[10px]">
            {item.course_initialism}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <User className="size-3.5 shrink-0" />
          <span className="font-medium text-foreground">
            {item.faculty_name ?? "Assigned Instructor"}
          </span>
          <span>• Section {item.class_section}</span>
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
        {isSubmitted ? (
          <Badge
            variant="outline"
            className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[11px]"
          >
            <CheckCircle2 className="size-3" /> Submitted
          </Badge>
        ) : hasDraft ? (
          <Badge
            variant="outline"
            className="gap-1 border-amber-500/30 bg-amber-500/10 text-amber-400 text-[11px]"
          >
            <Clock className="size-3" /> Draft
          </Badge>
        ) : (
          <Badge variant="outline" className="text-[11px]">
            Pending
          </Badge>
        )}

        <Button
          size="sm"
          disabled={!activeScheduleId}
          onClick={() => onSelect(item)}
          className="h-8 text-xs font-medium cursor-pointer"
        >
          {isSubmitted ? "View Evaluation" : hasDraft ? "Continue Evaluation" : "Evaluate Teacher"}
        </Button>
      </div>
    </div>
  );
};

export const StudentEvaluationPage = () => {
  const { user } = useUser();
  const [selectedStudentClass, setSelectedStudentClass] = useState<StudentClassWithDetails | null>(
    null,
  );

  const { data: schedules = [] } = useActiveStudentSchedule();

  // Find current active schedule
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

  // Query enrolled subjects strictly for the active schedule's semester
  const { data: classesRes, isLoading: isLoadingClasses } = useMyEnrolledClasses(
    user?.id,
    activeSchedule?.semester_id,
    { enabled: Boolean(user?.id && activeSchedule?.semester_id) },
  );
  const enrolledClasses = classesRes?.data ?? [];

  const submitEval = useSubmitStudentEvaluation();

  // SET Evaluation Form Tree
  const { data: formTree, isLoading: isLoadingForm } = useEvaluationFormTree(
    "student",
    activeSchedule?.form_id ?? 0,
  );

  // Existing evaluation draft or submission
  const { data: existingEvalData, isLoading: isLoadingEval } = useStudentEvaluation(
    activeSchedule?.id,
    selectedStudentClass?.id,
    { enabled: Boolean(selectedStudentClass && activeSchedule) },
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
    if (!activeSchedule || !selectedStudentClass) return;

    try {
      await submitEval.mutateAsync({
        schedule_id: activeSchedule.id,
        student_class_id: selectedStudentClass.id,
        comment: payload.comment,
        is_draft: payload.is_draft,
        ratings: payload.ratings,
      });

      toast.success(
        payload.is_draft
          ? "Evaluation draft saved successfully."
          : "Teacher evaluation submitted successfully!",
      );

      if (!payload.is_draft) {
        setSelectedStudentClass(null);
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
              Teacher Evaluation (SET)
            </h1>
            {activeSchedule ? (
              <Badge
                variant="outline"
                className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 gap-1 text-[11px]"
              >
                <CheckCircle2 className="size-3" /> SET Schedule Active
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-amber-500/30 bg-amber-500/10 text-amber-400 gap-1 text-[11px]"
              >
                <AlertTriangle className="size-3" /> SET Schedule Inactive
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Rate instructional quality and teaching standards for your enrolled instructors in the
            active semester.
          </p>
        </div>

        {/* Schedule Closed Alert */}
        {!activeSchedule && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-600 dark:text-amber-400">
            <AlertTriangle className="size-4 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Student Evaluation Window Closed</p>
              <p>
                Student Evaluation of Teachers (SET) is currently closed. No subjects are available
                for rating at this time.
              </p>
            </div>
          </div>
        )}

        {/* Enrolled Courses Evaluation List */}
        {activeSchedule && (
          <Card className="rounded-xl border bg-card shadow-xs">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-base font-semibold">
                Active Enrolled Instructors to Evaluate
              </CardTitle>
              <CardDescription className="text-xs">
                Select an enrolled subject below to complete your SET rating for this term.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {isLoadingClasses ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  Loading active subjects...
                </div>
              ) : enrolledClasses.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-lg">
                  No enrolled subjects found for evaluation in this active term.
                </div>
              ) : (
                enrolledClasses.map((item) => (
                  <StudentCourseItem
                    key={item.id}
                    item={item}
                    activeScheduleId={activeSchedule.id}
                    onSelect={setSelectedStudentClass}
                  />
                ))
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* SET Form Execution Modal */}
      <Dialog
        open={Boolean(selectedStudentClass)}
        onOpenChange={(open) => !open && setSelectedStudentClass(null)}
      >
        <DialogContent className="sm:max-w-4xl lg:max-w-5xl w-full h-[88vh] flex flex-col p-0 rounded-2xl overflow-hidden shadow-2xl border border-border/80">
          <DialogHeader className="shrink-0 p-4 border-b bg-muted/20 flex flex-row items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-base font-bold">
                  Evaluating: {selectedStudentClass?.faculty_name ?? "Instructor"}
                </DialogTitle>
                {isSubmitted && (
                  <Badge
                    variant="outline"
                    className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px] gap-1"
                  >
                    <Lock className="size-3" /> Submitted (Read Only)
                  </Badge>
                )}
              </div>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {selectedStudentClass?.course_name} ({selectedStudentClass?.course_initialism}) •
                Section {selectedStudentClass?.class_section}
              </DialogDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedStudentClass(null)}
              className="h-8 text-xs gap-1 cursor-pointer"
            >
              <ArrowLeft className="size-3.5" /> Back to list
            </Button>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isLoadingForm || isLoadingEval || !formTree ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                Loading SET evaluation questions & criteria...
              </div>
            ) : (
              <EvaluationFormContainer
                type="student"
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

export default StudentEvaluationPage;
