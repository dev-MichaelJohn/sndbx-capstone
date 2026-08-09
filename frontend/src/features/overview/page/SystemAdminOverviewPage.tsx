import { useEvaluationAnalytics } from "@/features/analytics/api/evaluation-analytics.service";
import { KpiMetricsOverview } from "@/features/analytics/components/KpiMetricsOverview";
import { SemesterTrendsChart } from "@/features/analytics/components/SemesterTrendsChart";
import { CollegePerformanceChart } from "@/features/analytics/components/CollegePerformanceChart";
import { CourseRankingsChart } from "@/features/analytics/components/CourseRankingChart";
import { FacultyRankingsChart } from "@/features/analytics/components/FacultyRankingsChart";
import { LiveSubmissionsWidget } from "@/features/evaluation-execution/components/LiveSubmissionWidget";
import { useUser } from "@/features/auth/context/user.context";
import { Badge } from "@/components/ui/badge";
import { Sliders } from "lucide-react";

import { SystemOverviewStats } from "../components/SystemOverviewStats";
import { QuickActionsGrid } from "../components/QuickActionsGrid";

export const SystemAdminOverviewPage = () => {
  const { user } = useUser();
  const { data: analytics, isPending: isAnalyticsLoading } = useEvaluationAnalytics();

  const userName = user?.personalDetails
    ? `${user.personalDetails.first_name} ${user.personalDetails.last_name}`
    : "System Administrator";
  const institutionalId = user?.personalDetails?.institutional_id ?? "N/A";

  if (isAnalyticsLoading) {
    return (
      <div className="flex h-full flex-1 items-center justify-center p-6 text-xs text-muted-foreground">
        Loading system administration overview...
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 flex-col overflow-y-auto p-6 gap-6">
      {/* System Admin Welcome Banner */}
      <div className="flex flex-col gap-2 rounded-2xl border border-primary/20 bg-primary/5 p-6 shadow-xs">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="gap-1 border-primary/30 bg-primary/10 text-primary text-xs"
          >
            <Sliders className="size-3.5" /> System Administration Console
          </Badge>
          <span className="font-mono text-xs text-muted-foreground">ID: {institutionalId}</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Welcome back, {userName}!
        </h1>
        <p className="text-xs text-muted-foreground sm:text-sm max-w-2xl">
          Full system access to manage user accounts, system configuration, evaluation forms, audit
          logs, and overall system health.
        </p>
      </div>

      {/* 1. Live System & Leadership Health */}
      <SystemOverviewStats />

      {/* 2. Quick Navigation Grid */}
      <QuickActionsGrid />

      {/* 3. Real-Time Activity Feed & Semester Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LiveSubmissionsWidget />
        {analytics && <SemesterTrendsChart semesterTrends={analytics.semester_trends} />}
      </div>

      {/* 4. Evaluation KPIs */}
      {analytics?.kpis && <KpiMetricsOverview kpis={analytics.kpis} />}

      {/* 5. College Performance Comparisons */}
      {analytics && (
        <div className="grid grid-cols-1 gap-6">
          <CollegePerformanceChart collegePerformance={analytics.college_performance} />
        </div>
      )}

      {/* 6. Institutional Leaderboards */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CourseRankingsChart courseRankings={analytics.course_rankings} />
          <FacultyRankingsChart facultyRankings={analytics.faculty_rankings} />
        </div>
      )}
    </div>
  );
};

export default SystemAdminOverviewPage;
