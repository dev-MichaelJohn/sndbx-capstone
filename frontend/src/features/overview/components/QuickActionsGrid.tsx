import { Link } from "react-router";
import { Users, Landmark, Calendar, FileBarChart2, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function QuickActionsGrid() {
  const actions = [
    {
      title: "User Accounts",
      desc: "Manage system access and roles",
      href: "/sys/users",
      icon: Users,
    },
    {
      title: "Institutional Setup",
      desc: "Colleges and degree programs",
      href: "/sys/institution",
      icon: Landmark,
    },
    {
      title: "Academic Semesters",
      desc: "Terms and date boundaries",
      href: "/sys/semesters",
      icon: Calendar,
    },
    {
      title: "Analytics & Reports",
      desc: "Institutional evaluation insights",
      href: "/sys/evaluation/analytics",
      icon: FileBarChart2,
    },
  ];

  return (
    <Card className="rounded-xl border bg-card shadow-sm">
      <CardHeader className="pb-3.5 border-b px-5 py-4">
        <CardTitle className="text-sm font-semibold tracking-tight">
          Quick Management Shortcuts
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
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                    {act.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate leading-relaxed">{act.desc}</p>
                </div>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
