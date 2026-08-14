import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { ChevronLeft, ChevronRight, Search, UserPlus } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DataTable } from "@/components/main-data-table";

import type { StudentClassWithDetails } from "backend/types/student-class.type";
import {
  useCourseOfferingStudents,
  useDropStudentFromOffering,
} from "../api/student-class.service";
import { useClassStudents } from "@/features/class-student/api/class-student.service";
import { useSemesters } from "@/features/semester/api/semester.service";
import { useCourseOffering } from "@/features/offerings/api/offerings.service";
import { getStudentClassColumns } from "../components/StudentClassColumns";
import { CourseOfferingStudentEnrollDialog } from "../components/StudentClassCreate";
import { CourseOfferingRosterCards } from "../components/StudentClassCards";

export const CourseOfferingStudentsPage = () => {
  const navigate = useNavigate();
  const { classId, id } = useParams<{ classId?: string; id?: string }>();
  const courseOfferingId = Number(id);
  const currentClassId = Number(classId);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  const [droppingStudent, setDroppingStudent] = useState<StudentClassWithDetails | null>(null);

  // Fetch course offering details to get its exact semester_id
  const { data: offeringData } = useCourseOffering(courseOfferingId);

  // Fetch active semester to verify if this offering belongs to current active term
  const { data: semesterResponse } = useSemesters({
    search: undefined,
    page: 1,
    orderBy: "id",
    orderDir: "desc",
  });
  const activeSemesterId = semesterResponse?.data?.[0]?.id;

  const isCurrentActiveSemester = Boolean(
    offeringData?.semester_id && activeSemesterId && offeringData.semester_id === activeSemesterId,
  );

  // Fetch enrolled students for this course offering
  const {
    data: offeringStudentsResponse,
    isPending: isOfferingStudentsPending,
    isError: isStudentsError,
    error: studentsError,
  } = useCourseOfferingStudents(courseOfferingId, {
    search: search.trim() || undefined,
    page,
  });

  const enrolledList = offeringStudentsResponse?.data ?? [];

  // Fetch official class section roster to cross-reference section members
  const { data: officialClassResponse, isPending: isOfficialClassPending } = useClassStudents(
    { class_id: currentClassId },
    { enabled: !!currentClassId },
  );

  const dropMutation = useDropStudentFromOffering();

  const handleConfirmDrop = async () => {
    if (!droppingStudent) return;
    try {
      await dropMutation.mutateAsync(droppingStudent.id);
      toast.success("Student successfully dropped from course offering.");
      setDroppingStudent(null);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const officialStudentAccountIds = useMemo(() => {
    if (!officialClassResponse?.data) return new Set<number>();
    return new Set(officialClassResponse.data.map((s) => s.student_account_id));
  }, [officialClassResponse]);

  const columns = useMemo(
    () =>
      getStudentClassColumns({
        onDrop: (student) => setDroppingStudent(student),
        isDropping: dropMutation.isPending || !isCurrentActiveSemester,
        officialStudentAccountIds,
        isCurrentActiveSemester,
      }),
    [dropMutation.isPending, isCurrentActiveSemester, officialStudentAccountIds],
  );

  const totalEnrolled = offeringStudentsResponse?.pagination?.totalItems ?? enrolledList.length;

  const regularEnrolled = useMemo(() => {
    if (!enrolledList.length) return 0;
    return enrolledList.filter((student) => {
      if ("class_id" in student && student.class_id) {
        return student.class_id === currentClassId;
      }
      return officialStudentAccountIds.has(student.student_account_id);
    }).length;
  }, [enrolledList, currentClassId, officialStudentAccountIds]);

  const crossEnrolled = useMemo(() => {
    return Math.max(0, totalEnrolled - regularEnrolled);
  }, [totalEnrolled, regularEnrolled]);

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
        {/* Header Navigation */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
            className="size-9 shrink-0 cursor-pointer rounded-lg border-border/60 hover:bg-muted/80 hover:text-foreground"
            title="Back"
          >
            <ChevronLeft className="size-4" />
          </Button>

          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Course Offering Roster
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Manage course enrollments, drop records, and enroll irregular students.
            </p>
          </div>
        </div>

        {/* Roster KPI Summary Cards */}
        <CourseOfferingRosterCards
          totalEnrolled={totalEnrolled}
          regularEnrolled={regularEnrolled}
          crossEnrolled={crossEnrolled}
          isLoading={isOfferingStudentsPending || isOfficialClassPending}
        />

        {/* Data Table Shell */}
        <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
          <div className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="h-8 rounded-lg pl-8 text-xs"
              />
            </div>

            {/* Only allow enrolling irregular students in active semester */}
            {isCurrentActiveSemester ? (
              <Button
                size="sm"
                className="h-8 cursor-pointer rounded-lg px-3 text-xs font-medium"
                onClick={() => setIsEnrollOpen(true)}
              >
                <UserPlus className="mr-1.5 size-3.5" /> Enroll Student
              </Button>
            ) : (
              <Badge
                variant="outline"
                className="text-xs italic text-muted-foreground py-1 border-border/60"
              >
                Archived Term Roster (Read Only)
              </Badge>
            )}
          </div>

          <DataTable
            columns={columns}
            data={enrolledList}
            getRowId={(row) => row.id}
            isLoading={isOfferingStudentsPending}
            isError={isStudentsError}
            error={studentsError}
            emptyMessage="No students currently enrolled in this course offering."
          />

          {/* Footer Pagination */}
          <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-muted-foreground">
            <span>
              {offeringStudentsResponse?.pagination
                ? `Page ${offeringStudentsResponse.pagination.currentPage} of ${offeringStudentsResponse.pagination.totalPage}`
                : "Loading page info..."}
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 rounded-lg"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={
                  !offeringStudentsResponse?.pagination?.hasPrev || isOfferingStudentsPending
                }
              >
                <ChevronLeft className="size-3.5" />
              </Button>
              <span className="flex h-7 min-w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-medium text-primary">
                {offeringStudentsResponse?.pagination?.currentPage ?? 1}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 rounded-lg"
                onClick={() => setPage((p) => p + 1)}
                disabled={
                  !offeringStudentsResponse?.pagination?.hasNext || isOfferingStudentsPending
                }
              >
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Enrollment Dialog */}
      <CourseOfferingStudentEnrollDialog
        open={isEnrollOpen}
        onOpenChange={setIsEnrollOpen}
        courseOfferingId={courseOfferingId}
      />

      {/* Drop Confirmation Alert */}
      <AlertDialog
        open={!!droppingStudent}
        onOpenChange={(open) => !open && setDroppingStudent(null)}
      >
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold">
              Drop Student Enrollment?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              {droppingStudent && (
                <>
                  Are you sure you want to drop{" "}
                  <strong className="text-foreground">{droppingStudent.student_name}</strong> from
                  this course offering? This will remove their record from the class roster.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={dropMutation.isPending} className="h-8 rounded-lg text-xs">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDrop}
              disabled={dropMutation.isPending}
              className="h-8 rounded-lg bg-destructive text-xs text-destructive-foreground hover:bg-destructive/90"
            >
              {dropMutation.isPending ? "Dropping..." : "Yes, drop student"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
