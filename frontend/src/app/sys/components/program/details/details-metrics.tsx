import { BookOpen, GraduationCap, Layers, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProgramMetricsProps {
  totalCourses: number;
  totalClasses: number;
  totalFaculty: number;
  totalStudents: number;
}

export const ProgramMetrics = ({
  totalCourses,
  totalClasses,
  totalFaculty,
  totalStudents,
}: ProgramMetricsProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="rounded-xl shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">Total Courses</CardTitle>
          <BookOpen className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCourses}</div>
        </CardContent>
      </Card>

      <Card className="rounded-xl shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Active Classes
          </CardTitle>
          <Layers className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalClasses}</div>
        </CardContent>
      </Card>

      <Card className="rounded-xl shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Assigned Faculty
          </CardTitle>
          <Users className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalFaculty}</div>
        </CardContent>
      </Card>

      <Card className="rounded-xl shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Enrolled Students
          </CardTitle>
          <GraduationCap className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalStudents}</div>
        </CardContent>
      </Card>
    </div>
  );
};
