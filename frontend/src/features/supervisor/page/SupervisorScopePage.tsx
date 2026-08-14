import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Shield, Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, type DataTableColumn } from "@/components/main-data-table";
import { TablePagination } from "@/components/table-pagination";

import { useSupervisorOfferings } from "../api/supervisor.service";
import { useSemesters } from "@/features/semester/api/semester.service";
import type { CourseOfferingWithDetails } from "backend/types/offerings.type";

export const SupervisorScopePage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedSemesterId, setSelectedSemesterId] = useState<number | undefined>(undefined);

  // Fetch academic semesters list
  const { data: semesterResponse } = useSemesters({
    search: undefined,
    page: 1,
    orderBy: "id",
    orderDir: "desc",
  });
  const semesters = semesterResponse?.data ?? [];
  const activeSemesterId = selectedSemesterId ?? semesters[0]?.id;

  // Query supervisor course offerings scoped to selected semester
  const {
    data: offeringsRes,
    isPending,
    isError,
    error,
  } = useSupervisorOfferings({
    page,
    search: search.trim() || undefined,
    semester_id: activeSemesterId,
  });

  const offerings = offeringsRes?.data ?? [];

  const columns: Array<DataTableColumn<CourseOfferingWithDetails>> = [
    {
      header: "Course Code",
      cell: (row) => (
        <span className="font-mono text-xs font-semibold text-foreground">
          {row.course_initialism}
        </span>
      ),
    },
    {
      header: "Course Title",
      cell: (row) => <span className="text-xs font-medium text-foreground">{row.course_name}</span>,
    },
    {
      header: "Instructor",
      cell: (row) => {
        const name = row.first_name ? `${row.first_name} ${row.last_name}` : "Unassigned";
        return <span className="text-xs font-medium text-muted-foreground">{name}</span>;
      },
    },
    {
      header: "Term & Year",
      cell: (row) => (
        <span className="inline-flex items-center rounded-md border border-border/50 bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
          Year {row.year_level} • {row.semester_term} Term
        </span>
      ),
    },
  ];

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Jurisdiction Coverage
            </h1>
            <span className="inline-flex items-center gap-1 rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[11px] font-medium text-indigo-400">
              <Shield className="size-3" /> Scoped Jurisdiction
            </span>
          </div>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Overview of course offerings and assigned faculty under your active supervisor scope.
          </p>
        </div>

        <Card className="flex flex-col gap-0 overflow-hidden rounded-xl border bg-card shadow-xs">
          <CardHeader className="flex flex-col items-center justify-between gap-2.5 border-b px-6 sm:flex-row">
            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
              {/* Search Filter */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search coverage..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="h-8 rounded-lg pl-8 text-xs"
                />
              </div>

              {/* Semester Scoping Dropdown */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Calendar className="size-3.5 text-muted-foreground shrink-0" />
                <Select
                  value={activeSemesterId ? String(activeSemesterId) : ""}
                  onValueChange={(val) => {
                    setSelectedSemesterId(Number(val));
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-8 w-full sm:w-56 text-xs rounded-lg">
                    <SelectValue placeholder="Select Semester" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {semesters.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)} className="text-xs">
                        A.Y. {s.school_year_start}–{s.school_year_end} ({s.semester_term} Term)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={offerings}
              getRowId={(row) => row.id}
              isLoading={isPending}
              isError={isError}
              error={error}
              emptyMessage="No course offerings found under your supervisor jurisdiction for the selected term."
            />
          </CardContent>
        </Card>
      </div>

      <TablePagination
        pagination={offeringsRes?.pagination}
        isPending={isPending}
        onPageChange={setPage}
      />
    </div>
  );
};

export default SupervisorScopePage;
