import { useState } from "react";
import { Eye, CheckCircle2, Download, ShieldCheck, Badge } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useFacultySelfReports, useAcknowledgeFacultyReport } from "../api/faculty.service";
import { EvaluationReportStatusBadge } from "@/features/evaluation-report/components/EvaluationReportStatusBadge";
import { ReportDetailModal } from "@/features/evaluation-report/components/ReportDetailModal";
import {
  downloadIferPdf,
  downloadFedafPdf,
} from "@/features/evaluation-report/api/evaluation-report.service";

/**
 * Faculty Evaluation Reports page providing access to individual IFER reports,
 * FEDAF development plans, PDF downloads, and formal report acknowledgment.
 */
export const FacultyReportsPage = () => {
  const { data: myReports = [], isLoading } = useFacultySelfReports();
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [acknowledgingId, setAcknowledgingId] = useState<number | null>(null);

  const acknowledgeMutation = useAcknowledgeFacultyReport(acknowledgingId ?? 0);

  const handleAcknowledge = async (reportId: number) => {
    setAcknowledgingId(reportId);
    try {
      await acknowledgeMutation.mutateAsync();
      toast.success("Evaluation report acknowledged successfully.");
      setAcknowledgingId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to acknowledge report.");
      setAcknowledgingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-xs text-muted-foreground">
        Loading evaluation reports...
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Evaluation Reports & FEDAF Plans
            </h1>
            <Badge className="border-indigo-500/30 bg-indigo-500/10 text-indigo-400 gap-1 text-[11px]">
              <ShieldCheck className="size-3" /> CHED CMO 19 Compliant
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Review your Individual Faculty Evaluation Reports (IFER), FEDAF development plans, and
            formally acknowledge report findings.
          </p>
        </div>

        {myReports.length === 0 ? (
          <Card className="rounded-xl border border-dashed p-8 text-center text-xs text-muted-foreground">
            No evaluation reports generated for your account yet.
          </Card>
        ) : (
          <div className="space-y-4">
            {myReports.map((report) => {
              const isFinalized = report.status === "FINALIZED";

              return (
                <Card key={report.id} className="rounded-xl border bg-card p-5 shadow-2xs">
                  <CardContent className="p-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-sm font-bold text-foreground">
                          IFER Report #{report.id}
                        </span>
                        <EvaluationReportStatusBadge status={report.status} />
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs">
                        <div>
                          <span className="text-muted-foreground">SET Score (60%): </span>
                          <span className="font-mono font-bold text-emerald-500">
                            {report.overall_set_rating ? `${report.overall_set_rating}` : "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">SEF Score (40%): </span>
                          <span className="font-mono font-bold text-sky-500">
                            {report.overall_sef_rating ? `${report.overall_sef_rating}` : "N/A"}
                          </span>
                        </div>
                        {report.acknowledged_at && (
                          <div className="text-muted-foreground italic">
                            Acknowledged: {new Date(report.acknowledged_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-center">
                      {isFinalized && (
                        <Button
                          size="sm"
                          onClick={() => handleAcknowledge(report.id)}
                          disabled={acknowledgeMutation.isPending && acknowledgingId === report.id}
                          className="h-8 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                        >
                          <CheckCircle2 className="size-3.5" />
                          <span>
                            {acknowledgeMutation.isPending && acknowledgingId === report.id
                              ? "Acknowledging..."
                              : "Acknowledge Report"}
                          </span>
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadIferPdf(report.id)}
                        className="h-8 text-xs gap-1 cursor-pointer"
                      >
                        <Download className="size-3.5 text-emerald-500" /> IFER PDF
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadFedafPdf(report.id)}
                        className="h-8 text-xs gap-1 cursor-pointer"
                      >
                        <Download className="size-3.5 text-sky-500" /> FEDAF PDF
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedReportId(report.id)}
                        className="h-8 gap-1.5 text-xs cursor-pointer"
                      >
                        <Eye className="size-3.5" /> View Detail
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <ReportDetailModal reportId={selectedReportId} onClose={() => setSelectedReportId(null)} />
    </div>
  );
};

export default FacultyReportsPage;
