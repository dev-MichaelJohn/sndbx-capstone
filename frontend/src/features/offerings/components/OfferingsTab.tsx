import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/main-data-table";

import type { CourseOfferingWithDetails } from "backend/types/offerings.type";
import { useCourseOfferings } from "../api/offerings.service";
import { getCourseOfferingColumns } from "./OfferingColumns";
import { OfferingCreateDialog } from "./OfferingCreate";
import { OfferingEditDialog } from "./OfferingEdit";

interface CourseOfferingsTabProps {
  classId: number;
  programId?: number;
}

export const CourseOfferingsTab = ({ classId, programId }: CourseOfferingsTabProps) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingOffering, setEditingOffering] = useState<CourseOfferingWithDetails | null>(null);

  const {
    data: offeringsResponse,
    isPending: isOfferingsPending,
    isError: isOfferingsError,
    error: offeringsError,
  } = useCourseOfferings({
    class_id: classId,
    search: search.trim() || undefined,
    page,
  });

  const columns = getCourseOfferingColumns({
    onEdit: (offering) => setEditingOffering(offering),
    onViewStudents: (offering) => navigate(`course-offerings/${offering.id}/students`),
  });

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
        {/* Toolbar Header */}
        <div className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search offerings..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="h-8 rounded-lg pl-8 text-xs"
            />
          </div>

          <Button
            size="sm"
            className="h-8 rounded-lg px-3 text-xs font-medium cursor-pointer"
            onClick={() => setCreateDialogOpen(true)}
          >
            <Plus className="mr-1.5 size-3.5" /> Add Offering
          </Button>
        </div>

        {/* Data Table */}
        <DataTable<CourseOfferingWithDetails>
          columns={columns}
          data={offeringsResponse?.data ?? []}
          getRowId={(row) => row.id}
          isLoading={isOfferingsPending}
          isError={isOfferingsError}
          error={offeringsError}
          emptyMessage="No course offerings found matching the criteria."
        />

        {/* Footer Pagination */}
        <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-muted-foreground">
          <span>
            {offeringsResponse?.pagination
              ? `Page ${offeringsResponse.pagination.currentPage} of ${offeringsResponse.pagination.totalPage}`
              : "Loading page info..."}
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 rounded-lg"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!offeringsResponse?.pagination?.hasPrev || isOfferingsPending}
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <span className="flex h-7 min-w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-medium text-primary">
              {offeringsResponse?.pagination?.currentPage ?? 1}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 rounded-lg"
              onClick={() => setPage((p) => p + 1)}
              disabled={!offeringsResponse?.pagination?.hasNext || isOfferingsPending}
            >
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <OfferingCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        classId={classId}
        programId={programId}
      />

      <OfferingEditDialog
        open={!!editingOffering}
        onOpenChange={(open) => {
          if (!open) setEditingOffering(null);
        }}
        offering={editingOffering}
        programId={programId}
      />
    </div>
  );
};
