import { useState, useMemo } from "react";
import { LineChart as LineChartIcon } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EvaluationAnalyticsPayload } from "backend/types/evaluation-analytics.type";

interface ProgramSemesterTrendsChartProps {
  programTrends: EvaluationAnalyticsPayload["program_semester_trends"];
}

const programTrendsConfig = {
  avg_set: { label: "Program Avg SET", color: "hsl(var(--chart-2))" },
  avg_sef: { label: "Program Avg SEF", color: "hsl(var(--chart-4))" },
} satisfies ChartConfig;

const EmptyChart = ({ message }: { message: string }) => (
  <div className="flex h-72 w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border/60 bg-muted/20">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
      <LineChartIcon className="h-6 w-6 text-muted-foreground/50" strokeWidth={1.5} />
    </div>
    <div className="text-center">
      <p className="text-sm font-medium text-muted-foreground">No data available</p>
      <p className="text-xs text-muted-foreground/60 mt-0.5">{message}</p>
    </div>
  </div>
);

export const ProgramSemesterTrendsChart = ({ programTrends }: ProgramSemesterTrendsChartProps) => {
  const uniquePrograms = useMemo(
    () => Array.from(new Set(programTrends.map((item) => item.program_code))),
    [programTrends],
  );

  const [selectedProgram, setSelectedProgram] = useState<string>(uniquePrograms[0] || "");

  const filteredData = useMemo(
    () =>
      programTrends
        .filter((item) => item.program_code === selectedProgram)
        .map(({ term, avg_set, avg_sef }) => ({ term, avg_set, avg_sef })),
    [programTrends, selectedProgram],
  );

  return (
    <Card className="rounded-xl shadow-xs">
      <CardHeader className="border-b">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chart-2/10 mt-0.5">
              <LineChartIcon className="h-4 w-4 text-chart-2" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Program Historical Trends</CardTitle>
              <CardDescription className="mt-0.5">
                Semester performance per degree program
              </CardDescription>
            </div>
          </div>

          {uniquePrograms.length > 0 && (
            <Select value={selectedProgram} onValueChange={setSelectedProgram}>
              <SelectTrigger className="w-44 h-8 text-xs shrink-0">
                <SelectValue placeholder="Select program" />
              </SelectTrigger>
              <SelectContent>
                {uniquePrograms.map((code) => (
                  <SelectItem key={code} value={code} className="text-xs">
                    {code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {uniquePrograms.length === 0 ? (
          <EmptyChart message="No programs have evaluation data yet." />
        ) : filteredData.length === 0 ? (
          <EmptyChart message="No historical data available for this program." />
        ) : (
          <ChartContainer config={programTrendsConfig} className="h-72 w-full">
            <LineChart data={filteredData} margin={{ top: 10, right: 30, left: -10, bottom: 0 }}>
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
