import { BookOpen, UserCheck, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { ProgramWithChairType } from "backend/types/program.type";

interface ProgramStatsCardsProps {
  programs: ProgramWithChairType[];
  total: number;
}

const stats = [
  {
    title: "Total Programs",
    value: (props: ProgramStatsCardsProps) => props.total,
    subtitle: "Active courses",
    icon: BookOpen,
    accent: "primary",
  },
  {
    title: "Assigned Chairs",
    value: (props: ProgramStatsCardsProps) => props.programs.filter((p) => p.account_id).length,
    subtitle: "Active leadership",
    icon: UserCheck,
    accent: "emerald",
  },
  {
    title: "Chair Coverage",
    value: (props: ProgramStatsCardsProps) => {
      if (!props.total || props.total === 0) return "0%";
      const assigned = props.programs.filter((p) => p.account_id).length;
      return `${Math.round((assigned / props.total) * 100)}%`;
    },
    subtitle: "Filled positions",
    icon: ShieldCheck,
    accent: "blue",
  },
];

const accentStyles = {
  primary: {
    bar: "bg-primary",
    iconBg: "bg-primary/10 text-primary",
    shadow: "hover:shadow-primary/20",
    border: "hover:border-primary/40",
  },
  emerald: {
    bar: "bg-emerald-500",
    iconBg: "bg-emerald-500/10 text-emerald-500",
    shadow: "hover:shadow-emerald-500/20",
    border: "hover:border-emerald-500/40",
  },
  blue: {
    bar: "bg-blue-500",
    iconBg: "bg-blue-500/10 text-blue-500",
    shadow: "hover:shadow-blue-500/20",
    border: "hover:border-blue-500/40",
  },
} as const;

export const ProgramStatsCards = ({ programs, total }: ProgramStatsCardsProps) => {
  const props = { programs, total };

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {stats.map((item) => {
        const Icon = item.icon;
        const styles = accentStyles[item.accent as keyof typeof accentStyles];

        return (
          <Card
            key={item.title}
            className={`
              group relative overflow-hidden rounded-lg border bg-card
              shadow-sm transition-all duration-200
              hover:-translate-y-1 hover:shadow-md
              ${styles.shadow} ${styles.border}
            `}
          >
            {/* Accent bar */}
            <div
              className={`
                absolute left-0 top-0 h-1 w-full
                transition-all duration-300 ease-out
                group-hover:w-[110%] group-hover:scale-x-105
                ${styles.bar}
              `}
            />

            <div className="flex items-center justify-between p-4">
              <div className="space-y-0.5">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
                  {item.title}
                </p>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  {item.value(props)}
                </h2>
                <p className="text-[10px] text-muted-foreground/50">{item.subtitle}</p>
              </div>

              {/* Icon container */}
              <div
                className={`
                  flex h-10 w-10 shrink-0 items-center justify-center rounded-lg
                  transition-all duration-200 ease-out
                  group-hover:scale-105 group-hover:rotate-1
                  ${styles.iconBg}
                `}
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
