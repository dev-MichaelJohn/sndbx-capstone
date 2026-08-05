import { Users, GraduationCap, UserCheck, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";

interface UserStatsCardsProps {
  total: number;
  students: number;
  faculty: number;
  supervisors: number;
}

const stats = [
  {
    title: "Total Accounts",
    value: (props: UserStatsCardsProps) => props.total,
    icon: Users,
    accent: "violet",
  },
  {
    title: "Students",
    value: (props: UserStatsCardsProps) => props.students,
    icon: GraduationCap,
    accent: "emerald",
  },
  {
    title: "Faculty Members",
    value: (props: UserStatsCardsProps) => props.faculty,
    icon: UserCheck,
    accent: "sky",
  },
  {
    title: "Supervisors",
    value: (props: UserStatsCardsProps) => props.supervisors,
    icon: ShieldCheck,
    accent: "indigo",
  },
];

const accentStyles = {
  violet: {
    bar: "bg-violet-500",
    iconBg: "bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400",
    shadow: "hover:shadow-violet-500/20",
    border: "hover:border-violet-300 dark:hover:border-violet-500/50",
  },
  emerald: {
    bar: "bg-emerald-500",
    iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
    shadow: "hover:shadow-emerald-500/20",
    border: "hover:border-emerald-300 dark:hover:border-emerald-500/50",
  },
  sky: {
    bar: "bg-sky-500",
    iconBg: "bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400",
    shadow: "hover:shadow-sky-500/20",
    border: "hover:border-sky-300 dark:hover:border-sky-500/50",
  },
  indigo: {
    bar: "bg-indigo-500",
    iconBg: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400",
    shadow: "hover:shadow-indigo-500/20",
    border: "hover:border-indigo-300 dark:hover:border-indigo-500/50",
  },
} as const;

export const UserStatsCards = (props: UserStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
                <p className="text-[10px] text-muted-foreground/50">Registered users</p>
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
