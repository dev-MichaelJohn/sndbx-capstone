import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/main-data-table";
import { FileText, Shield, User } from "lucide-react";

import { useSupervisorReports } from "../api/supervisor.service";
import { getEvaluationReportColumns } from "@/features/evaluation-report/components/EvaluationReportColumns";
import { FacultySelfReportTab } from "@/features/evaluation-report/components/FacultySelfReportTab";
import { ReportDetailModal } from "@/features/evaluation-report/components/ReportDetailModal";

export const SupervisorReportsPage = () => {
  const [activeTab, setActiveTab] = useState("managed");
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);

  const { data: reports = [], isPending, isError, error } = useSupervisorReports();

  const columns = useMemo(() => getEvaluationReportColumns(), []);

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Evaluation Reports & FEDAF Plans
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
              Manage faculty evaluation results, FEDAF action plans, and view personal IFER.
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid h-9 w-full grid-cols-2 rounded-lg bg-muted/60 p-1 sm:w-80">
            <TabsTrigger value="managed" className="gap-2 rounded-md text-xs font-medium">
              <Shield className="size-3.5 text-indigo-400" />
              Managed Faculty Reports
            </TabsTrigger>
            <TabsTrigger value="self" className="gap-2 rounded-md text-xs font-medium">
              <User className="size-3.5 text-emerald-400" />
              My IFER Report
            </TabsTrigger>
          </TabsList>

          {/* Managed Reports Tab */}
          <TabsContent value="managed" className="mt-0">
            <Card className="flex flex-col gap-0 overflow-hidden rounded-xl border bg-card shadow-xs">
              <CardHeader className="border-b py-3">
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-primary" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Jurisdiction Faculty Reports
                  </h3>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <DataTable
                  columns={columns}
                  data={reports}
                  getRowId={(row) => String(row.id)}
                  isLoading={isPending}
                  isError={isError}
                  error={error}
                  emptyMessage="No evaluation reports generated under your supervisor scope."
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Self View Tab */}
          <TabsContent value="self" className="mt-0">
            <FacultySelfReportTab />
          </TabsContent>
        </Tabs>
      </div>

      <ReportDetailModal reportId={selectedReportId} onClose={() => setSelectedReportId(null)} />
    </div>
  );
};

export default SupervisorReportsPage;
