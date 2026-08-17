import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Building2, UserCheck, ShieldCheck } from "lucide-react";

import { Card, CardContent, CardHeader as UiCardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/main-data-table";
import { TablePagination } from "@/components/table-pagination";
import { StatCard } from "@/components/ui/stat-card";
import { ViewSwitcher, type ViewMode } from "@/components/ui/view-switcher";
import { PageHeader } from "@/components/ui/page-header";

import { getColleges } from "../api/college.service";
import { collegeColumns } from "../components/CollegeColumns";
import { CollegeCard } from "../components/CollegeCard";
import { CollegeCreateDialog } from "../components/CollegeCreate";
import { CSVImportDialog } from "@/features/bulk-import/components/CSVImportDialog";
import type { CollegeWithDean } from "backend/types/college.types";

export const CollegePage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const {
    data: collegeResponse,
    isPending: isCollegesPending,
    isError: isCollegesError,
    error: collegeError,
  } = useQuery({
    queryKey: ["getColleges", page, search],
    queryFn: () => getColleges({ page, search }),
    placeholderData: (previousData) => previousData,
  });

  const colleges = useMemo(() => collegeResponse?.data ?? [], [collegeResponse?.data]);
  const totalColleges = collegeResponse?.pagination?.totalItems ?? colleges.length;
  const assignedDeans = useMemo(() => colleges.filter((c) => c.account_id).length, [colleges]);
  const deanCoverage = totalColleges > 0 ? Math.round((assignedDeans / totalColleges) * 100) : 0;

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
        {/* Header */}
        <PageHeader
          title="Colleges"
          description="Manage academic colleges, dean leadership assignments, and degree programs."
          actions={
            <div className="flex items-center gap-2">
              <CSVImportDialog entity="colleges" title="Import Colleges CSV" />
              <CollegeCreateDialog icon={Plus} triggerText="Add College" />
            </div>
          }
        />

        {/* KPI Stat Cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard
            title="Total Colleges"
            value={totalColleges}
            subtitle="Academic institutions"
            icon={Building2}
            accent="primary"
            isLoading={isCollegesPending}
          />
          <StatCard
            title="Assigned Deans"
            value={assignedDeans}
            subtitle="Active college leadership"
            icon={UserCheck}
            accent="emerald"
            isLoading={isCollegesPending}
          />
          <StatCard
            title="Dean Coverage"
            value={`${deanCoverage}%`}
            subtitle="Filled leadership positions"
            icon={ShieldCheck}
            accent="indigo"
            isLoading={isCollegesPending}
          />
        </div>

        {/* Main Content Area */}
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search colleges..."
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

          {/* Grid View vs Table View */}
          {viewMode === "grid" ? (
            isCollegesPending ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-48 rounded-xl border bg-card animate-pulse" />
                ))}
              </div>
            ) : colleges.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-dashed bg-card text-center text-xs text-muted-foreground">
                No colleges found matching criteria.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {colleges.map((college: CollegeWithDean) => (
                  <CollegeCard key={college.id} college={college} />
                ))}
              </div>
            )
          ) : (
            <Card className="overflow-hidden rounded-xl pb-0 shadow-2xs">
              <UiCardHeader className="hidden" />
              <CardContent className="p-0">
                <DataTable
                  columns={collegeColumns}
                  data={colleges}
                  getRowId={(row) => row.id.toString()}
                  isLoading={isCollegesPending}
                  isError={isCollegesError}
                  error={collegeError}
                  emptyMessage="No colleges found."
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Pagination */}
      <TablePagination
        pagination={collegeResponse?.pagination}
        isPending={isCollegesPending}
        onPageChange={setPage}
      />
    </div>
  );
};

export default CollegePage;
