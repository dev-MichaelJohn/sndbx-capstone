import { Award, Users, TrendingUp, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import type { EvaluationAnalyticsPayload } from "backend/types/evaluation-analytics.type";

interface FacultyRankingsChartProps {
  facultyRankings: EvaluationAnalyticsPayload["faculty_rankings"];
}

const EmptyList = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center gap-2 py-10">
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
      <Users className="h-5 w-5 text-muted-foreground/50" strokeWidth={1.5} />
    </div>
    <p className="text-sm text-muted-foreground">{message}</p>
  </div>
);

const topBadgeStyle = (index: number) => {
  if (index === 0) return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";
  if (index === 1) return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
  if (index === 2)
    return "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400";
  return "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400";
};

export const FacultyRankingsChart = ({ facultyRankings }: FacultyRankingsChartProps) => {
  return (
    <Card className="rounded-xl shadow-xs flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 mt-0.5">
            <Award className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">Faculty Rankings</CardTitle>
            <CardDescription className="mt-0.5">
              Top and bottom faculty evaluation rankings
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 flex-1">
        <Tabs defaultValue="top-faculty" className="w-full">
          <TabsList className="w-full grid grid-cols-2 mb-4 h-9">
            <TabsTrigger value="top-faculty" className="text-xs gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" />
              Top Faculty
            </TabsTrigger>
            <TabsTrigger value="bottom-faculty" className="text-xs gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" />
              Needs Support
            </TabsTrigger>
          </TabsList>

          <TabsContent value="top-faculty" className="space-y-1 mt-0">
            {facultyRankings.top_faculty.length === 0 ? (
              <EmptyList message="No top faculty data available yet." />
            ) : (
              facultyRankings.top_faculty.map((faculty, index) => (
                <div
                  key={faculty.faculty_id}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${topBadgeStyle(index)}`}
                    >
                      {index < 3 ? <Award className="h-3.5 w-3.5" /> : index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{faculty.faculty_name}</p>
                      <p className="text-xs text-muted-foreground">ID: {faculty.faculty_id}</p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="ml-2 shrink-0 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 font-semibold"
                  >
                    {faculty.avg_rating.toFixed(2)}
                  </Badge>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="bottom-faculty" className="space-y-1 mt-0">
            {facultyRankings.bottom_faculty.length === 0 ? (
              <EmptyList message="No faculty flagged for support." />
            ) : (
              facultyRankings.bottom_faculty.map((faculty, index) => (
                <div
                  key={faculty.faculty_id}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-50 text-xs font-bold text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{faculty.faculty_name}</p>
                      <p className="text-xs text-muted-foreground">ID: {faculty.faculty_id}</p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="ml-2 shrink-0 bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 font-semibold"
                  >
                    {faculty.avg_rating.toFixed(2)}
                  </Badge>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
