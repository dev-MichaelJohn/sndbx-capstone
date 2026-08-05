import { Activity, CheckCircle2, FileText, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { EvaluationAnalyticsPayload } from "backend/types/evaluation-analytics.type";

interface KpiMetricsOverviewProps {
  kpis: EvaluationAnalyticsPayload["kpis"];
}

export const KpiMetricsOverview = ({ kpis }: KpiMetricsOverviewProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="rounded-xl shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Avg SET Rating
          </CardTitle>
          <Star className="size-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpis.avg_set_rating.toFixed(2)}</div>
          <CardDescription className="mt-1">Student Evaluation of Teaching</CardDescription>
        </CardContent>
      </Card>

      <Card className="rounded-xl shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Avg SEF Rating
          </CardTitle>
          <Activity className="size-4 text-indigo-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpis.avg_sef_rating.toFixed(2)}</div>
          <CardDescription className="mt-1">Supervisor Evaluation of Faculty</CardDescription>
        </CardContent>
      </Card>

      <Card className="rounded-xl shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Completion Rate
          </CardTitle>
          <CheckCircle2 className="size-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpis.completion_rate_percentage}%</div>
          <Progress value={kpis.completion_rate_percentage} className="mt-2 h-1.5" />
        </CardContent>
      </Card>

      <Card className="rounded-xl shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Reports Generated
          </CardTitle>
          <FileText className="size-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpis.total_reports_generated}</div>
          <CardDescription className="mt-1">Total individual evaluation reports</CardDescription>
        </CardContent>
      </Card>
    </div>
  );
};
