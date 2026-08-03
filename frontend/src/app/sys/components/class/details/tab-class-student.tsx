import { useState } from "react";
import { ChevronLeft, ChevronRight, Search, UserPlus } from "lucide-react";

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

import { useClassStudents, useDropStudent } from "@/features/sys/class-student.service";
import { getClassStudentColumns } from "../../class-student/class-student-columns";
import { ClassStudentEnrollDialog } from "../../class-student/enroll-student";
import toast from "react-hot-toast";

interface ClassStudentsTabProps {
  classId: number;
}

interface DropTarget {
  id: number;
  studentName: string;
}

export const ClassStudentsTab = ({ classId }: ClassStudentsTabProps) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  // Dialog & Active Selection States
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);

  // Queries & Mutations
  const {
    data: studentsResponse,
    isPending: isStudentsPending,
    isError: isStudentsError,
    error: studentsError,
  } = useClassStudents({
    class_id: classId,
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

  // Table Column Config
  const columns = getClassStudentColumns({
    onDrop: (id, studentName) => setDropTarget({ id, studentName }),
    isDropping: dropMutation.isPending,
  });

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* ── Table Section ───────────────────────────────────────────────── */}
      <Card className="overflow-hidden rounded-xl shadow-xs gap-0 pb-0">
        <CardHeader className="flex items-center justify-between border-b px-6 flex-col gap-2.5 sm:flex-row sm:items-center">
          {/* Search Toolbar */}
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
            className="h-8 rounded-lg text-xs font-medium w-full sm:w-auto"
            onClick={() => setEnrollDialogOpen(true)}
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
            emptyMessage="No enrolled students found matching the criteria."
          />
        </CardContent>
      </Card>

      {/* ── Pagination Footer ─────────────────────────────────────────────── */}
      <div className="shrink-0 border-t bg-card px-6 py-3 rounded-b-xl">
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
              className="h-7 w-7 rounded-lg p-0"
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
              className="h-7 w-7 rounded-lg p-0"
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Drop Student from Class?</AlertDialogTitle>
            <AlertDialogDescription>
              {dropTarget && (
                <>
                  Are you sure you want to drop <strong>{dropTarget.studentName}</strong> from this
                  class section? This action will unenroll the student.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={dropMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDrop}
              disabled={dropMutation.isPending}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {dropMutation.isPending ? "Dropping..." : "Yes, drop student"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
