import { BookOpen, Users, Layers } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ClassDetailsMetricsProps {
  totalOfferings: number;
  totalStudents: number;
}

export const ClassDetailsMetrics = ({
  totalOfferings,
  totalStudents,
}: ClassDetailsMetricsProps) => {
  const stats = [
    {
      title: "Total Offerings",
      value: totalOfferings,
      subtitle: "Active courses assigned",
      icon: BookOpen,
      bar: "bg-primary",
      iconBg: "bg-primary/10 text-primary",
      shadow: "hover:shadow-primary/20",
      border: "hover:border-primary/40",
    },
    {
      title: "Enrolled Students",
      value: totalStudents,
      subtitle: "Active class roster",
      icon: Users,
      bar: "bg-emerald-500",
      iconBg: "bg-emerald-500/10 text-emerald-500",
      shadow: "hover:shadow-emerald-500/20",
      border: "hover:border-emerald-500/40",
    },
    {
      title: "Class Status",
      value: "Active",
      subtitle: "Current academic session",
      icon: Layers,
      bar: "bg-blue-500",
      iconBg: "bg-blue-500/10 text-blue-500",
      shadow: "hover:shadow-blue-500/20",
      border: "hover:border-blue-500/40",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {stats.map((item) => {
        const Icon = item.icon;
        return (
          <Card
            key={item.title}
            className={`
              group relative overflow-hidden rounded-xl border bg-card shadow-xs
              transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md
              ${item.shadow} ${item.border}
            `}
          >
            {/* Top Accent bar */}
            <div
              className={`absolute left-0 top-0 h-1 w-full transition-all duration-300 ${item.bar}`}
            />

            <div className="flex items-center justify-between p-4">
              <div className="space-y-0.5">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                  {item.title}
                </p>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  {item.value}
                </h2>
                <p className="text-[10px] text-muted-foreground/60">{item.subtitle}</p>
              </div>

              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.iconBg}`}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
