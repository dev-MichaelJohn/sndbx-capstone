import { useMemo } from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DataTable } from "@/components/main-data-table";

import { useAllReports } from "../api/evaluation-report.service";
import { getEvaluationReportColumns } from "../components/EvaluationReportColumns";
import { BatchGenerateReportDialog } from "../components/BatchGenerateReportDialog";

export const EvaluationReportPage = () => {
  const { data: reports = [], isPending, isError, error } = useAllReports();

  const columns = useMemo(() => getEvaluationReportColumns(), []);

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                Evaluation Reports
              </h1>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
              Consolidated Individual Faculty Evaluation Reports (IFER) and FEDAF development plans.
            </p>
          </div>

          <BatchGenerateReportDialog />
        </div>

        <Card className="flex flex-col gap-0 overflow-hidden rounded-xl border border-border/70 bg-card shadow-xs">
          <CardHeader className="border-b border-border/60">
            <h3 className="text-xs font-semibold tracking-tight text-foreground uppercase">
              Faculty Evaluation History & Records
            </h3>
          </CardHeader>

          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={reports}
              getRowId={(row) => row.id.toString()}
              isLoading={isPending}
              isError={isError}
              error={error}
              emptyMessage="No evaluation reports generated yet."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EvaluationReportPage;
