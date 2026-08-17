import React from "react";
import { Download, CheckCircle2, FileCheck } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { VisualRatingMeter } from "./VisualRatingMeter";
import { FedafPlanForm } from "./FedafPlanForm";
import { EvaluationReportStatusBadge } from "./EvaluationReportStatusBadge";
import {
  useReportDetail,
  useSaveDevelopmentPlan,
  useAcknowledgeReport,
  useUpdateReportStatus,
  downloadIferPdf,
  downloadFedafPdf,
} from "../api/evaluation-report.service";

interface ReportDetailDrawerProps {
  reportId: number | null;
  onClose: () => void;
  isSelfView?: boolean;
}

export const ReportDetailDrawer: React.FC<ReportDetailDrawerProps> = ({ reportId, onClose }) => {
  const isOpen = Boolean(reportId);
  const { data: detail, isLoading } = useReportDetail(reportId ?? 0);
  const savePlan = useSaveDevelopmentPlan(reportId ?? 0);
  const acknowledge = useAcknowledgeReport(reportId ?? 0);
  const updateStatus = useUpdateReportStatus(reportId ?? 0);

  const handleSavePlan = async (payload: {
    areas_for_improvement: string;
    proposed_activities: string;
    action_plan: string;
  }) => {
    if (!reportId) return;
    try {
      await savePlan.mutateAsync(payload);
      toast.success("FEDAF development plan updated successfully.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save plan.");
    }
  };

  const handleFinalizeReport = async () => {
    if (!reportId) return;
    try {
      await updateStatus.mutateAsync({ status: "FINALIZED" });
      toast.success("Report finalized successfully and published for faculty review.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to finalize report.");
    }
  };

  const handleAcknowledge = async () => {
    if (!reportId) return;
    try {
      await acknowledge.mutateAsync();
      toast.success("Report acknowledged successfully.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to acknowledge report.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl h-[88vh] flex flex-col p-0 rounded-2xl overflow-hidden border border-border/80 bg-card shadow-2xl">
        <DialogHeader className="p-5 border-b bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div>
            <div className="flex items-center gap-2.5">
              <DialogTitle className="text-base font-bold tracking-tight text-foreground">
                IFER Report #{reportId}
              </DialogTitle>
              {detail && <EvaluationReportStatusBadge status={detail.report.status} />}
            </div>
            {detail && (
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {detail.faculty.name} • {detail.faculty.department} ({detail.semester.term} Term)
              </DialogDescription>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => reportId && downloadIferPdf(reportId)}
              className="h-8 gap-1.5 text-xs font-medium cursor-pointer"
            >
              <Download className="size-3.5 text-emerald-500" /> IFER PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => reportId && downloadFedafPdf(reportId)}
              className="h-8 gap-1.5 text-xs font-medium cursor-pointer"
            >
              <Download className="size-3.5 text-sky-500" /> FEDAF PDF
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          {isLoading || !detail ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              Loading evaluation report detail...
            </div>
          ) : (
            <div className="space-y-6">
              {/* Visual Rating Meters Grid */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <VisualRatingMeter type="set" score={detail.report.overall_set_rating} />
                <VisualRatingMeter type="sef" score={detail.report.overall_sef_rating} />
                <VisualRatingMeter type="combined" score={detail.combined_weighted_rating} />
              </div>

              {/* Class SET Summaries Table */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Class SET Rating Summaries
                </span>
                <div className="rounded-xl border border-border/60 overflow-hidden bg-card">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead className="text-xs font-semibold">Course Code</TableHead>
                        <TableHead className="text-xs font-semibold">Section</TableHead>
                        <TableHead className="text-xs font-semibold text-center">
                          Students
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-right">Avg SET</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detail.class_summaries.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-mono text-xs font-bold text-primary">
                            {item.course_code}
                          </TableCell>
                          <TableCell className="text-xs">{item.section}</TableCell>
                          <TableCell className="text-xs font-mono text-center">
                            {item.student_count}
                          </TableCell>
                          <TableCell className="font-mono text-xs font-bold text-emerald-500 text-right">
                            {item.average_set_rating}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* FEDAF Development Plan Editor */}
              <FedafPlanForm
                initialPlan={{
                  areas_for_improvement: detail.report.areas_for_improvement ?? "",
                  proposed_activities: detail.report.proposed_activities ?? "",
                  action_plan: detail.report.action_plan ?? "",
                }}
                isSaving={savePlan.isPending}
                onSave={handleSavePlan}
              />

              {/* Finalize Action Banner (DRAFT status) */}
              {detail.report.status === "DRAFT" && (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-sky-500/30 bg-sky-500/10 p-4 text-xs">
                  <div>
                    <p className="font-semibold text-sky-600 dark:text-sky-400">
                      Report Status: Draft
                    </p>
                    <p className="text-sky-700 dark:text-sky-300 mt-0.5">
                      Once you finish saving the FEDAF plan above, finalize this report to publish
                      it for faculty review.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleFinalizeReport}
                    disabled={updateStatus.isPending}
                    className="h-8 gap-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs cursor-pointer shrink-0"
                  >
                    <FileCheck className="size-3.5" />
                    <span>{updateStatus.isPending ? "Finalizing..." : "Finalize & Publish"}</span>
                  </Button>
                </div>
              )}

              {/* Acknowledgment Action Banner (FINALIZED status) */}
              {detail.report.status === "FINALIZED" && (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs">
                  <div>
                    <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                      Report Finalized & Pending Acknowledgment
                    </p>
                    <p className="text-emerald-700 dark:text-emerald-300 mt-0.5">
                      Confirm receipt and review of evaluation findings per CHED regulations.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleAcknowledge}
                    disabled={acknowledge.isPending}
                    className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs cursor-pointer shrink-0"
                  >
                    <CheckCircle2 className="size-3.5" />
                    <span>{acknowledge.isPending ? "Confirming..." : "Acknowledge"}</span>
                  </Button>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
