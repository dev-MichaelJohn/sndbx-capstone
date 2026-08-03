import { useState } from "react";
import { useCourseOfferings, useDeleteCourseOffering } from "@/features/sys/offerings.service";
import type { CourseOfferingWithDetails } from "backend/types/offerings.type";
import { getCourseOfferingColumns } from "../../offerings/offering-column";
import { OfferingCreateDialog } from "../../offerings/offering-create";
import { OfferingEditDialog } from "../../offerings/offering-edit";
import { DataTable } from "@/components/data-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Loader2, Plus, Search } from "lucide-react";
import toast from "react-hot-toast";

interface CourseOfferingsTabProps {
  classId: number;
  programId?: number;
}

export const CourseOfferingsTab = ({ classId, programId }: CourseOfferingsTabProps) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  // Dialog & Active Selection States
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedOffering, setSelectedOffering] = useState<CourseOfferingWithDetails | null>(null);

  // Queries & Mutations
  const { data, isLoading } = useCourseOfferings({
    class_id: classId,
    search: search || undefined,
    page,
  });

  const deleteMutation = useDeleteCourseOffering();

  // Edit Handler
  const handleEdit = (offering: CourseOfferingWithDetails) => {
    setSelectedOffering(offering);
    setEditDialogOpen(true);
  };

  // Delete Handler
  const handleDelete = async (id: number, courseName: string) => {
    if (!confirm(`Are you sure you want to remove ${courseName}?`)) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Course offering removed successfully.");
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  // Table Column Config
  const columns = getCourseOfferingColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    isDeleting: deleteMutation.isPending,
  });

  const offerings = data?.data ?? [];
  const totalPages = data?.pagination?.totalPage ?? 1;

  return (
    <Card className="overflow-hidden rounded-xl shadow-xs gap-0 pb-0">
      {/* ── Card Header / Search Toolbar ────────────────────────────────── */}
      <CardHeader className="flex items-center justify-between border-b px-6 flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search offerings..."
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
          onClick={() => setCreateDialogOpen(true)}
        >
          <Plus className="mr-1.5 size-3.5" /> Add Offering
        </Button>
      </CardHeader>

      {/* ── Card Content / Data Table ───────────────────────────────────── */}
      <CardContent className="p-0 relative">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="size-4 animate-spin text-primary" />
            Loading course offerings...
          </div>
        ) : offerings.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            No course offerings found for this class.
          </div>
        ) : (
          <div>
            <DataTable columns={columns} data={offerings} />

            {/* Pagination Controls */}
            {data && (
              <div className="flex items-center justify-between border-t border-border/60 px-6 py-3 text-xs text-muted-foreground">
                <div>
                  Showing {offerings.length} of {data.pagination.totalItems} records (Page{" "}
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

      {/* Creation Modal */}
      <OfferingCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        classId={classId}
        programId={programId}
      />

      {/* Edit Modal */}
      <OfferingEditDialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setSelectedOffering(null);
        }}
        offering={selectedOffering}
        programId={programId}
      />
    </Card>
  );
};
