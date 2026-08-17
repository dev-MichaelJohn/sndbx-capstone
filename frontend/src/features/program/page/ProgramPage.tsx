import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Plus, Search, BookOpen, UserCheck, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader as UiCardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/main-data-table";
import { TablePagination } from "@/components/table-pagination";
import { StatCard } from "@/components/ui/stat-card";
import { ViewSwitcher, type ViewMode } from "@/components/ui/view-switcher";
import { PageHeader } from "@/components/ui/page-header";

import { getProgramsViaCollegeID } from "@/features/program/api/program.service";
import { ProgramCreateDialog } from "@/features/program/components/ProgramCreate";
import { getProgramColumns } from "@/features/program/components/ProgramColumns";
import { ProgramCard } from "@/features/program/components/ProgramCard";
import { CSVImportDialog } from "@/features/bulk-import/components/CSVImportDialog";
import type { ProgramWithChairType } from "backend/types/program.type";

export const ProgramPage = () => {
  const { collegeId } = useParams<{ collegeId: string }>();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const numericCollegeId = Number(collegeId);
  const columns = useMemo(() => getProgramColumns(numericCollegeId), [numericCollegeId]);

  const {
    data: programResponse,
    isPending: isProgramsPending,
    isError: isProgramsError,
    error: programError,
    refetch,
  } = useQuery({
    queryKey: ["getProgramsViaCollegeID", numericCollegeId, search, page],
    queryFn: () => getProgramsViaCollegeID(numericCollegeId, search),
    enabled: !isNaN(numericCollegeId) && numericCollegeId > 0,
    placeholderData: (previousData) => previousData,
  });

  const programs = useMemo(() => programResponse?.data ?? [], [programResponse?.data]);
  const totalPrograms = programResponse?.pagination?.totalItems ?? programs.length;
  const assignedChairs = useMemo(() => programs.filter((p) => p.account_id).length, [programs]);
  const chairCoverage = totalPrograms > 0 ? Math.round((assignedChairs / totalPrograms) * 100) : 0;

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
        {/* Header */}
        <PageHeader
          title="Degree Programs"
          description="Manage academic degree programs and chair assignments under this college."
          badge={
            <Button
              variant="outline"
              size="icon"
              className="size-8 shrink-0 rounded-lg"
              onClick={() => navigate("../..", { relative: "path" })}
              title="Back to Colleges"
            >
              <ArrowLeft className="size-4" />
            </Button>
          }
          actions={
            <div className="flex items-center gap-2">
              <CSVImportDialog
                entity="programs"
                title="Import Programs"
                defaultContext={{ college_id: numericCollegeId }}
                onSuccess={() => refetch()}
              />
              <ProgramCreateDialog
                icon={Plus}
                triggerText="Add Program"
                collegeId={numericCollegeId}
              />
            </div>
          }
        />

        {/* KPI Stat Cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard
            title="Total Programs"
            value={totalPrograms}
            subtitle="Degree courses"
            icon={BookOpen}
            accent="violet"
            isLoading={isProgramsPending}
          />
          <StatCard
            title="Assigned Chairs"
            value={assignedChairs}
            subtitle="Program leadership"
            icon={UserCheck}
            accent="emerald"
            isLoading={isProgramsPending}
          />
          <StatCard
            title="Chair Coverage"
            value={`${chairCoverage}%`}
            subtitle="Filled positions"
            icon={ShieldCheck}
            accent="indigo"
            isLoading={isProgramsPending}
          />
        </div>

        {/* Controls Bar & Views */}
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search programs..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="h-8 rounded-lg pl-8 text-xs bg-card"
              />
            </div>

            <ViewSwitcher mode={viewMode} onChange={setViewMode} />
          </div>

          {viewMode === "grid" ? (
            isProgramsPending ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-48 rounded-xl border bg-card animate-pulse" />
                ))}
              </div>
            ) : programs.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-dashed bg-card text-center text-xs text-muted-foreground">
                No degree programs found for this college.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {programs.map((program: ProgramWithChairType) => (
                  <ProgramCard key={program.id} program={program} />
                ))}
              </div>
            )
          ) : (
            <Card className="overflow-hidden rounded-xl pb-0 shadow-2xs">
              <UiCardHeader className="hidden" />
              <CardContent className="p-0">
                <DataTable
                  columns={columns}
                  data={programs}
                  getRowId={(row) => row.id.toString()}
                  isLoading={isProgramsPending}
                  isError={isProgramsError}
                  error={programError}
                  emptyMessage="No programs found for this college."
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <TablePagination
        pagination={programResponse?.pagination}
        isPending={isProgramsPending}
        onPageChange={setPage}
      />
    </div>
  );
};

export default ProgramPage;
