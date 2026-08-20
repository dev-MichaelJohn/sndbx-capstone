import { useQuery } from "@tanstack/react-query";
import { Users, Landmark, GraduationCap, Calendar } from "lucide-react";
import { parseISO, isWithinInterval } from "date-fns";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUsers } from "@/features/user/api/user.service";
import { getColleges } from "@/features/college/api/college.service";
import { getPrograms } from "@/features/program/api/program.service";
import { useSemesters } from "@/features/semester/api/semester.service";

export function SystemOverviewStats() {
  const { data: usersRes } = useUsers({ page: 1 });
  const { data: collegeRes } = useQuery({
    queryKey: ["getColleges", 1, ""],
    queryFn: () => getColleges({ page: 1, search: "" }),
  });
  const { data: programRes } = useQuery({
    queryKey: ["getPrograms", ""],
    queryFn: () => getPrograms(""),
  });
  const { data: semesterRes } = useSemesters({
    page: 1,
    search: undefined,
    orderBy: "id",
    orderDir: "desc",
  });

  // Compute metrics
  const totalUsers = usersRes?.pagination?.totalItems ?? usersRes?.data?.length ?? 0;
  const facultyCount = usersRes?.data?.filter((u) => u.roles.includes("FACULTY")).length ?? 0;
  const studentCount = usersRes?.data?.filter((u) => u.roles.includes("STUDENT")).length ?? 0;

  const colleges = collegeRes?.data ?? [];
  const totalColleges = collegeRes?.pagination?.totalItems ?? colleges.length;
  const assignedDeans = colleges.filter((c) => c.account_id).length;
  const deanCoverage = totalColleges > 0 ? Math.round((assignedDeans / totalColleges) * 100) : 0;

  const programs = programRes?.data ?? [];
  const totalPrograms = programRes?.pagination?.totalItems ?? programs.length;
  const assignedChairs = programs.filter((p) => p.account_id).length;
  const chairCoverage = totalPrograms > 0 ? Math.round((assignedChairs / totalPrograms) * 100) : 0;

  // Active semester check
  const today = new Date();
  const semesters = semesterRes?.data ?? [];
  const activeSemester =
    semesters.find((s) => {
      try {
        return isWithinInterval(today, {
          start: parseISO(s.start_date),
          end: parseISO(s.end_date),
        });
      } catch {
        return false;
      }
    }) ?? semesters[0];

  const cards = [
    {
      label: "Total Accounts",
      value: totalUsers,
      subtext: `${facultyCount} Faculty • ${studentCount} Students`,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Colleges & Deans",
      value: `${totalColleges} Colleges`,
      subtext: `${deanCoverage}% Dean Leadership Ratio`,
      icon: Landmark,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Academic Programs",
      value: `${totalPrograms} Programs`,
      subtext: `${chairCoverage}% Chair Assigned Ratio`,
      icon: GraduationCap,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
    },
    {
      label: "Active Term",
      value: activeSemester
        ? `SY ${activeSemester.school_year_start}–${Number(activeSemester.school_year_start) + 1}`
        : "N/A",
      subtext: activeSemester ? `${activeSemester.semester_term} Semester` : "No active term",
      icon: Calendar,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      badge: activeSemester ? "ACTIVE" : "INACTIVE",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label} className="rounded-xl border bg-card shadow-sm">
            <CardContent className="p-5 flex items-center justify-between gap-4">
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground truncate">
                    {item.label}
                  </p>
                  {item.badge && (
                    <Badge
                      variant="outline"
                      className="px-1.5 py-0.5 text-[9px] font-mono border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-2xl font-bold tracking-tight text-foreground leading-none">{item.value}</p>
                <p className="text-xs text-muted-foreground truncate leading-relaxed">{item.subtext}</p>
              </div>
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${item.bg}`}
              >
                <Icon className={`h-5 w-5 ${item.color}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
