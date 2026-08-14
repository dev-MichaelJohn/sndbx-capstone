import { useState, useEffect, useMemo } from "react";
import { BookOpen, User, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, type DataTableColumn } from "@/components/main-data-table";

import { useUser } from "@/features/auth/context/user.context";
import { useMyEnrolledClasses } from "../api/student.service";
import { useSemesters } from "@/features/semester/api/semester.service";
import type { StudentClassWithDetails } from "backend/types/student-class.type";

export const StudentClassesPage = () => {
  const { user } = useUser();
  const [selectedSemesterId, setSelectedSemesterId] = useState<number | undefined>(undefined);

  // Fetch all academic terms
  const { data: semesterResponse, isLoading: isLoadingSemesters } = useSemesters({
    search: undefined,
    page: 1,
    orderBy: "id",
    orderDir: "desc",
  });

  const semesters = semesterResponse?.data ?? [];

  // Default to the latest semester once terms load
  useEffect(() => {
    if (semesters.length > 0 && selectedSemesterId === undefined) {
      setSelectedSemesterId(semesters[0].id);
    }
  }, [semesters, selectedSemesterId]);

  // Query student enrolled courses for selectedSemesterId
  const {
    data: classesRes,
    isLoading: isLoadingClasses,
    isError,
    error,
  } = useMyEnrolledClasses(user?.id, selectedSemesterId, {
    enabled: Boolean(user?.id),
  });

  const enrolledClasses = classesRes?.data ?? [];

  const handleSemesterChange = (valueStr: string) => {
    const newSemId = Number(valueStr);
    if (!isNaN(newSemId)) {
      setSelectedSemesterId(newSemId);
    }
  };

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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              My Enrolled Classes
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Overview of your registered course load and subject instructors per academic term.
            </p>
          </div>

          {/* Academic Term Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <Calendar className="size-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Term:</span>
            <Select
              value={selectedSemesterId ? String(selectedSemesterId) : ""}
              onValueChange={handleSemesterChange}
              disabled={isLoadingSemesters}
            >
              <SelectTrigger className="h-8 w-56 text-xs rounded-lg bg-card">
                <SelectValue
                  placeholder={isLoadingSemesters ? "Loading terms..." : "Select Semester"}
                />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {semesters.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)} className="text-xs">
                    A.Y. {s.school_year_start}–{s.school_year_end} ({s.semester_term} Term)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="rounded-xl border bg-card shadow-xs overflow-hidden">
          <CardHeader className="border-b pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="size-4 text-primary" />
              <CardTitle className="text-base font-semibold">Registered Course Load</CardTitle>
            </div>
            <CardDescription className="text-xs">
              {enrolledClasses.length} registered subject(s) for the selected term
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={enrolledClasses}
              getRowId={(row) => row.id}
              isLoading={isLoadingClasses || isLoadingSemesters}
              isError={isError}
              error={error}
              emptyMessage="No enrolled classes found for the selected academic term."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentClassesPage;
