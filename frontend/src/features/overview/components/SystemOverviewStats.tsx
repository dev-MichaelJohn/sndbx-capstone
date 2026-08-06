import { Building2, Users, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { CollegeWithDean } from "backend/types/college.types";
import type { EvaluationAnalyticsPayload } from "backend/types/evaluation-analytics.type";

interface SystemOverviewStatsProps {
  colleges: CollegeWithDean[];
  totalColleges: number;
  kpis?: EvaluationAnalyticsPayload["kpis"];
}

export function SystemOverviewStats({ colleges, totalColleges, kpis }: SystemOverviewStatsProps) {
  const assignedDeans = colleges.filter((c) => c.account_id).length;
  const coverageRatio = totalColleges > 0 ? Math.round((assignedDeans / totalColleges) * 100) : 0;
  const completionRate = kpis?.completion_rate_percentage ?? 0;

  const stats = [
    {
      label: "Total Colleges",
      value: totalColleges,
      subtext: `${assignedDeans} Deans Assigned`,
      icon: Building2,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Dean Leadership Coverage",
      value: `${coverageRatio}%`,
      subtext: "Institutional Coverage",
      icon: ShieldCheck,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Evaluation Completion",
      value: `${completionRate}%`,
      subtext: `${kpis?.total_reports_generated ?? 0} Reports Generated`,
      icon: CheckCircle2,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      progress: completionRate,
    },
    {
      label: "Avg SET / SEF Scores",
      value: kpis
        ? `${kpis.avg_set_rating.toFixed(2)} / ${kpis.avg_sef_rating.toFixed(2)}`
        : "0.00",
      subtext: "SET / SEF Rating Averages",
      icon: Users,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label} className="rounded-xl border shadow-xs bg-card">
            <CardContent className="p-4 flex items-center justify-between gap-3">
              <div className="space-y-1 min-w-0 flex-1">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground truncate">
                  {item.label}
                </p>
                <p className="text-2xl font-bold tracking-tight text-foreground">{item.value}</p>
                <p className="text-xs text-muted-foreground/80">{item.subtext}</p>
                {item.progress !== undefined && (
                  <Progress value={item.progress} className="h-1 mt-2" />
                )}
              </div>
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.bg}`}
              >
                <Icon className={`h-5 w-5 ${item.color}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
