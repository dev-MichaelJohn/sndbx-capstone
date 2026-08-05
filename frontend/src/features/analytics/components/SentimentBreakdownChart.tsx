import { MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { EvaluationAnalyticsPayload } from "backend/types/evaluation-analytics.type";

interface SentimentBreakdownChartProps {
  sentimentBreakdown: EvaluationAnalyticsPayload["sentiment_breakdown"];
}

const sentimentConfig = {
  positive_pct: { label: "Positive", color: "hsl(var(--chart-2))" },
  neutral_pct: { label: "Neutral", color: "hsl(var(--chart-4))" },
  negative_pct: { label: "Negative", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig;

const sentimentMeta = [
  {
    key: "positive_pct" as const,
    label: "Positive",
    color: "hsl(var(--chart-2))",
    dot: "bg-chart-2",
  },
  {
    key: "neutral_pct" as const,
    label: "Neutral",
    color: "hsl(var(--chart-4))",
    dot: "bg-chart-4",
  },
  {
    key: "negative_pct" as const,
    label: "Negative",
    color: "hsl(var(--chart-5))",
    dot: "bg-chart-5",
  },
];

export const SentimentBreakdownChart = ({ sentimentBreakdown }: SentimentBreakdownChartProps) => {
  const sentimentData = sentimentMeta.map(({ key, label, color }) => ({
    name: label,
    value: sentimentBreakdown[key],
    fill: color,
  }));

  const hasData = sentimentData.some((d) => d.value > 0);
  const dominant = hasData ? sentimentData.reduce((a, b) => (a.value > b.value ? a : b)) : null;

  return (
    <Card className="rounded-xl shadow-xs">
      <CardHeader className="border-b">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chart-2/10 mt-0.5">
            <MessageSquare className="h-4 w-4 text-chart-2" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">Student Feedback Sentiment</CardTitle>
            <CardDescription className="mt-0.5">
              Qualitative evaluation sentiment proportions
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {!hasData ? (
          <div className="flex h-64 w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border/60 bg-muted/20">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <MessageSquare className="h-6 w-6 text-muted-foreground/50" strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">No sentiment data</p>
              <p className="text-xs text-muted-foreground/60 mt-0.5">
                Sentiment is derived from open-ended feedback responses.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            {/* Donut chart */}
            <div className="relative">
              <ChartContainer config={sentimentConfig} className="h-52 w-52">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={78}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {sentimentData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
              {/* Center label */}
              {dominant && (
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">{dominant.value}%</span>
                  <span className="text-xs text-muted-foreground">{dominant.name}</span>
                </div>
              )}
            </div>

            {/* Legend row */}
            <div className="flex items-center justify-center gap-5">
              {sentimentMeta.map(({ key, label, dot }) => (
                <div key={key} className="flex items-center gap-1.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
                  <span className="text-xs text-muted-foreground">
                    {label}{" "}
                    <span className="font-medium text-foreground">{sentimentBreakdown[key]}%</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
