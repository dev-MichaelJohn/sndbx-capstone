import { useEvaluationAnalytics } from "@/features/analytics/api/evaluation-analytics.service";
import { KpiMetricsOverview } from "@/features/analytics/components/KpiMetricsOverview";
import { SemesterTrendsChart } from "@/features/analytics/components/SemesterTrendsChart";
import { CollegePerformanceChart } from "@/features/analytics/components/CollegePerformanceChart";
import { CourseRankingsChart } from "@/features/analytics/components/CourseRankingChart";
import { FacultyRankingsChart } from "@/features/analytics/components/FacultyRankingsChart";
import { LiveSubmissionsWidget } from "@/features/evaluation-execution/components/LiveSubmissionWidget";
import { useUser } from "@/features/auth/context/user.context";

import { SystemOverviewStats } from "../components/SystemOverviewStats";
import { CommandShortcutGrid } from "../components/CommandShortcutGrid";
import { RoleHeroBanner } from "../components/RoleHeroBanner";

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
    <div className="flex h-full flex-1 flex-col overflow-y-auto">
      <div className="flex flex-col gap-6 p-6">
        <RoleHeroBanner
          name={userName}
          institutionalId={institutionalId}
          role="SYS_ADMIN"
          subtitle="Full system access to manage user accounts, institutional setup, evaluation forms, audit logs, and overall system health."
        />

        <SystemOverviewStats />

        <CommandShortcutGrid />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LiveSubmissionsWidget />
          {analytics && <SemesterTrendsChart semesterTrends={analytics.semester_trends} />}
        </div>

        {analytics?.kpis && <KpiMetricsOverview kpis={analytics.kpis} />}

        {analytics && (
          <div className="grid grid-cols-1 gap-6">
            <CollegePerformanceChart collegePerformance={analytics.college_performance} />
          </div>
        )}

        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CourseRankingsChart courseRankings={analytics.course_rankings} />
            <FacultyRankingsChart facultyRankings={analytics.faculty_rankings} />
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemAdminOverviewPage;
