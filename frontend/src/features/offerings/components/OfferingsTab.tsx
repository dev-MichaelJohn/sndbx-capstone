import { useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router";

import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/main-data-table";
import { ViewSwitcher, type ViewMode } from "@/components/ui/view-switcher";
import { TablePagination } from "@/components/table-pagination";

import type { CourseOfferingWithDetails } from "backend/types/offerings.type";
import { useCourseOfferings } from "../api/offerings.service";
import { useSemesters } from "@/features/semester/api/semester.service";
import { getCourseOfferingColumns } from "./OfferingColumns";
import { CourseOfferingCard } from "./OfferingCard";
import { OfferingEditDialog } from "./OfferingEdit";
import { CourseOfferingDeleteDialog } from "./OfferingDelete";

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
  const [deletingOffering, setDeletingOffering] = useState<CourseOfferingWithDetails | null>(null);

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
      {/* Controls Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search course offerings..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="h-8.5 rounded-xl pl-8 text-xs bg-card border-border/70"
          />
        </div>

        <ViewSwitcher mode={viewMode} onChange={setViewMode} />
      </div>

      {/* Grid vs Table View */}
      {viewMode === "grid" ? (
        isOfferingsPending ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-48 rounded-2xl border border-border/50 bg-card/60 animate-pulse"
              />
            ))}
          </div>
        ) : offerings.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-card p-6 text-center text-xs text-muted-foreground">
            No course offerings found for this class section.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {offerings.map((offering) => (
              <CourseOfferingCard
                key={offering.id}
                offering={offering}
                onEdit={(item) => setEditingOffering(item)}
                onDelete={(item) => setDeletingOffering(item)}
                onViewStudents={(item) => navigate(`course-offerings/${item.id}/students`)}
                isCurrentActiveSemester={isCurrentActiveSemester}
              />
            ))}
          </div>
        )
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xs">
          <DataTable<CourseOfferingWithDetails>
            columns={columns}
            data={offerings}
            getRowId={(row) => row.id}
            isLoading={isOfferingsPending}
            isError={isOfferingsError}
            error={offeringsError}
            emptyMessage="No course offerings found matching criteria."
          />
        </div>
      )}

      {/* Pagination */}
      <TablePagination
        pagination={offeringsResponse?.pagination}
        isPending={isOfferingsPending}
        onPageChange={setPage}
      />

      {/* Edit & Delete Dialogs */}
      <OfferingEditDialog
        open={!!editingOffering}
        onOpenChange={(open) => !open && setEditingOffering(null)}
        offering={editingOffering as any}
        programId={programId}
      />

      {deletingOffering && (
        <CourseOfferingDeleteDialog offering={deletingOffering} triggerText="Delete" />
      )}
    </div>
  );
};
