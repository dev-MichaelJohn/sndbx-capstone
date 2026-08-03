import { useState } from "react";
import { useClassStudents, useDropStudent } from "@/features/sys/class-student.service";
import { getClassStudentColumns } from "../../class-student/class-student-columns";
import { ClassStudentEnrollDialog } from "../../class-student/enroll-student";
import { DataTable } from "@/components/data-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Loader2, UserPlus, Search } from "lucide-react";
import toast from "react-hot-toast";

interface ClassStudentsTabProps {
  classId: number;
}

export const ClassStudentsTab = ({ classId }: ClassStudentsTabProps) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);

  // Queries & Mutations
  const { data, isLoading } = useClassStudents({
    class_id: classId,
    page,
    search: search.trim() || undefined,
  });

  const dropMutation = useDropStudent();

  // Drop Handler
  const handleDrop = async (id: number, studentName: string) => {
    if (!confirm(`Are you sure you want to drop ${studentName} from this class?`)) {
      return;
    }

    try {
      await dropMutation.mutateAsync(id);
      toast.success("Student dropped from class successfully.");
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  // Table Column Config
  const columns = getClassStudentColumns({
    onDrop: handleDrop,
    isDropping: dropMutation.isPending,
  });

  const students = data?.data ?? [];
  const totalPages = data?.pagination?.totalPage ?? 1;

  return (
    <Card className="overflow-hidden rounded-xl shadow-xs gap-0 pb-0">
      {/* ── Toolbar / Header ────────────────────────────────────────────── */}
      <CardHeader className="flex items-center justify-between border-b px-6 flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
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

      {/* ── Data Table / Empty States ──────────────────────────────────── */}
      <CardContent className="p-0 relative">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="size-4 animate-spin text-primary" />
            Loading enrolled students...
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            No enrolled students found for this class section.
          </div>
        ) : (
          <div>
            <DataTable columns={columns} data={students} />

            {/* Pagination Controls */}
            {data && (
              <div className="flex items-center justify-between border-t border-border/60 px-6 py-3 text-xs text-muted-foreground">
                <div>
                  Showing {students.length} of {data.pagination.totalItems} students (Page{" "}
                  {data.pagination.currentPage} of {totalPages})
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={data.pagination.currentPage <= 1 || isLoading}
                    className="h-7 px-2 text-xs"
                  >
                    <ChevronLeft className="size-3.5 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    disabled={data.pagination.currentPage >= totalPages || isLoading}
                    className="h-7 px-2 text-xs"
                  >
                    Next
                    <ChevronRight className="size-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Enrollment Dialog */}
      <ClassStudentEnrollDialog
        open={enrollDialogOpen}
        onOpenChange={setEnrollDialogOpen}
        classId={classId}
      />
    </Card>
  );
};
