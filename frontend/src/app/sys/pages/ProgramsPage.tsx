import type { ProgramWithChairType } from "backend/types/program.type";
import { formatFullName } from "@/lib/nameFormatter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable, type DataTableColumn } from "../components/main-data-table";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProgramsViaCollegeID } from "@/features/sys/program.service";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ProgramCreateDialog } from "../components/program-create";
import { ProgramEditDialog } from "../components/program-edit";

const columns: Array<DataTableColumn<ProgramWithChairType>> = [
  {
    header: "Code",
    className: "w-24",
    cell: (row) => (
      <Badge variant="outline" className="font-mono text-sm">
        {row.initialism}
      </Badge>
    ),
  },
  {
    header: "Program Name",
    className: "w-auto",
    cell: (row) => row.name,
  },
  {
    header: "Program Chair",
    className: "w-auto",
    cell: (row) => {
      // Check if account_id or first_name exists to determine if a chair is assigned
      const chairName = row.account_id
        ? formatFullName({
            first_name: row.first_name,
            last_name: row.last_name,
            middle_name: row.middle_name,
            suffix: row.suffix,
          })
        : null;

      return chairName ?? <span className="italic text-muted-foreground/60">Unassigned</span>;
    },
  },
  {
    header: "Actions",
    className: "w-px whitespace-nowrap",
    cell: (row) => (
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-40 p-1">
            <DropdownMenuItem className="cursor-pointer text-xs focus:bg-accent focus:text-accent-foreground">
              <Eye className="mr-2 size-3.5" />
              View Details
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="p-0 focus:bg-transparent hover:bg-transparent cursor-pointer"
              onSelect={(e) => e.preventDefault()}
            >
              <ProgramEditDialog icon={Pencil} triggerText="Edit" defaultData={row} />
            </DropdownMenuItem>

            <DropdownMenuItem
              className="p-0 focus:bg-transparent hover:bg-transparent cursor-pointer"
              onSelect={(e) => e.preventDefault()}
            >
              {/* Program Delete Dialog Component here */}
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-8 justify-start px-2 py-1.5 text-xs font-normal text-destructive hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive"
              >
                <Trash2 className="mr-2 size-3.5 shrink-0" />
                Delete
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];

export const ProgramsPage = () => {
  const { collegeId } = useParams<{ collegeId: string }>();

  const [_page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const numericCollegeId = Number(collegeId);

  const {
    data: programResponse,
    isPending: isProgramsPending,
    isError: isProgramsError,
    error: programError,
  } = useQuery({
    // Include numericCollegeId in the query key
    queryKey: ["getProgramsViaCollegeID", numericCollegeId, search],
    queryFn: () => getProgramsViaCollegeID(numericCollegeId, search),
    // Only execute query if we have a valid number ID
    enabled: !isNaN(numericCollegeId) && numericCollegeId > 0,
    placeholderData: (previousData) => previousData,
  });

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
        {/* ── Header Section ────────────────────────────────────────────── */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-lg"
            onClick={() => navigate(-1)}
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

        {/* ── Table Section ─────────────────────────────────────────────── */}
        <Card className="overflow-hidden rounded-xl shadow-xs gap-0 pb-0">
          <CardHeader className="flex items-center justify-between border-b px-6 flex-col gap-2.5 sm:flex-row sm:items-center">
            <div className="relative w-full max-w-xs">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search programs..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="h-8 rounded-lg pl-8"
              />
            </div>

            <ProgramCreateDialog
              icon={Plus}
              triggerText="Add Program"
              collegeId={numericCollegeId}
            />
          </CardHeader>

          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={programResponse?.data ?? []}
              getRowId={(row) => row.id}
              isLoading={isProgramsPending}
              isError={isProgramsError}
              error={programError}
              emptyMessage="No programs found for this college."
            />
          </CardContent>
        </Card>
      </div>

      {/* ── Pagination Footer ───────────────────────────────────────────── */}
      <div className="shrink-0 border-t bg-card px-6 py-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {programResponse?.pagination
              ? `Page ${programResponse.pagination.currentPage} of ${programResponse.pagination.totalPage}`
              : "Loading page info..."}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 rounded-lg p-0"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!programResponse?.pagination?.hasPrev || isProgramsPending}
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-medium text-primary">
              {programResponse?.pagination?.currentPage ?? 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 rounded-lg p-0"
              onClick={() => setPage((p) => p + 1)}
              disabled={!programResponse?.pagination?.hasNext || isProgramsPending}
            >
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
