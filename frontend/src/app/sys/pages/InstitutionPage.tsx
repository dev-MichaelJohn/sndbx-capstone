import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getColleges } from "@/features/sys/college.service";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { DataTable } from "../components/main-data-table";
import type { DataTableColumn } from "../components/main-data-table";
import type { CollegeWithDean } from "backend/types/college.types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatFullName } from "@/lib/nameFormatter";
import { CollegeEditDialog } from "../components/college-edit";

const columns: Array<DataTableColumn<CollegeWithDean>> = [
  {
    header: "Code",
    className: "w-24",
    cell: (row) => (
      <Badge variant="outline" className="font-mono text-sm">
        {row.initialism}
      </Badge>
    ),
  },
  { header: "Name", className: "w-auto", cell: (row) => row.name },
  {
    header: "Dean",
    className: "w-auto",
    cell: (row) => {
      const deanName = formatFullName({
        first_name: row.first_name,
        last_name: row.last_name,
        middle_name: row.middle_name,
        suffix: row.suffix,
      });

      return deanName ?? <span className="italic text-muted-foreground/60">Unassigned</span>;
    },
  },
  {
    header: "Actions",
    className: "w-px whitespace-nowrap",
    cell: (row) => (
      <div className="flex items-center gap-1.5 justify-end">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 rounded-md px-2.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Eye className="mr-1 size-3.5" />
          View Programs
        </Button>
        <CollegeEditDialog icon={Pencil} triggerText="Edit" defaultData={row} />
        <Button
          variant="ghost"
          size="sm"
          className="h-7 rounded-md px-2.5 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="mr-1 size-3.5" />
          Delete
        </Button>
      </div>
    ),
  },
];

export const InstitutionPage = () => {
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
        <Card className="overflow-hidden rounded-xl shadow-xs gap-0 pb-0">
          <CardHeader className="flex items-center justify-between border-b px-6 py- flex-col gap-2.5 sm:flex-row sm:items-center">
            <div className="relative w-full max-w-xs">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search colleges..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="h-8 rounded-lg pl-8"
              />
            </div>
            <Button className="rounded-lg p-4 flex items-center justify-center gap-1">
              <Plus className="size-3.5" />
              <span className="leading-none text-sm">Add College</span>
            </Button>
          </CardHeader>

          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={collegeResponse?.data ?? []}
              getRowId={(row) => row.id}
              isLoading={isCollegesPending}
              isError={isCollegesError}
              error={collegeError}
              emptyMessage="No colleges found."
            />
          </CardContent>
        </Card>
      </div>

      {/* ── Pagination Footer ─────────────────────────────────────────────── */}
      <div className="shrink-0 border-t bg-card px-6 py-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {collegeResponse?.pagination
              ? `Page ${collegeResponse.pagination.currentPage} of ${collegeResponse.pagination.totalPage}`
              : "Loading page info..."}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 rounded-lg p-0"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!collegeResponse?.pagination?.hasPrev || isCollegesPending}
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-medium text-primary">
              {collegeResponse?.pagination?.currentPage ?? 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 rounded-lg p-0"
              onClick={() => setPage((p) => p + 1)}
              disabled={!collegeResponse?.pagination?.hasNext || isCollegesPending}
            >
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
