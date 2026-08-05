import { Users, UserCheck, ArrowLeftRight } from "lucide-react";
import { Card } from "@/components/ui/card";

interface CourseOfferingRosterCardsProps {
  totalEnrolled: number;
  regularEnrolled: number;
  crossEnrolled: number;
  isLoading?: boolean;
}

const stats = [
  {
    title: "Total Enrolled",
    key: "totalEnrolled",
    icon: Users,
    accent: "primary",
    helper: "Course offering roster size",
  },
  {
    title: "Section Members",
    key: "regularEnrolled",
    icon: UserCheck,
    accent: "emerald",
    helper: "Enrolled from primary class",
  },
  {
    title: "Cross-Enrolled",
    key: "crossEnrolled",
    icon: ArrowLeftRight,
    accent: "amber",
    helper: "Irregular / outside sections",
  },
];

const accentStyles = {
  primary: {
    bar: "bg-primary",
    iconBg: "bg-primary/10 text-primary",
    shadow: "hover:shadow-primary/20",
    border: "hover:border-primary/40",
    text: "text-foreground",
  },
  emerald: {
    bar: "bg-emerald-500",
    iconBg: "bg-emerald-500/10 text-emerald-500",
    shadow: "hover:shadow-emerald-500/20",
    border: "hover:border-emerald-500/40",
    text: "text-emerald-500",
  },
  amber: {
    bar: "bg-amber-500",
    iconBg: "bg-amber-500/10 text-amber-500",
    shadow: "hover:shadow-amber-500/20",
    border: "hover:border-amber-500/40",
    text: "text-amber-500",
  },
} as const;

export const CourseOfferingRosterCards = ({
  totalEnrolled,
  regularEnrolled,
  crossEnrolled,
  isLoading = false,
}: CourseOfferingRosterCardsProps) => {
  const values = { totalEnrolled, regularEnrolled, crossEnrolled };

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {stats.map((item) => {
        const Icon = item.icon;
        const styles = accentStyles[item.accent as keyof typeof accentStyles];
        const value = values[item.key as keyof typeof values];

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
                <h2 className={`text-2xl font-semibold tracking-tight ${styles.text}`}>
                  {isLoading ? "—" : value}
                </h2>
                <p className="text-[10px] text-muted-foreground/50">{item.helper}</p>
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
