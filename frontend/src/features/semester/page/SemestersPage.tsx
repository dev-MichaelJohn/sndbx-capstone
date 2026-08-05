import { useState } from "react";
import { isWithinInterval, parseISO, format } from "date-fns";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Plus,
  X,
} from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/main-data-table";
import type { DataTableColumn } from "@/components/main-data-table";

import type { SemesterSearch, SemesterSelect } from "backend/types/semester.type";
import { useSemesters } from "../api/semester.service";
import { SemesterCreateDialog } from "../components/SemesterCreate";
import { SemesterEditDialog } from "../components/SemesterEdit";

// Helper function to check active status dynamically on the frontend
const getSemesterStatus = (startDateStr: string, endDateStr: string) => {
  const today = new Date();
  try {
    const start = parseISO(startDateStr);
    const end = parseISO(endDateStr);

    const isActive = isWithinInterval(today, { start, end });
    if (isActive) {
      return {
        label: "Active",
        className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-500",
      };
    }
    if (today < start) {
      return {
        label: "Upcoming",
        className: "border-amber-500/20 bg-amber-500/10 text-amber-500",
      };
    }
    return {
      label: "Ended",
      className: "border-border/50 bg-muted/60 text-muted-foreground",
    };
  } catch {
    return {
      label: "Unknown",
      className: "border-destructive/20 bg-destructive/10 text-destructive",
    };
  }
};

const columns: Array<DataTableColumn<SemesterSelect>> = [
  {
    header: "School Year",
    cell: (row) => (
      <span className="text-xs font-semibold tracking-tight text-foreground">
        SY {row.school_year_start}–{Number(row.school_year_start) + 1}
      </span>
    ),
  },
  {
    header: "Term",
    cell: (row) => (
      <span className="text-xs font-medium text-muted-foreground">
        {row.semester_term} Semester
      </span>
    ),
  },
  {
    header: "Start Date",
    cell: (row) => (
      <span className="inline-block rounded-md border border-border/40 bg-muted/50 px-2 py-0.5 font-mono text-[11px] font-medium text-foreground/90">
        {row.start_date}
      </span>
    ),
  },
  {
    header: "End Date",
    cell: (row) => (
      <span className="inline-block rounded-md border border-border/40 bg-muted/50 px-2 py-0.5 font-mono text-[11px] font-medium text-foreground/90">
        {row.end_date}
      </span>
    ),
  },
  {
    header: "Status",
    cell: (row) => {
      const status = getSemesterStatus(row.start_date, row.end_date);
      return (
        <span
          className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium ${status.className}`}
        >
          {status.label}
        </span>
      );
    },
  },
  {
    header: "Actions",
    className: "text-right",
    cell: (row) => (
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 cursor-pointer rounded-lg p-0 hover:bg-muted"
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="size-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-36 p-1">
            <DropdownMenuItem
              className="cursor-pointer p-0 focus:bg-transparent hover:bg-transparent"
              onSelect={(e) => e.preventDefault()}
            >
              <SemesterEditDialog semester={row} icon={Pencil} triggerText="Edit" />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];

export const SemesterPage = () => {
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const queryParams: SemesterSearch = {
    page,
    search: undefined,
    orderBy: "created_at",
    orderDir: "desc",
    school_year_start_from: dateRange?.from ? dateRange.from.getFullYear() : undefined,
    school_year_start_to: dateRange?.to ? dateRange.to.getFullYear() : undefined,
  };

  const {
    data: semesterResponse,
    isPending: isSemestersPending,
    isError: isSemestersError,
    error: semesterError,
  } = useSemesters(queryParams);

  const handleDateSelect = (range: DateRange | undefined) => {
    setDateRange(range);
    setPage(1);
  };

  const clearDateRange = () => {
    setDateRange(undefined);
    setPage(1);
  };

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Academic Semesters
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Manage academic years, terms, and date schedules for evaluation cycles.
          </p>
        </div>

        {/* ── Table Shell ─────────────────────────────────────────────────── */}
        <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
          <div className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Date Range Picker Filter */}
            <div className="flex items-center gap-2 w-full max-w-xs">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-full justify-start rounded-lg text-left text-xs font-normal border-border/60"
                  >
                    <CalendarIcon className="mr-2 size-3.5 text-muted-foreground" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span className="text-muted-foreground">Filter by date range...</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={handleDateSelect}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>

              {dateRange && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearDateRange}
                  className="h-8 rounded-lg px-2 text-xs"
                >
                  <X className="size-3.5" />
                </Button>
              )}
            </div>

            <SemesterCreateDialog icon={Plus} triggerText="Add Semester" />
          </div>

          <DataTable
            columns={columns}
            data={semesterResponse?.data ?? []}
            getRowId={(row) => row.id}
            isLoading={isSemestersPending}
            isError={isSemestersError}
            error={semesterError}
            emptyMessage="No academic semesters found for the selected date range."
          />

          {/* ── Pagination Footer ─────────────────────────────────────────── */}
          <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-muted-foreground">
            <span>
              {semesterResponse?.pagination
                ? `Page ${semesterResponse.pagination.currentPage} of ${semesterResponse.pagination.totalPage}`
                : "Loading page info..."}
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 rounded-lg"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!semesterResponse?.pagination?.hasPrev || isSemestersPending}
              >
                <ChevronLeft className="size-3.5" />
              </Button>
              <span className="flex h-7 min-w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-medium text-primary">
                {semesterResponse?.pagination?.currentPage ?? 1}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 rounded-lg"
                onClick={() => setPage((p) => p + 1)}
                disabled={!semesterResponse?.pagination?.hasNext || isSemestersPending}
              >
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SemesterPage;
