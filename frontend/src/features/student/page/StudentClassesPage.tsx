import { useMemo } from "react";
import { BookOpen, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/main-data-table";
import { useUser } from "@/features/auth/context/user.context";
import { useMyEnrolledClasses } from "../api/student.service";
import type { StudentClassWithDetails } from "backend/types/student-class.type";

/**
 * Enrolled Subjects page displaying the student's complete academic course roster.
 */
export const StudentClassesPage = () => {
  const { user } = useUser();
  const { data: classesRes, isLoading, isError, error } = useMyEnrolledClasses(user?.id);
  const enrolledClasses = classesRes?.data ?? [];

  const columns: Array<DataTableColumn<StudentClassWithDetails>> = useMemo(
    () => [
      {
        header: "Course Code",
        cell: (row) => (
          <span className="font-mono text-xs font-bold text-primary">{row.course_initialism}</span>
        ),
      },
      {
        header: "Course Title",
        cell: (row) => (
          <span className="text-xs font-semibold text-foreground">{row.course_name}</span>
        ),
      },
      {
        header: "Instructor",
        cell: (row) => (
          <div className="flex items-center gap-1.5 text-xs">
            <User className="size-3.5 text-muted-foreground" />
            <span className="font-medium text-foreground">
              {row.faculty_name ?? "Assigned Instructor"}
            </span>
          </div>
        ),
      },
      {
        header: "Year & Section",
        cell: (row) => (
          <Badge variant="outline" className="font-mono text-[10px]">
            Year {row.class_year_level} - {row.class_section}
          </Badge>
        ),
      },
      {
        header: "Term",
        cell: (row) => (
          <span className="text-xs text-muted-foreground">{row.semester_term} Semester</span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            My Enrolled Classes
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Overview of your current academic course load and assigned subject instructors.
          </p>
        </div>

        <Card className="rounded-xl border bg-card shadow-xs overflow-hidden">
          <CardHeader className="border-b pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="size-4 text-primary" />
              <CardTitle className="text-base font-semibold">Course Roster</CardTitle>
            </div>
            <CardDescription className="text-xs">
              {enrolledClasses.length} registered subject(s) for the current active semester
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={enrolledClasses}
              getRowId={(row) => row.id}
              isLoading={isLoading}
              isError={isError}
              error={error}
              emptyMessage="No enrolled classes found for your account."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentClassesPage;
