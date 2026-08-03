import { BookOpen, GraduationCap, Users } from "lucide-react";

interface ClassMetricsProps {
  totalOfferings: number;
  totalStudents: number;
  totalFaculty?: number;
}

export const ClassMetrics = ({
  totalOfferings,
  totalStudents,
  totalFaculty = 0,
}: ClassMetricsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
      {/* Course Offerings Metric */}
      <div className="rounded-xl border border-border/60 bg-card p-4 shadow-xs">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-medium">Course Offerings</span>
          <BookOpen className="size-4" />
        </div>
        <div className="mt-3 text-2xl font-bold tracking-tight">{totalOfferings}</div>
      </div>

      {/* Assigned Faculty Metric */}
      <div className="rounded-xl border border-border/60 bg-card p-4 shadow-xs">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-medium">Assigned Faculty</span>
          <Users className="size-4" />
        </div>
        <div className="mt-3 text-2xl font-bold tracking-tight">{totalFaculty}</div>
      </div>

      {/* Enrolled Students Metric */}
      <div className="rounded-xl border border-border/60 bg-card p-4 shadow-xs">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-medium">Enrolled Students</span>
          <GraduationCap className="size-4" />
        </div>
        <div className="mt-3 text-2xl font-bold tracking-tight">{totalStudents}</div>
      </div>
    </div>
  );
};
