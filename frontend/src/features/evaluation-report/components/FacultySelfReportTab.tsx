import { useState } from "react";
import { useMyReports } from "../api/evaluation-report.service";
import { EvaluationReportStatusBadge } from "./EvaluationReportStatusBadge";
import { ReportDetailModal } from "./ReportDetailModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Eye } from "lucide-react";

export const FacultySelfReportTab = () => {
  const { data: myReports = [], isLoading } = useMyReports();
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-xs text-muted-foreground">
        Loading personal reports...
      </div>
    );
  }

  if (myReports.length === 0) {
    return (
      <Card className="rounded-xl border border-dashed p-8 text-center text-xs text-muted-foreground">
        No evaluation reports available for your account yet.
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {myReports.map((report) => (
        <Card key={report.id} className="rounded-xl border bg-card p-4 shadow-2xs">
          <CardContent className="p-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                <FileText className="size-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-foreground">
                    IFER #{report.id}
                  </span>
                  <EvaluationReportStatusBadge status={report.status} />
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Semester ID: {report.semester_id}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right text-xs">
                <span className="text-muted-foreground">SET Rating: </span>
                <span className="font-mono font-bold text-emerald-500">
                  {report.overall_set_rating ? `${report.overall_set_rating}` : "N/A"}
                </span>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedReportId(report.id)}
                className="h-8 gap-1.5 text-xs cursor-pointer"
              >
                <Eye className="size-3.5" /> View Report
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <ReportDetailModal reportId={selectedReportId} onClose={() => setSelectedReportId(null)} />
    </div>
  );
};
