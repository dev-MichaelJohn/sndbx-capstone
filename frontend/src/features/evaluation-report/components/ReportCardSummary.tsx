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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* Primary 1: SET Rating */}
        <div className="rounded-xl border p-4 bg-muted/20 space-y-1">
          <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
            <Star className="size-4 text-amber-500" />
            <span>Student Evaluation (SET)</span>
          </div>
          <p className="text-2xl font-bold font-mono text-foreground">
            {report.overall_set_rating ? `${Number(report.overall_set_rating).toFixed(2)}%` : "N/A"}
          </p>
        </div>

        {/* Primary 2: SEF Rating */}
        <div className="rounded-xl border p-4 bg-muted/20 space-y-1">
          <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
            <Activity className="size-4 text-indigo-500" />
            <span>Supervisor Evaluation (SEF)</span>
          </div>
          <p className="text-2xl font-bold font-mono text-foreground">
            {report.overall_sef_rating ? `${Number(report.overall_sef_rating).toFixed(2)}%` : "N/A"}
          </p>
        </div>

        {/* Optional: Combined Rating (Only shown if custom weights were specified) */}
        {combined_weighted_rating != null && (
          <div className="sm:col-span-2 rounded-xl border p-4 bg-emerald-500/10 border-emerald-500/20 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
              <FileText className="size-4" />
              <span>Optional Combined Score</span>
            </div>
            <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {combined_weighted_rating.toFixed(2)}%
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
