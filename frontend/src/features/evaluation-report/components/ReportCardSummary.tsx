import { Button } from "@/components/ui/button";
import { Download, FileText, Star, Activity } from "lucide-react";
import { downloadIferPdf, downloadFedafPdf } from "../api/evaluation-report.service";
import type { UnifiedFacultyReportDetail } from "backend/types/evaluation-report.type";

interface ReportSummaryCardProps {
  detail: UnifiedFacultyReportDetail;
}

export const ReportSummaryCard = ({ detail }: ReportSummaryCardProps) => {
  const { report, faculty, semester, combined_weighted_rating } = detail;

  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
        <div>
          <h3 className="text-sm font-bold text-foreground">{faculty.name}</h3>
          <p className="text-xs text-muted-foreground">
            {faculty.department} • Term: {semester.term} (AY {semester.academic_year})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadIferPdf(report.id)}
            className="h-7 text-xs gap-1"
          >
            <Download className="size-3 text-emerald-500" /> IFER PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadFedafPdf(report.id)}
            className="h-7 text-xs gap-1"
          >
            <Download className="size-3 text-sky-500" /> FEDAF PDF
          </Button>
        </div>
      </div>

      {/* Ratings Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="rounded-lg border p-3 bg-muted/20 space-y-1">
          <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
            <Star className="size-3.5 text-amber-500" />
            <span>SET Rating (60%)</span>
          </div>
          <p className="text-lg font-bold font-mono text-foreground">
            {report.overall_set_rating ? `${report.overall_set_rating} / 5.0` : "N/A"}
          </p>
        </div>

        <div className="rounded-lg border p-3 bg-muted/20 space-y-1">
          <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
            <Activity className="size-3.5 text-indigo-500" />
            <span>SEF Rating (40%)</span>
          </div>
          <p className="text-lg font-bold font-mono text-foreground">
            {report.overall_sef_rating ? `${report.overall_sef_rating} / 5.0` : "N/A"}
          </p>
        </div>

        <div className="rounded-lg border p-3 bg-emerald-500/10 border-emerald-500/20 space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
            <FileText className="size-3.5" />
            <span>Combined Score</span>
          </div>
          <p className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {combined_weighted_rating ? `${combined_weighted_rating.toFixed(2)} / 5.0` : "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
};
