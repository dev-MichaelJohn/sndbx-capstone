import { useEvaluationAnalytics } from "@/features/analytics/api/evaluation-analytics.service";
import { KpiMetricsOverview } from "@/features/analytics/components/KpiMetricsOverview";
import { SemesterTrendsChart } from "@/features/analytics/components/SemesterTrendsChart";
import { CollegePerformanceChart } from "@/features/analytics/components/CollegePerformanceChart";
import { FacultyRankingsChart } from "@/features/analytics/components/FacultyRankingsChart";
import { LiveSubmissionsWidget } from "@/features/evaluation-execution/components/LiveSubmissionWidget";
import { useUser } from "@/features/auth/context/user.context";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";

import { SystemOverviewStats } from "../components/SystemOverviewStats";
import { QuickActionsGrid } from "../components/QuickActionsGrid";

export const AdminOverviewPage = () => {
  const { user } = useUser();
  const { data: analytics, isPending: isAnalyticsLoading } = useEvaluationAnalytics();

  const userName = user?.personalDetails
    ? `${user.personalDetails.first_name} ${user.personalDetails.last_name}`
    : "Administrator";
  const institutionalId = user?.personalDetails?.institutional_id ?? "N/A";

  if (isAnalyticsLoading) {
    return (
      <div className="flex h-full flex-1 items-center justify-center p-6 text-xs text-muted-foreground">
        Loading operational overview...
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 flex-col overflow-y-auto">
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-3 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge
              variant="outline"
              className="gap-1.5 border-purple-500/30 bg-purple-500/10 text-purple-400 text-xs font-semibold px-2.5 py-1"
            >
              <Building2 className="size-3.5" />
              Administrative Management Portal
            </Badge>
            <span className="font-mono text-[11px] text-muted-foreground">ID: {institutionalId}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl leading-tight">
            Welcome back, {userName}!
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Oversee academic operations, institutional evaluation analytics, evaluation schedules, and
            faculty performance reports.
          </p>
        </div>

        <SystemOverviewStats />

        <QuickActionsGrid />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LiveSubmissionsWidget />
          {analytics && <SemesterTrendsChart semesterTrends={analytics.semester_trends} />}
        </div>

        {analytics?.kpis && <KpiMetricsOverview kpis={analytics.kpis} />}

        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CollegePerformanceChart collegePerformance={analytics.college_performance} />
            <FacultyRankingsChart facultyRankings={analytics.faculty_rankings} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOverviewPage;
