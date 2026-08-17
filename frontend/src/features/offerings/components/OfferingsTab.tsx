import { useState } from "react";
import { ChevronLeft, ChevronRight, Search, Plus } from "lucide-react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/main-data-table";
import { ViewSwitcher, type ViewMode } from "@/components/ui/view-switcher";

import type { CourseOfferingWithDetails } from "backend/types/offerings.type";
import { useCourseOfferings } from "../api/offerings.service";
import { useSemesters } from "@/features/semester/api/semester.service";
import { getCourseOfferingColumns } from "./OfferingColumns";
import { OfferingCard } from "./OfferingCard";
import { OfferingEditDialog } from "./OfferingEdit";
import { OfferingCreateDialog } from "./OfferingCreate";

interface CourseOfferingsTabProps {
  classId: number;
  programId?: number;
  semesterId?: number;
}

export const CourseOfferingsTab = ({ classId, programId, semesterId }: CourseOfferingsTabProps) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const [editingOffering, setEditingOffering] = useState<CourseOfferingWithDetails | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Active semester verification
  const { data: semesterResponse } = useSemesters({
    search: undefined,
    page: 1,
    orderBy: "id",
    orderDir: "desc",
  });
  const activeSemesterId = semesterResponse?.data?.[0]?.id;
  const isCurrentActiveSemester = !semesterId || semesterId === activeSemesterId;

  const {
    data: offeringsResponse,
    isPending: isOfferingsPending,
    isError: isOfferingsError,
    error: offeringsError,
  } = useCourseOfferings({
    class_id: classId,
    semester_id: semesterId,
    search: search.trim() || undefined,
    page,
  });

  const offerings = offeringsResponse?.data ?? [];

  const columns = getCourseOfferingColumns({
    onEdit: (offering) => setEditingOffering(offering),
    onViewStudents: (offering) => navigate(`course-offerings/${offering.id}/students`),
    isCurrentActiveSemester,
  });

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="overflow-hidden rounded-xl border bg-card shadow-2xs">
        {/* Toolbar Header */}
        <div className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search course offerings..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="h-8 rounded-lg pl-8 text-xs bg-card"
            />
          </div>

          <div className="flex items-center gap-2">
            {isCurrentActiveSemester && (
              <Button
                size="sm"
                className="h-8 text-xs font-medium gap-1.5 cursor-pointer"
                onClick={() => setIsCreateOpen(true)}
              >
                <Plus className="size-3.5" /> Add Course Offering
              </Button>
            )}

            <ViewSwitcher mode={viewMode} onChange={setViewMode} />
          </div>
        </div>

        {/* Content: Grid View vs Table View */}
        <div className="p-4">
          {viewMode === "grid" ? (
            isOfferingsPending ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-44 rounded-xl border bg-card animate-pulse" />
                ))}
              </div>
            ) : offerings.length === 0 ? (
              <div className="flex h-40 items-center justify-center rounded-xl border border-dashed text-xs text-muted-foreground">
                No course offerings found for this class section.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {offerings.map((offering) => (
                  <OfferingCard
                    key={offering.id}
                    offering={offering}
                    onEdit={(o) => setEditingOffering(o)}
                    onViewStudents={(o) => navigate(`course-offerings/${o.id}/students`)}
                    isCurrentActiveSemester={isCurrentActiveSemester}
                  />
                ))}
              </div>
            )
          ) : (
            <DataTable<CourseOfferingWithDetails>
              columns={columns}
              data={offerings}
              getRowId={(row) => row.id}
              isLoading={isOfferingsPending}
              isError={isOfferingsError}
              error={offeringsError}
              emptyMessage="No course offerings found matching criteria."
            />
          )}
        </div>

        {/* Footer Pagination */}
        <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-muted-foreground">
          <span>
            {offeringsResponse?.pagination
              ? `Page ${offeringsResponse.pagination.currentPage} of ${offeringsResponse.pagination.totalPage}`
              : "1 of 1"}
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
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
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
