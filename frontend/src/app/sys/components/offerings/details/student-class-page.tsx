import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ChevronLeft, ChevronRight, Search, UserPlus } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
} from "@/features/sys/student-class.service";
import { getStudentClassColumns } from "./student-class-columns.tsx";
import { CourseOfferingStudentEnrollDialog } from "./student-class-create.tsx";

export const CourseOfferingStudentsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const courseOfferingId = Number(id);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  const [droppingStudent, setDroppingStudent] = useState<StudentClassWithDetails | null>(null);

  const {
    data: studentsResponse,
    isPending: isStudentsPending,
    isError: isStudentsError,
    error: studentsError,
  } = useCourseOfferingStudents(courseOfferingId, {
    search: search.trim() || undefined,
    page,
  });

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

  const columns = getStudentClassColumns({
    onDrop: (student) => setDroppingStudent(student),
    isDropping: dropMutation.isPending,
  });

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="w-fit -ml-2 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <ChevronLeft className="mr-1 size-4" />
            Back to Course Offerings
          </Button>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Course Offering Roster</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage the student list, drop enrollments, and manually enroll irregular students.
            </p>
          </div>
        </div>

        {/* ── Table Section ───────────────────────────────────────────────── */}
        <Card className="overflow-hidden rounded-xl shadow-xs gap-0 pb-0">
          <CardHeader className="flex items-center justify-between border-b px-6 flex-col gap-2.5 sm:flex-row sm:items-center">
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-8 h-8 rounded-lg text-xs"
                />
              </div>
            </div>

            <Button
              size="sm"
              className="h-8 rounded-lg text-xs font-medium w-full sm:w-auto cursor-pointer"
              onClick={() => setIsEnrollOpen(true)}
            >
              <UserPlus className="mr-1.5 size-3.5" /> Enroll Student
            </Button>
          </CardHeader>

          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={studentsResponse?.data ?? []}
              getRowId={(row) => row.id}
              isLoading={isStudentsPending}
              isError={isStudentsError}
              error={studentsError}
              emptyMessage="No students currently enrolled in this course offering."
            />
          </CardContent>
        </Card>
      </div>

      {/* ── Pagination Footer ─────────────────────────────────────────────── */}
      <div className="shrink-0 border-t bg-card px-6 py-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {studentsResponse?.pagination
              ? `Page ${studentsResponse.pagination.currentPage} of ${studentsResponse.pagination.totalPage}`
              : "Loading page info..."}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 rounded-lg p-0 cursor-pointer"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!studentsResponse?.pagination?.hasPrev || isStudentsPending}
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-medium text-primary">
              {studentsResponse?.pagination?.currentPage ?? 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 rounded-lg p-0 cursor-pointer"
              onClick={() => setPage((p) => p + 1)}
              disabled={!studentsResponse?.pagination?.hasNext || isStudentsPending}
            >
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Dialogs & Modals */}
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Drop Student Enrollment?</AlertDialogTitle>
            <AlertDialogDescription>
              {droppingStudent && (
                <>
                  Are you sure you want to drop <strong>{droppingStudent.student_name}</strong> from
                  this course offering? This will remove their record from the class roster.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={dropMutation.isPending} className="cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDrop}
              disabled={dropMutation.isPending}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground cursor-pointer"
            >
              {dropMutation.isPending ? "Dropping..." : "Yes, drop student"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
