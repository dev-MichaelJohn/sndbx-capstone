import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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

  // Dialog & Active Selection States
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingOffering, setEditingOffering] = useState<CourseOfferingWithDetails | null>(null);

  // Queries
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

  // Table Column Config
  const columns = getCourseOfferingColumns({
    onEdit: (offering) => setEditingOffering(offering),
    onViewStudents: (offering) => navigate(`course-offerings/${offering.id}/students`),
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

        <CardContent className="p-0">
          <DataTable<CourseOfferingWithDetails>
            columns={columns}
            data={offeringsResponse?.data ?? []}
            getRowId={(row) => row.id}
            isLoading={isOfferingsPending}
            isError={isOfferingsError}
            error={offeringsError}
            emptyMessage="No course offerings found matching the criteria."
          />
        </CardContent>
      </Card>

      {/* ── Pagination Footer ─────────────────────────────────────────────── */}
      <div className="shrink-0 border-t bg-card px-6 py-3 rounded-b-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {offeringsResponse?.pagination
              ? `Page ${offeringsResponse.pagination.currentPage} of ${offeringsResponse.pagination.totalPage}`
              : "Loading page info..."}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 rounded-lg p-0"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!offeringsResponse?.pagination?.hasPrev || isOfferingsPending}
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-medium text-primary">
              {offeringsResponse?.pagination?.currentPage ?? 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 rounded-lg p-0"
              onClick={() => setPage((p) => p + 1)}
              disabled={!offeringsResponse?.pagination?.hasNext || isOfferingsPending}
            >
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Creation Dialog */}
      <OfferingCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        classId={classId}
        programId={programId}
      />

      {/* Edit Dialog */}
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
