import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { ChevronLeft, Search, UserPlus } from "lucide-react";
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
import { ViewSwitcher, type ViewMode } from "@/components/ui/view-switcher";
import { TablePagination } from "@/components/table-pagination";

import type { StudentClassWithDetails } from "backend/types/student-class.type";
import {
  useCourseOfferingStudents,
  useDropStudentFromOffering,
} from "../api/student-class.service";
import { useClassStudents } from "@/features/class-student/api/class-student.service";
import { useSemesters } from "@/features/semester/api/semester.service";
import { useCourseOffering } from "@/features/offerings/api/offerings.service";
import { getStudentClassColumns } from "../components/StudentClassColumns";
import { StudentClassCard } from "../components/StudentClassCard";
import { CourseOfferingStudentEnrollDialog } from "../components/StudentClassCreate";
import { CourseOfferingRosterCards } from "../components/StudentClassCards";

export const CourseOfferingStudentsPage = () => {
  const navigate = useNavigate();
  const { classId, id } = useParams<{ classId?: string; id?: string }>();
  const courseOfferingId = Number(id);
  const currentClassId = Number(classId);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  const [droppingStudent, setDroppingStudent] = useState<StudentClassWithDetails | null>(null);

  const { data: offeringData } = useCourseOffering(courseOfferingId);

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
            className="size-8 shrink-0 cursor-pointer rounded-lg border-border/60 hover:bg-muted text-foreground active:scale-[0.96]"
            title="Back"
          >
            <ChevronLeft className="size-4" />
          </Button>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Course Offering Roster
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Manage course enrollments, drop records, and enroll irregular students.
            </p>
          </div>
        </div>

        {/* KPI Roster Cards */}
        <CourseOfferingRosterCards
          totalEnrolled={totalEnrolled}
          regularEnrolled={regularEnrolled}
          crossEnrolled={crossEnrolled}
          isLoading={isOfferingStudentsPending || isOfficialClassPending}
        />

        {/* Controls Toolbar */}
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search enrolled students..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="h-8.5 rounded-xl pl-8 text-xs bg-card border-border/70"
              />
            </div>

            <div className="flex items-center gap-2">
              {isCurrentActiveSemester ? (
                <Button
                  size="sm"
                  className="h-8.5 cursor-pointer rounded-xl px-3.5 text-xs font-bold gap-1.5 active:scale-[0.96]"
                  onClick={() => setIsEnrollOpen(true)}
                >
                  <UserPlus className="size-3.5" />
                  <span>Enroll Student</span>
                </Button>
              ) : (
                <Badge
                  variant="outline"
                  className="text-xs italic text-muted-foreground py-1 border-border/60"
                >
                  Archived Term Roster (Read Only)
                </Badge>
              )}

              <ViewSwitcher mode={viewMode} onChange={setViewMode} />
            </div>
          </div>

          {/* Grid vs Table View */}
          {viewMode === "grid" ? (
            isOfferingStudentsPending ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-44 rounded-2xl border border-border/50 bg-card/60 animate-pulse"
                  />
                ))}
              </div>
            ) : enrolledList.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-card p-6 text-center text-xs text-muted-foreground">
                No students currently enrolled in this course offering.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {enrolledList.map((student) => (
                  <StudentClassCard
                    key={student.id}
                    student={student}
                    isRegular={officialStudentAccountIds.has(student.student_account_id)}
                    onDrop={(item) => setDroppingStudent(item)}
                    isCurrentActiveSemester={isCurrentActiveSemester}
                    disabled={dropMutation.isPending}
                  />
                ))}
              </div>
            )
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xs">
              <DataTable
                columns={columns}
                data={enrolledList}
                getRowId={(row) => row.id}
                isLoading={isOfferingStudentsPending}
                isError={isStudentsError}
                error={studentsError}
                emptyMessage="No students currently enrolled in this course offering."
              />
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      <TablePagination
        pagination={offeringStudentsResponse?.pagination}
        isPending={isOfferingStudentsPending}
        onPageChange={setPage}
      />

      {/* Enrollment Dialog */}
      <CourseOfferingStudentEnrollDialog
        open={isEnrollOpen}
        onOpenChange={setIsEnrollOpen}
        courseOfferingId={courseOfferingId}
      />

      {/* Drop Alert Modal */}
      <AlertDialog
        open={!!droppingStudent}
        onOpenChange={(open) => !open && setDroppingStudent(null)}
      >
        <AlertDialogContent className="rounded-2xl border border-border/80 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold">
              Drop Student Enrollment?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              {droppingStudent && (
                <>
                  Are you sure you want to drop{" "}
                  <strong className="text-foreground">{droppingStudent.student_name}</strong> from
                  this course offering?
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
              className="h-8 rounded-lg bg-destructive text-xs font-bold text-destructive-foreground hover:bg-destructive/90 active:scale-[0.96]"
            >
              {dropMutation.isPending ? "Dropping..." : "Yes, drop student"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
