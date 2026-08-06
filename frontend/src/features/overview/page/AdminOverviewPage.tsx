import { useEvaluationAnalytics } from "@/features/analytics/api/evaluation-analytics.service";
import { KpiMetricsOverview } from "@/features/analytics/components/KpiMetricsOverview";
import { SemesterTrendsChart } from "@/features/analytics/components/SemesterTrendsChart";
import { CollegePerformanceChart } from "@/features/analytics/components/CollegePerformanceChart";
import { FacultyRankingsChart } from "@/features/analytics/components/FacultyRankingsChart";
import { LiveSubmissionsWidget } from "@/features/evaluation-execution/components/LiveSubmissionWidget";

import { SystemOverviewStats } from "../components/SystemOverviewStats";
import { QuickActionsGrid } from "../components/QuickActionsGrid";

export const AdminOverviewPage = () => {
  const { data: analytics, isPending: isAnalyticsLoading } = useEvaluationAnalytics();

  if (isAnalyticsLoading) {
    return (
      <div className="flex h-full flex-1 items-center justify-center p-6 text-xs text-muted-foreground">
        Loading operational overview...
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 flex-col overflow-y-auto p-6 gap-6">
      {/* High-level status cards */}
      <SystemOverviewStats />

      {/* Dynamic route-aware quick actions */}
      <QuickActionsGrid />

      {/* Real-time submissions & active term trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LiveSubmissionsWidget />
        {analytics && <SemesterTrendsChart semesterTrends={analytics.semester_trends} />}
      </div>

      {/* Evaluation KPIs & Department Insights */}
      {analytics?.kpis && <KpiMetricsOverview kpis={analytics.kpis} />}

      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CollegePerformanceChart collegePerformance={analytics.college_performance} />
          <FacultyRankingsChart facultyRankings={analytics.faculty_rankings} />
        </div>
      )}
    </div>
  );
};

export default AdminOverviewPage;
