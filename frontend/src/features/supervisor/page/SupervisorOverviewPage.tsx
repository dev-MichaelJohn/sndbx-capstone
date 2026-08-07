import { useSupervisorAnalytics } from "../api/supervisor.service";
import { KpiMetricsOverview } from "@/features/analytics/components/KpiMetricsOverview";
import { SemesterTrendsChart } from "@/features/analytics/components/SemesterTrendsChart";
import { CollegePerformanceChart } from "@/features/analytics/components/CollegePerformanceChart";
import { FacultyRankingsChart } from "@/features/analytics/components/FacultyRankingsChart";
import { LiveSubmissionsWidget } from "@/features/evaluation-execution/components/LiveSubmissionWidget";

export const SupervisorOverviewPage = () => {
  const { data: analytics, isPending } = useSupervisorAnalytics();

  if (isPending) {
    return (
      <div className="flex h-full flex-1 items-center justify-center p-6 text-xs text-muted-foreground">
        Loading supervisor dashboard...
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 flex-col overflow-y-auto p-6 gap-6">
      {/* Real-time Submissions Feed & Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LiveSubmissionsWidget />
        {analytics && <SemesterTrendsChart semesterTrends={analytics.semester_trends} />}
      </div>

      {/* Scoped KPIs */}
      {analytics?.kpis && <KpiMetricsOverview kpis={analytics.kpis} />}

      {/* Scoped Charts & Leaderboards */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CollegePerformanceChart collegePerformance={analytics.college_performance} />
          <FacultyRankingsChart facultyRankings={analytics.faculty_rankings} />
        </div>
      )}
    </div>
  );
};

export default SupervisorOverviewPage;
