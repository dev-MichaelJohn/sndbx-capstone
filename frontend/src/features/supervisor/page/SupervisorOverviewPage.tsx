import { useSupervisorAnalytics } from "../api/supervisor.service";
import { KpiMetricsOverview } from "@/features/analytics/components/KpiMetricsOverview";
import { SemesterTrendsChart } from "@/features/analytics/components/SemesterTrendsChart";
import { CollegePerformanceChart } from "@/features/analytics/components/CollegePerformanceChart";
import { FacultyRankingsChart } from "@/features/analytics/components/FacultyRankingsChart";
import { LiveSubmissionsWidget } from "@/features/evaluation-execution/components/LiveSubmissionWidget";
import { useUser } from "@/features/auth/context/user.context";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";

export const SupervisorOverviewPage = () => {
  const { user } = useUser();
  const { data: analytics, isPending } = useSupervisorAnalytics();

  const userName = user?.personalDetails
    ? `${user.personalDetails.first_name} ${user.personalDetails.last_name}`
    : "Supervisor";
  const institutionalId = user?.personalDetails?.institutional_id ?? "N/A";

  if (isPending) {
    return (
      <div className="flex h-full flex-1 items-center justify-center p-6 text-xs text-muted-foreground">
        Loading supervisor dashboard...
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 flex-col overflow-y-auto p-6 gap-6">
      {/* Supervisor Welcome Banner */}
      <div className="flex flex-col gap-2 rounded-2xl border border-primary/20 bg-primary/5 p-6 shadow-xs">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="gap-1 border-primary/30 bg-primary/10 text-primary text-xs"
          >
            <Shield className="size-3.5" /> Supervisor Portal
          </Badge>
          <span className="font-mono text-xs text-muted-foreground">ID: {institutionalId}</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Welcome back, {userName}!
        </h1>
        <p className="text-xs text-muted-foreground sm:text-sm max-w-2xl">
          Monitor faculty evaluations, complete SEF ratings for assigned course offerings, and
          review institutional reports under your jurisdiction.
        </p>
      </div>

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
