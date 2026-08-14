import { useState, useMemo } from "react";
import { BookOpen, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { DataTable, type DataTableColumn } from "@/components/main-data-table";
import { useUser } from "@/features/auth/context/user.context";
import { useFacultyOfferings } from "../api/faculty.service";
import { useCourseOfferingStudents } from "@/features/student-class/api/student-class.service";
import type { CourseOfferingWithDetails } from "backend/types/offerings.type";
import type { StudentClassWithDetails } from "backend/types/student-class.type";

const StudentRosterModal = ({
  offering,
  onClose,
}: {
  offering: CourseOfferingWithDetails | null;
  onClose: () => void;
}) => {
  const [page, setPage] = useState(1);
  const isOpen = Boolean(offering);

  const { data: studentsRes, isLoading } = useCourseOfferingStudents(
    offering?.id ?? 0,
    { page },
    { enabled: isOpen },
  );

  const students = studentsRes?.data ?? [];
  const pagination = studentsRes?.pagination;

  const rosterColumns: Array<DataTableColumn<StudentClassWithDetails>> = [
    {
      header: "Institutional ID",
      cell: (row) => (
        <span className="font-mono text-xs font-semibold text-foreground">
          {row.institutional_id || "N/A"}
        </span>
      ),
    },
    {
      header: "Student Name",
      cell: (row) => (
        <span className="text-xs font-semibold text-foreground">{row.student_name}</span>
      ),
    },
    {
      header: "Home Section",
      cell: (row) => (
        <span className="text-xs text-muted-foreground">
          {row.program_name} Year {row.class_year_level}-{row.class_section}
        </span>
      ),
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Enrolled Students — {offering?.course_initialism}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {offering?.course_name} • Year {offering?.year_level} ({offering?.semester_term} Term)
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-hidden rounded-xl border bg-card">
          <DataTable
            columns={rosterColumns}
            data={students}
            getRowId={(row) => row.id}
            isLoading={isLoading}
            isError={false}
            error={null}
            emptyMessage="No students currently enrolled in this course offering."
          />

          <div className="flex items-center justify-between border-t px-4 py-2.5 text-xs text-muted-foreground">
            <span>
              {pagination ? `Page ${pagination.currentPage} of ${pagination.totalPage}` : "1 of 1"}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 rounded-md"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!pagination?.hasPrev || isLoading}
              >
                <ChevronLeft className="size-3" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 rounded-md"
                onClick={() => setPage((p) => p + 1)}
                disabled={!pagination?.hasNext || isLoading}
              >
                <ChevronRight className="size-3" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const FacultyClassesPage = () => {
  const { user } = useUser();
  const [selectedOffering, setSelectedOffering] = useState<CourseOfferingWithDetails | null>(null);

  const { data: offeringsRes, isLoading, isError, error } = useFacultyOfferings(user?.id);
  const myOfferings = offeringsRes?.data ?? [];

  const columns: Array<DataTableColumn<CourseOfferingWithDetails>> = useMemo(
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
        header: "Year & Term",
        cell: (row) => (
          <Badge variant="outline" className="font-mono text-[10px]">
            Year {row.year_level} • {row.semester_term} Term
          </Badge>
        ),
      },
      {
        header: "Class Roster",
        className: "text-right",
        cell: (row) => (
          <div className="text-right">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedOffering(row)}
              className="h-7 text-xs gap-1.5 cursor-pointer"
            >
              <Users className="size-3.5 text-primary" /> View Enrolled Students
            </Button>
          </div>
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
            My Teaching Classes
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Overview of assigned course offerings and enrolled student class rosters.
          </p>
        </div>

        <Card className="rounded-xl border bg-card shadow-xs overflow-hidden">
          <CardHeader className="border-b pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="size-4 text-primary" />
              <CardTitle className="text-base font-semibold">Assigned Teaching Workload</CardTitle>
            </div>
            <CardDescription className="text-xs">
              {myOfferings.length} active course offering(s)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={myOfferings}
              getRowId={(row) => row.id}
              isLoading={isLoading}
              isError={isError}
              error={error}
              emptyMessage="No teaching course offerings assigned to your account."
            />
          </CardContent>
        </Card>
      </div>

      <StudentRosterModal offering={selectedOffering} onClose={() => setSelectedOffering(null)} />
    </div>
  );
};

export default FacultyClassesPage;
