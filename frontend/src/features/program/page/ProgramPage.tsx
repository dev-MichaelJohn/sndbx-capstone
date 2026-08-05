import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/main-data-table";
import { TablePagination } from "@/components/table-pagination";

import { getProgramsViaCollegeID } from "@/features/program/api/program.service";
import { ProgramCreateDialog } from "@/features/program/components/ProgramCreate";
import { getProgramColumns } from "@/features/program/components/ProgramColumns";
import { ProgramStatsCards } from "@/features/program/components/ProgramStatsCards";

export const ProgramPage = () => {
  const { collegeId } = useParams<{ collegeId: string }>();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const numericCollegeId = Number(collegeId);

  // Memoize the columns so they don't trigger unnecessary table re-renders[cite: 19]
  const columns = useMemo(() => getProgramColumns(numericCollegeId), [numericCollegeId]);

  const {
    data: programResponse,
    isPending: isProgramsPending,
    isError: isProgramsError,
    error: programError,
  } = useQuery({
    queryKey: ["getProgramsViaCollegeID", numericCollegeId, search, page],
    queryFn: () => getProgramsViaCollegeID(numericCollegeId, search),
    enabled: !isNaN(numericCollegeId) && numericCollegeId > 0,
    placeholderData: (previousData) => previousData,
  });

  const programs = useMemo(() => programResponse?.data ?? [], [programResponse?.data]);
  const totalPrograms = programResponse?.pagination?.totalItems ?? programs.length;

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
        {/* ── Header Section ────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-lg"
              onClick={() => navigate("../..", { relative: "path" })}
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Programs</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage academic degree programs under this college
              </p>
            </div>
          </div>
          <ProgramCreateDialog icon={Plus} triggerText="Add Program" collegeId={numericCollegeId} />
        </div>

        {/* KPI Summary Cards */}
        <ProgramStatsCards programs={programs} total={totalPrograms} />

        {/* ── Table Section ─────────────────────────────────────────────── */}
        <Card className="flex flex-col gap-0 overflow-hidden rounded-xl pb-0 shadow-xs">
          <CardHeader className="flex flex-col items-center justify-between gap-2.5 border-b px-6 sm:flex-row">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search programs..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1); // Reset to page 1 on new search[cite: 19]
                }}
                className="h-8 rounded-lg pl-8 text-xs"
              />
            </div>
          </CardHeader>

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
      </div>

      {/* ── Pagination Footer ───────────────────────────────────────────── */}
      <TablePagination
        pagination={programResponse?.pagination}
        isPending={isProgramsPending}
        onPageChange={setPage}
      />
    </div>
  );
};

export default ProgramPage;
