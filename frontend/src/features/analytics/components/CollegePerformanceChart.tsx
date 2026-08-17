import React from "react";
import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import type { EvaluationAnalyticsPayload } from "backend/types/evaluation-analytics.type";

interface CollegePerformanceChartProps {
  collegePerformance: EvaluationAnalyticsPayload["college_performance"];
}

const collegeChartConfig = {
  avg_set: { label: "Avg SET", color: "#10b981" }, // Emerald-500
  avg_sef: { label: "Avg SEF", color: "#3b82f6" }, // Blue-500
} satisfies ChartConfig;

const EmptyState = () => (
  <div className="flex h-72 w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border/60 bg-muted/20">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
      <BarChart3 className="h-6 w-6 text-muted-foreground/50" strokeWidth={1.5} />
    </div>
    <div className="text-center">
      <p className="text-sm font-medium text-muted-foreground">No college data</p>
      <p className="text-xs text-muted-foreground/60 mt-0.5">
        Performance data will appear once evaluations are completed.
      </p>
    </div>
  </div>
);

export const CollegePerformanceChart = React.memo(
  ({ collegePerformance }: CollegePerformanceChartProps) => {
    return (
      <Card className="rounded-xl shadow-xs">
        <CardHeader className="border-b">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 mt-0.5">
              <BarChart3 className="h-4 w-4 text-emerald-500" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">College Performance</CardTitle>
              <CardDescription className="mt-0.5">
                SET vs SEF rating comparisons across academic colleges
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {collegePerformance.length === 0 ? (
            <EmptyState />
          ) : (
            <ChartContainer config={collegeChartConfig} className="h-72 w-full">
              <BarChart
                data={collegePerformance}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                barCategoryGap="30%"
                barGap={4}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="college"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip
                  cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
                  content={<ChartTooltipContent />}
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="avg_set" fill="#10b981" radius={[5, 5, 0, 0]} />
                <Bar dataKey="avg_sef" fill="#3b82f6" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    );
  },
);

CollegePerformanceChart.displayName = "CollegePerformanceChart";
