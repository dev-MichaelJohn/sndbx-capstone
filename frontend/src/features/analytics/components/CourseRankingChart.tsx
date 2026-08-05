import { BookOpen, TrendingUp, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import type { EvaluationAnalyticsPayload } from "backend/types/evaluation-analytics.type";

interface CourseRankingsChartProps {
  courseRankings: EvaluationAnalyticsPayload["course_rankings"];
}

const EmptyList = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center gap-2 py-10">
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
      <BookOpen className="h-5 w-5 text-muted-foreground/50" strokeWidth={1.5} />
    </div>
    <p className="text-sm text-muted-foreground">{message}</p>
  </div>
);

const rankBadgeClass = (index: number, variant: "top" | "bottom") =>
  variant === "top"
    ? index === 0
      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
      : "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
    : "bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400";

export const CourseRankingsChart = ({ courseRankings }: CourseRankingsChartProps) => {
  return (
    <Card className="rounded-xl shadow-xs flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 mt-0.5">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">Course Rankings</CardTitle>
            <CardDescription className="mt-0.5">
              Top and bottom courses based on SET ratings
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 flex-1">
        <Tabs defaultValue="top-courses" className="w-full">
          <TabsList className="w-full grid grid-cols-2 mb-4 h-9">
            <TabsTrigger value="top-courses" className="text-xs gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" />
              Top Courses
            </TabsTrigger>
            <TabsTrigger value="bottom-courses" className="text-xs gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" />
              Needs Attention
            </TabsTrigger>
          </TabsList>

          <TabsContent value="top-courses" className="space-y-1 mt-0">
            {courseRankings.top_courses.length === 0 ? (
              <EmptyList message="No top course data available yet." />
            ) : (
              courseRankings.top_courses.map((course, index) => (
                <div
                  key={course.course_code}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${rankBadgeClass(index, "top")}`}
                    >
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{course.course_code}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-45">
                        {course.course_title}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="ml-2 shrink-0 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-semibold"
                  >
                    {course.avg_set.toFixed(2)}
                  </Badge>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="bottom-courses" className="space-y-1 mt-0">
            {courseRankings.bottom_courses.length === 0 ? (
              <EmptyList message="No courses flagged for attention." />
            ) : (
              courseRankings.bottom_courses.map((course, index) => (
                <div
                  key={course.course_code}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${rankBadgeClass(index, "bottom")}`}
                    >
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{course.course_code}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-45">
                        {course.course_title}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="ml-2 shrink-0 bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 font-semibold"
                  >
                    {course.avg_set.toFixed(2)}
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
