import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import type { EvaluationAnalyticsPayload } from "backend/types/evaluation-analytics.type";

interface SemesterTrendsChartProps {
  semesterTrends: EvaluationAnalyticsPayload["semester_trends"];
}

const semesterTrendsConfig = {
  avg_set: { label: "Avg SET", color: "hsl(var(--chart-1))" },
  avg_sef: { label: "Avg SEF", color: "hsl(var(--chart-3))" },
} satisfies ChartConfig;

const EmptyState = () => (
  <div className="flex h-72 w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border/60 bg-muted/20">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
      <TrendingUp className="h-6 w-6 text-muted-foreground/50" strokeWidth={1.5} />
    </div>
    <div className="text-center">
      <p className="text-sm font-medium text-muted-foreground">No trend data yet</p>
      <p className="text-xs text-muted-foreground/60 mt-0.5">
        Trends appear once at least two terms have been evaluated.
      </p>
    </div>
  </div>
);

export const SemesterTrendsChart = ({ semesterTrends }: SemesterTrendsChartProps) => {
  return (
    <Card className="rounded-xl shadow-xs">
      <CardHeader className="border-b">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chart-1/10 mt-0.5">
            <TrendingUp className="h-4 w-4 text-chart-1" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">Institutional Trends</CardTitle>
            <CardDescription className="mt-0.5">
              Chronological performance progression over academic terms
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {semesterTrends.length === 0 ? (
          <EmptyState />
        ) : (
          <ChartContainer config={semesterTrendsConfig} className="h-72 w-full">
            <LineChart data={semesterTrends} margin={{ top: 10, right: 30, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis
                dataKey="term"
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                domain={[1, 5]}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line
                type="monotone"
                dataKey="avg_set"
                stroke="var(--color-avg_set)"
                strokeWidth={2.5}
                dot={{ r: 4, strokeWidth: 2, fill: "var(--background)" }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="avg_sef"
                stroke="var(--color-avg_sef)"
                strokeWidth={2.5}
                dot={{ r: 4, strokeWidth: 2, fill: "var(--background)" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};
