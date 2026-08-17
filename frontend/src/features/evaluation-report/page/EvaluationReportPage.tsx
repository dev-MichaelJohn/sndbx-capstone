import { useState, useEffect, useMemo } from "react";
import { FileText, CheckCircle2, Star, Activity, Calendar } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/main-data-table";
import { StatCard } from "@/components/ui/stat-card";
import { PageHeader } from "@/components/ui/page-header";

import { useAllReports } from "../api/evaluation-report.service";
import { useSemesters } from "@/features/semester/api/semester.service";
import {
  getEvaluationReportColumns,
  type EvaluationReportRow,
} from "../components/EvaluationReportColumns";
import { BatchGenerateReportDialog } from "../components/BatchGenerateReportDialog";
import { ReportDetailDrawer } from "../components/ReportDetailDrawer";

export const EvaluationReportPage = () => {
  const [inspectReportId, setInspectReportId] = useState<number | null>(null);
  const [selectedSemesterId, setSelectedSemesterId] = useState<number | undefined>(undefined);

  // Fetch academic semesters ordered by latest ID
  const { data: semesterResponse, isLoading: isLoadingSemesters } = useSemesters({
    search: undefined,
    page: 1,
    orderBy: "id",
    orderDir: "desc",
  });
  const semesters = semesterResponse?.data ?? [];

  // Default to active/current semester once semesters load
  useEffect(() => {
    if (semesters.length > 0 && selectedSemesterId === undefined) {
      setSelectedSemesterId(semesters[0].id);
    }
  }, [semesters, selectedSemesterId]);

  const { data: reports = [], isPending, isError, error } = useAllReports();

  const columns = useMemo(
    () =>
      getEvaluationReportColumns({
        onInspect: (reportId) => setInspectReportId(reportId),
      }),
    [],
  );

  // Filter reports by selected semester (or show all if explicitly set to ALL)
  const filteredReports = useMemo(() => {
    if (!selectedSemesterId) return reports;
    return reports.filter((r) => r.semester_id === selectedSemesterId);
  }, [reports, selectedSemesterId]);

  // Compute summary stats based on filtered reports
  const stats = useMemo(() => {
    const total = filteredReports.length;
    const acknowledged = filteredReports.filter((r) => r.status === "ACKNOWLEDGED").length;

    const setScores = filteredReports.map((r) => Number(r.overall_set_rating)).filter(Boolean);
    const sefScores = filteredReports.map((r) => Number(r.overall_sef_rating)).filter(Boolean);

    const avgSet = setScores.length
      ? (setScores.reduce((a, b) => a + b, 0) / setScores.length).toFixed(2)
      : "0.00";
    const avgSef = sefScores.length
      ? (sefScores.reduce((a, b) => a + b, 0) / sefScores.length).toFixed(2)
      : "0.00";

    return { total, acknowledged, avgSet, avgSef };
  }, [filteredReports]);

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
        {/* Header with Semester Filter */}
        <PageHeader
          title="Evaluation Reports & FEDAF Plans"
          description="Consolidated Individual Faculty Evaluation Reports (IFER) and FEDAF development plans per CHED CMO 19 s2025."
          actions={
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-2">
                <Calendar className="size-3.5 text-muted-foreground shrink-0" />
                <Select
                  value={selectedSemesterId ? String(selectedSemesterId) : "ALL"}
                  onValueChange={(val) =>
                    setSelectedSemesterId(val === "ALL" ? undefined : Number(val))
                  }
                  disabled={isLoadingSemesters}
                >
                  <SelectTrigger className="h-8 w-56 text-xs rounded-lg bg-card">
                    <SelectValue
                      placeholder={isLoadingSemesters ? "Loading terms..." : "Select Term"}
                    />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="ALL" className="text-xs font-medium">
                      All Semesters
                    </SelectItem>
                    {semesters.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)} className="text-xs">
                        A.Y. {s.school_year_start}–{s.school_year_end} ({s.semester_term} Term)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <BatchGenerateReportDialog />
            </div>
          }
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
              data={filteredReports}
              getRowId={(row) => row.id.toString()}
              isLoading={isPending}
              isError={isError}
              error={error}
              emptyMessage="No evaluation reports found for the selected academic term."
            />
          </CardContent>
        </Card>
      </div>

      {/* Inspection Drawer */}
      <ReportDetailDrawer reportId={inspectReportId} onClose={() => setInspectReportId(null)} />
    </div>
  );
};

export default EvaluationReportPage;
