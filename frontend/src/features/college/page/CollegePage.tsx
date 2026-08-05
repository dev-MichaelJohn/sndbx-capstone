import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/main-data-table";
import { TablePagination } from "@/components/table-pagination";

import { getColleges } from "../api/college.service";
import { collegeColumns } from "../components/CollegeColumns";
import { CollegeCreateDialog } from "../components/CollegeCreate";

export const CollegePage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

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

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Colleges</h1>
          <p className="mt-1 text-sm text-muted-foreground">View and manage all college records</p>
        </div>

        {/* ── Table Section ───────────────────────────────────────────────── */}
        <Card className="flex flex-col gap-0 overflow-hidden rounded-xl pb-0 shadow-xs">
          <CardHeader className="flex flex-col items-center justify-between gap-2.5 border-b px-6 sm:flex-row">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search colleges..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1); // Reset to page 1 on new search
                }}
                className="h-8 rounded-lg pl-8"
              />
            </div>
            <CollegeCreateDialog icon={Plus} triggerText="Add College" />
          </CardHeader>

          <CardContent className="p-0">
            <DataTable
              columns={collegeColumns}
              data={collegeResponse?.data ?? []}
              getRowId={(row) => row.id.toString()}
              isLoading={isCollegesPending}
              isError={isCollegesError}
              error={collegeError}
              emptyMessage="No colleges found."
            />
          </CardContent>
        </Card>
      </div>

      {/* ── Pagination Footer ─────────────────────────────────────────────── */}
      <TablePagination
        pagination={collegeResponse?.pagination}
        isPending={isCollegesPending}
        onPageChange={setPage}
      />
    </div>
  );
};

export default CollegePage;
