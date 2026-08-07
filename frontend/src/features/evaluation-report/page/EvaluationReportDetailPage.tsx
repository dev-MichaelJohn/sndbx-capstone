import { useParams, useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReportDetail, useSaveDevelopmentPlan } from "../api/evaluation-report.service";
import { ReportSummaryCard } from "../components/ReportCardSummary";
import { FedafPlanForm } from "../components/FedafPlanForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import toast from "react-hot-toast";

export const EvaluationReportDetailPage = () => {
  const { id, reportId } = useParams<{ id?: string; reportId?: string }>();
  const navigate = useNavigate();
  const targetId = Number(reportId || id);

  const { data: detail, isLoading, isError, error } = useReportDetail(targetId);
  const savePlan = useSaveDevelopmentPlan(targetId);

  const handleSavePlan = async (payload: {
    areas_for_improvement: string;
    proposed_activities: string;
    action_plan: string;
  }) => {
    if (!targetId) return;
    try {
      await savePlan.mutateAsync(payload);
      toast.success("FEDAF development plan saved successfully.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save plan.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full flex-1 items-center justify-center p-6 text-xs text-muted-foreground">
        Loading evaluation report details...
      </div>
    );
  }

  if (isError || !detail) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center gap-4 p-6">
        <p className="text-xs text-destructive">
          {error instanceof Error ? error.message : "Report detail not found."}
        </p>
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
            className="size-9 shrink-0 rounded-lg"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Faculty Evaluation Report #{targetId}
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Consolidated IFER breakdown and FEDAF development action plan.
            </p>
          </div>
        </div>

        <ReportSummaryCard detail={detail} />

        <Card className="rounded-xl border shadow-xs overflow-hidden">
          <CardHeader className="py-3 px-4 border-b bg-muted/30">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Class SET Summaries
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-semibold">Course Code</TableHead>
                  <TableHead className="text-xs font-semibold">Section</TableHead>
                  <TableHead className="text-xs font-semibold">Students</TableHead>
                  <TableHead className="text-xs font-semibold">Avg SET</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detail.class_summaries.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs font-medium">
                      {item.course_code}
                    </TableCell>
                    <TableCell className="text-xs">{item.section}</TableCell>
                    <TableCell className="text-xs">{item.student_count}</TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-emerald-500">
                      {item.average_set_rating}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <FedafPlanForm
          initialPlan={{
            areas_for_improvement: detail.report.areas_for_improvement ?? "",
            proposed_activities: detail.report.proposed_activities ?? "",
            action_plan: detail.report.action_plan ?? "",
          }}
          isSaving={savePlan.isPending}
          onSave={handleSavePlan}
        />
      </div>
    </div>
  );
};

export default EvaluationReportDetailPage;
