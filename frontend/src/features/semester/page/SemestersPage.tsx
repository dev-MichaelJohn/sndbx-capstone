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

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
      return { label: "Active", variant: "default" as const };
    }
    if (today < start) {
      return { label: "Upcoming", variant: "outline" as const };
    }
    return { label: "Ended", variant: "secondary" as const };
  } catch {
    return { label: "Unknown", variant: "destructive" as const };
  }
};

const columns: Array<DataTableColumn<SemesterSelect>> = [
  {
    header: "School Year",
    className: "w-40 font-medium",
    cell: (row) => `SY ${row.school_year_start}–${Number(row.school_year_start) + 1}`,
  },
  {
    header: "Term",
    className: "w-36",
    cell: (row) => `${row.semester_term} Semester`,
  },
  {
    header: "Start Date",
    className: "w-auto",
    cell: (row) => row.start_date,
  },
  {
    header: "End Date",
    className: "w-auto",
    cell: (row) => row.end_date,
  },
  {
    header: "Status",
    className: "w-28",
    cell: (row) => {
      const status = getSemesterStatus(row.start_date, row.end_date);
      return (
        <Badge variant={status.variant} className="rounded-md">
          {status.label}
        </Badge>
      );
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
            <DropdownMenuItem
              className="p-0 focus:bg-transparent hover:bg-transparent cursor-pointer"
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
          <h1 className="text-2xl font-semibold tracking-tight">Academic Semesters</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage academic years, terms, and date schedules for evaluation cycles.
          </p>
        </div>

        {/* ── Table Section ───────────────────────────────────────────────── */}
        <Card className="overflow-hidden rounded-xl shadow-xs gap-0 pb-0">
          <CardHeader className="flex items-center justify-between border-b px-6 flex-col gap-2.5 sm:flex-row sm:items-center">
            {/* Date Range Picker Filter */}
            <div className="flex items-center gap-2 w-full max-w-xs">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-full justify-start text-left font-normal text-xs rounded-lg"
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
                  className="h-8 px-2 text-xs"
                >
                  <X className="size-3.5" />
                </Button>
              )}
            </div>

            <SemesterCreateDialog icon={Plus} triggerText="Add Semester" />
          </CardHeader>

          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={semesterResponse?.data ?? []}
              getRowId={(row) => row.id}
              isLoading={isSemestersPending}
              isError={isSemestersError}
              error={semesterError}
              emptyMessage="No academic semesters found for the selected date range."
            />
          </CardContent>
        </Card>
      </div>

      {/* ── Pagination Footer ─────────────────────────────────────────────── */}
      <div className="shrink-0 border-t bg-card px-6 py-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {semesterResponse?.pagination
              ? `Page ${semesterResponse.pagination.currentPage} of ${semesterResponse.pagination.totalPage}`
              : "Loading page info..."}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 rounded-lg p-0"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!semesterResponse?.pagination?.hasPrev || isSemestersPending}
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-medium text-primary">
              {semesterResponse?.pagination?.currentPage ?? 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 rounded-lg p-0"
              onClick={() => setPage((p) => p + 1)}
              disabled={!semesterResponse?.pagination?.hasNext || isSemestersPending}
            >
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SemesterPage;
