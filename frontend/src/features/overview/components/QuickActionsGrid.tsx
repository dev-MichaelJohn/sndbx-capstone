import { Link } from "react-router";
import { Users, Landmark, Calendar, FileBarChart2, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function QuickActionsGrid() {
  const actions = [
    { title: "Manage Users", desc: "Accounts & Roles", href: "/sys/users", icon: Users },
    {
      title: "Colleges & Programs",
      desc: "Academic Structure",
      href: "/sys/institution",
      icon: Landmark,
    },
    {
      title: "Academic Semesters",
      desc: "Terms & Schedules",
      href: "/sys/semesters",
      icon: Calendar,
    },
    {
      title: "Analytics & Reports",
      desc: "Performance Reports",
      href: "/sys/evaluation/analytics",
      icon: FileBarChart2,
    },
  ];

  return (
    <Card className="rounded-xl border shadow-xs bg-card">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-base font-semibold">Quick Administrative Actions</CardTitle>
      </CardHeader>
      <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <Link
              key={act.title}
              to={act.href}
              className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 hover:bg-muted/50 hover:border-primary/30 transition-all duration-150 group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                    {act.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{act.desc}</p>
                </div>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
