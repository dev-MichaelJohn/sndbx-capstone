import { useQuery } from "@tanstack/react-query";
import { getColleges } from "@/features/college/api/college.service";
import { useEvaluationAnalytics } from "@/features/analytics/api/evaluation-analytics.service";

import { SystemOverviewStats } from "../components/SystemOverviewStats";
import { QuickActionsGrid } from "../components/QuickActionsGrid";

import { SemesterTrendsChart } from "@/features/analytics/components/SemesterTrendsChart";
import { CollegePerformanceChart } from "@/features/analytics/components/CollegePerformanceChart";
import { CourseRankingsChart } from "@/features/analytics/components/CourseRankingChart";
import { FacultyRankingsChart } from "@/features/analytics/components/FacultyRankingsChart";

export const SystemAdminOverviewPage = () => {
  const { data: analytics, isPending: isAnalyticsLoading } = useEvaluationAnalytics();

  const { data: collegeRes, isPending: isCollegesLoading } = useQuery({
    queryKey: ["getColleges", 1, ""],
    queryFn: () => getColleges({ page: 1, search: "" }),
  });

  const colleges = collegeRes?.data ?? [];
  const totalColleges = collegeRes?.pagination?.totalItems ?? colleges.length;

  if (isAnalyticsLoading || isCollegesLoading) {
    return (
      <div className="flex h-full flex-1 items-center justify-center p-6 text-sm text-muted-foreground">
        Loading command center...
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 flex-col overflow-y-auto p-6 gap-6">
      {/* 1. Tailored Stat Grid */}
      <SystemOverviewStats
        colleges={colleges}
        totalColleges={totalColleges}
        kpis={analytics?.kpis}
      />

      {/* 2. Quick Workflow Actions */}
      <QuickActionsGrid />

      {/* 3. Performance Trends & Comparisons */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SemesterTrendsChart semesterTrends={analytics.semester_trends} />
          <CollegePerformanceChart collegePerformance={analytics.college_performance} />
        </div>
      )}

      {/* 4. Course & Faculty Leaderboards */}
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
