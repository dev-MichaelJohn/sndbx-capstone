import { Link } from "react-router";
import { Users, Landmark, Calendar, FileBarChart2, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const CommandShortcutGrid = () => {
  const actions = [
    {
      title: "User Accounts",
      desc: "Manage system accounts and roles",
      href: "/sys/users",
      icon: Users,
      accent: "text-blue-500 bg-blue-500/10",
    },
    {
      title: "Institutional Setup",
      desc: "Colleges and degree programs",
      href: "/sys/institution",
      icon: Landmark,
      accent: "text-emerald-500 bg-emerald-500/10",
    },
    {
      title: "Academic Semesters",
      desc: "School years and term schedules",
      href: "/sys/semesters",
      icon: Calendar,
      accent: "text-amber-500 bg-amber-500/10",
    },
    {
      title: "Analytics & Reports",
      desc: "Institutional evaluation insights",
      href: "/sys/evaluation/analytics",
      icon: FileBarChart2,
      accent: "text-indigo-500 bg-indigo-500/10",
    },
  ];

  return (
    <Card className="rounded-xl border bg-card shadow-sm">
      <CardHeader className="pb-3.5 border-b px-5 py-4">
        <CardTitle className="text-sm font-semibold text-foreground">
          Quick Command Shortcuts
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <Link
              key={act.title}
              to={act.href}
              className="flex items-center justify-between p-3.5 rounded-lg border border-border/60 bg-card hover:bg-accent/50 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-200 group"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  className={`flex size-9 items-center justify-center rounded-lg shrink-0 ${act.accent} group-hover:scale-105 transition-transform`}
                >
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                    {act.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate leading-relaxed">{act.desc}</p>
                </div>
              </div>
              <ArrowRight className="size-3.5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
};
