import { useState } from "react";
import { useSupervisorAnalytics } from "../api/supervisor.service";
import { KpiMetricsOverview } from "@/features/analytics/components/KpiMetricsOverview";
import { SemesterTrendsChart } from "@/features/analytics/components/SemesterTrendsChart";
import { CollegePerformanceChart } from "@/features/analytics/components/CollegePerformanceChart";
import { ProgramSemesterTrendsChart } from "@/features/analytics/components/ProgramSemesterTrendsChart";
import { SentimentBreakdownChart } from "@/features/analytics/components/SentimentBreakdownChart";
import { CourseRankingsChart } from "@/features/analytics/components/CourseRankingChart";
import { FacultyRankingsChart } from "@/features/analytics/components/FacultyRankingsChart";
import { Button } from "@/components/ui/button";

export const SupervisorAnalyticsPage = () => {
  const [semesterId] = useState<number | undefined>(undefined);

  const {
    data: analytics,
    isPending,
    isError,
    error,
    refetch,
  } = useSupervisorAnalytics(semesterId);

  if (isPending) {
    return (
      <div className="flex h-full flex-1 items-center justify-center p-6 text-xs text-muted-foreground">
        Loading supervisor coverage analytics...
      </div>
    );
  }

  if (isError || !analytics) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center gap-4 p-6">
        <p className="text-xs text-destructive">
          {error instanceof Error ? error.message : "Failed to load analytics data."}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="h-8 rounded-lg text-xs"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
        {/* Page Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Supervisor Analytics
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Evaluation performance and metrics scoped to your assigned college or program
            jurisdiction.
          </p>
        </div>

        {/* 1. KPIs Overview */}
        <KpiMetricsOverview kpis={analytics.kpis} />

        {/* 2. Institutional Trends & College Performance */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SemesterTrendsChart semesterTrends={analytics.semester_trends} />
          <CollegePerformanceChart collegePerformance={analytics.college_performance} />
        </div>

        {/* 3. Program Trends & Sentiment Breakdown */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ProgramSemesterTrendsChart programTrends={analytics.program_semester_trends} />
          <SentimentBreakdownChart sentimentBreakdown={analytics.sentiment_breakdown} />
        </div>

        {/* 4. Course & Faculty Leaderboards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <CourseRankingsChart courseRankings={analytics.course_rankings} />
          <FacultyRankingsChart facultyRankings={analytics.faculty_rankings} />
        </div>
      </div>
    </div>
  );
};

export default SupervisorAnalyticsPage;
