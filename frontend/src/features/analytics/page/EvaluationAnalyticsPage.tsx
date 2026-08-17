import { useState } from "react";
import { useEvaluationAnalytics } from "../api/evaluation-analytics.service";
import { AnalyticsHeader } from "../components/AnalyticsHeader";
import { KpiMetricsOverview } from "../components/KpiMetricsOverview";
import { SemesterTrendsChart } from "../components/SemesterTrendsChart";
import { CollegePerformanceChart } from "../components/CollegePerformanceChart";
import { ProgramSemesterTrendsChart } from "../components/ProgramSemesterTrendsChart";
import { SentimentBreakdownChart } from "../components/SentimentBreakdownChart";
import { CourseRankingsChart } from "../components/CourseRankingChart";
import { FacultyRankingsChart } from "../components/FacultyRankingsChart";
import { Button } from "@/components/ui/button";

export const EvaluationAnalyticsPage = () => {
  const [selectedSemesterId, setSelectedSemesterId] = useState<number | undefined>(undefined);

  const {
    data: analytics,
    isPending: isAnalyticsPending,
    isError: isAnalyticsError,
    error: analyticsError,
    refetch,
  } = useEvaluationAnalytics(selectedSemesterId);

  if (isAnalyticsPending) {
    return (
      <div className="flex h-full flex-1 items-center justify-center p-6 text-sm text-muted-foreground">
        Loading institutional evaluation analytics...
      </div>
    );
  }

  if (isAnalyticsError || !analytics) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center gap-4 p-6">
        <p className="text-sm text-destructive">
          {analyticsError instanceof Error
            ? analyticsError.message
            : "Failed to load analytics data."}
        </p>
        <Button variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
        {/* 1. Header Section with Semester Selector */}
        <AnalyticsHeader
          selectedSemesterId={selectedSemesterId}
          onSemesterChange={setSelectedSemesterId}
        />

        {/* 2. KPI Summary Metrics Overview */}
        <KpiMetricsOverview kpis={analytics.kpis} />

        {/* 3. Institutional Semester Trends & College Performance */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SemesterTrendsChart semesterTrends={analytics.semester_trends} />
          <CollegePerformanceChart collegePerformance={analytics.college_performance} />
        </div>

        {/* 4. Program Historical Trends & Sentiment Breakdown */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ProgramSemesterTrendsChart programTrends={analytics.program_semester_trends} />
          <SentimentBreakdownChart sentimentBreakdown={analytics.sentiment_breakdown} />
        </div>

        {/* 5. Course & Faculty Rankings Leaderboards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <CourseRankingsChart courseRankings={analytics.course_rankings} />
          <FacultyRankingsChart facultyRankings={analytics.faculty_rankings} />
        </div>
      </div>
    </div>
  );
};

export default EvaluationAnalyticsPage;
