import { useEvaluationAnalytics } from "@/features/analytics/api/evaluation-analytics.service";
import { KpiMetricsOverview } from "@/features/analytics/components/KpiMetricsOverview";
import { SemesterTrendsChart } from "@/features/analytics/components/SemesterTrendsChart";
import { CollegePerformanceChart } from "@/features/analytics/components/CollegePerformanceChart";
import { CourseRankingsChart } from "@/features/analytics/components/CourseRankingChart";
import { FacultyRankingsChart } from "@/features/analytics/components/FacultyRankingsChart";

import { SystemOverviewStats } from "../components/SystemOverviewStats";
import { QuickActionsGrid } from "../components/QuickActionsGrid";

export const SystemAdminOverviewPage = () => {
  const { data: analytics, isPending: isAnalyticsLoading } = useEvaluationAnalytics();

  if (isAnalyticsLoading) {
    return (
      <div className="flex h-full flex-1 items-center justify-center p-6 text-xs text-muted-foreground">
        Loading system administration overview...
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 flex-col overflow-y-auto p-6 gap-6">
      {/* 1. Live System & Leadership Health */}
      <SystemOverviewStats />

      {/* 2. Quick Navigation Grid */}
      <QuickActionsGrid />

      {/* 3. Evaluation Evaluation KPIs */}
      {analytics?.kpis && <KpiMetricsOverview kpis={analytics.kpis} />}

      {/* 4. Chronological Performance & College Comparisons */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SemesterTrendsChart semesterTrends={analytics.semester_trends} />
          <CollegePerformanceChart collegePerformance={analytics.college_performance} />
        </div>
      )}

      {/* 5. Institutional Leaderboards */}
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
