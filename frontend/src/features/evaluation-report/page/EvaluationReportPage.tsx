import { useState, useMemo } from "react";
import { FileText, CheckCircle2, Star, Activity } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DataTable } from "@/components/main-data-table";
import { StatCard } from "@/components/ui/stat-card";
import { PageHeader } from "@/components/ui/page-header";

import { useAllReports } from "../api/evaluation-report.service";
import {
  getEvaluationReportColumns,
  type EvaluationReportRow,
} from "../components/EvaluationReportColumns";
import { BatchGenerateReportDialog } from "../components/BatchGenerateReportDialog";
import { ReportDetailDrawer } from "../components/ReportDetailDrawer";

export const EvaluationReportPage = () => {
  const [inspectReportId, setInspectReportId] = useState<number | null>(null);

  const { data: reports = [], isPending, isError, error } = useAllReports();

  const columns = useMemo(
    () =>
      getEvaluationReportColumns({
        onInspect: (reportId) => setInspectReportId(reportId),
      }),
    [],
  );

  // Compute summary stats
  const stats = useMemo(() => {
    const total = reports.length;
    const acknowledged = reports.filter((r) => r.status === "ACKNOWLEDGED").length;

    const setScores = reports.map((r) => Number(r.overall_set_rating)).filter(Boolean);
    const sefScores = reports.map((r) => Number(r.overall_sef_rating)).filter(Boolean);

    const avgSet = setScores.length
      ? (setScores.reduce((a, b) => a + b, 0) / setScores.length).toFixed(2)
      : "0.00";
    const avgSef = sefScores.length
      ? (sefScores.reduce((a, b) => a + b, 0) / sefScores.length).toFixed(2)
      : "0.00";

    return { total, acknowledged, avgSet, avgSef };
  }, [reports]);

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
        {/* Header */}
        <PageHeader
          title="Evaluation Reports & FEDAF Plans"
          description="Consolidated Individual Faculty Evaluation Reports (IFER) and FEDAF development plans per CHED CMO 19 s2025."
          actions={<BatchGenerateReportDialog />}
        />

        {/* KPI Stat Cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Reports"
            value={stats.total}
            subtitle="Generated IFER records"
            icon={FileText}
            accent="primary"
            isLoading={isPending}
          />
          <StatCard
            title="Avg SET Rating"
            value={stats.avgSet}
            subtitle="Student evaluation mean"
            icon={Star}
            accent="amber"
            isLoading={isPending}
          />
          <StatCard
            title="Avg SEF Rating"
            value={stats.avgSef}
            subtitle="Supervisor evaluation mean"
            icon={Activity}
            accent="indigo"
            isLoading={isPending}
          />
          <StatCard
            title="Acknowledged"
            value={stats.acknowledged}
            subtitle="Faculty confirmed reports"
            icon={CheckCircle2}
            accent="emerald"
            isLoading={isPending}
          />
        </div>

        {/* Main Reports Table */}
        <Card className="overflow-hidden rounded-xl border bg-card shadow-2xs">
          <CardHeader className="border-b py-3 px-5 bg-muted/20">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Faculty Evaluation Records
            </h3>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable<EvaluationReportRow>
              columns={columns}
              data={reports}
              getRowId={(row) => row.id.toString()}
              isLoading={isPending}
              isError={isError}
              error={error}
              emptyMessage="No evaluation reports generated yet. Run batch aggregation above to create reports."
            />
          </CardContent>
        </Card>
      </div>

      {/* Slide-over Inspection Drawer */}
      <ReportDetailDrawer reportId={inspectReportId} onClose={() => setInspectReportId(null)} />
    </div>
  );
};

export default EvaluationReportPage;
