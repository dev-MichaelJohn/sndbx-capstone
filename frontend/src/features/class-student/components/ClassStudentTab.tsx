import { useState } from "react";
import { ChevronLeft, ChevronRight, Search, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
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

import { useClassStudents, useDropStudent } from "../api/class-student.service";
import { useSemesters } from "@/features/semester/api/semester.service";
import { getClassStudentColumns } from "./ClassStudentColumns";
import { ClassStudentEnrollDialog } from "./EnrollStudent";
import toast from "react-hot-toast";

interface ClassStudentsTabProps {
  classId: number;
  semesterId?: number;
}

interface DropTarget {
  id: number;
  studentName: string;
}

export const ClassStudentsTab = ({ classId, semesterId }: ClassStudentsTabProps) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);

  // Check if viewed semester matches the active/current semester
  const { data: semesterResponse } = useSemesters({
    search: undefined,
    page: 1,
    orderBy: "id",
    orderDir: "desc",
  });
  const semesters = semesterResponse?.data ?? [];
  const activeSemesterId = semesters[0]?.id;

  const isCurrentActiveSemester = !semesterId || semesterId === activeSemesterId;

  const {
    data: studentsResponse,
    isPending: isStudentsPending,
    isError: isStudentsError,
    error: studentsError,
  } = useClassStudents({
    class_id: classId,
    semester_id: semesterId,
    search: search.trim() || undefined,
    page,
  });

  const dropMutation = useDropStudent();

  const handleConfirmDrop = async () => {
    if (!dropTarget) return;
    try {
      await dropMutation.mutateAsync(dropTarget.id);
      toast.success("Student dropped from class successfully.");
      setDropTarget(null);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const columns = getClassStudentColumns({
    onDrop: (id, studentName) => setDropTarget({ id, studentName }),
    isDropping: dropMutation.isPending || !isCurrentActiveSemester,
  });

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
        {/* Search Toolbar */}
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

          {/* Only allow enrollment in the active semester */}
          {isCurrentActiveSemester ? (
            <Button
              size="sm"
              className="h-8 cursor-pointer rounded-lg px-3 text-xs font-medium"
              onClick={() => setEnrollDialogOpen(true)}
            >
              <UserPlus className="mr-1.5 size-3.5" /> Enroll Student
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground italic bg-muted/50 px-2.5 py-1 rounded-md border border-border/50">
              Archived Semester Roster (Read Only)
            </span>
          )}
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={studentsResponse?.data ?? []}
          getRowId={(row) => row.id}
          isLoading={isStudentsPending}
          isError={isStudentsError}
          error={studentsError}
          emptyMessage="No enrolled students found matching the criteria."
        />

        {/* Footer Pagination */}
        <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-muted-foreground">
          <span>
            {studentsResponse?.pagination
              ? `Page ${studentsResponse.pagination.currentPage} of ${studentsResponse.pagination.totalPage}`
              : "Loading page info..."}
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 rounded-lg"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!studentsResponse?.pagination?.hasPrev || isStudentsPending}
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <span className="flex h-7 min-w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-medium text-primary">
              {studentsResponse?.pagination?.currentPage ?? 1}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 rounded-lg"
              onClick={() => setPage((p) => p + 1)}
              disabled={!studentsResponse?.pagination?.hasNext || isStudentsPending}
            >
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Enrollment Dialog */}
      <ClassStudentEnrollDialog
        open={enrollDialogOpen}
        onOpenChange={setEnrollDialogOpen}
        classId={classId}
      />

      {/* Drop Confirmation Alert */}
      <AlertDialog open={!!dropTarget} onOpenChange={(open) => !open && setDropTarget(null)}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold">
              Drop Student from Class?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              {dropTarget && (
                <>
                  Are you sure you want to drop{" "}
                  <strong className="text-foreground">{dropTarget.studentName}</strong> from this
                  class section? This action will unenroll the student.
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
