import { useState, useMemo } from "react";
import { format, parseISO, isWithinInterval } from "date-fns";
import { Calendar as CalendarIcon, MoreHorizontal, Pencil, Plus, X } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader as UiCardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable, type DataTableColumn } from "@/components/main-data-table";
import { TablePagination } from "@/components/table-pagination";
import { ViewSwitcher, type ViewMode } from "@/components/ui/view-switcher";
import { PageHeader } from "@/components/ui/page-header";

import { useSemesters } from "../api/semester.service";
import { SemesterCreateDialog } from "../components/SemesterCreate";
import { SemesterEditDialog } from "../components/SemesterEdit";
import { SemesterCard } from "../components/SemesterCard";
import { ActiveTermBanner } from "../components/ActiveTermBanner";
import type { SemesterSearch, SemesterSelect } from "backend/types/semester.type";

// Helper function to calculate active status for table view
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

const getSemesterColumns = (): Array<DataTableColumn<SemesterSelect>> => [
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
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

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

  const semesters = useMemo(() => semesterResponse?.data ?? [], [semesterResponse?.data]);
  const columns = useMemo(() => getSemesterColumns(), []);

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
        {/* Header */}
        <PageHeader
          title="Academic Semesters"
          description="Manage academic years, terms, and date schedules for evaluation cycles."
          actions={<SemesterCreateDialog icon={Plus} triggerText="Add Semester" />}
        />

        {/* Active Term Spotlight Banner */}
        <ActiveTermBanner semesters={semesters} isLoading={isSemestersPending} />

        {/* Controls Bar & View Switcher */}
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 w-full max-w-xs">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-full justify-start rounded-lg text-left text-xs font-normal border-border/60 bg-card"
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

            <ViewSwitcher mode={viewMode} onChange={setViewMode} />
          </div>

          {/* Grid View vs Table View */}
          {viewMode === "grid" ? (
            isSemestersPending ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-36 rounded-xl border bg-card animate-pulse" />
                ))}
              </div>
            ) : semesters.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-dashed bg-card text-center text-xs text-muted-foreground">
                No academic semesters found for the selected date range.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {semesters.map((sem: SemesterSelect) => (
                  <SemesterCard key={sem.id} semester={sem} />
                ))}
              </div>
            )
          ) : (
            <Card className="overflow-hidden rounded-xl pb-0 shadow-2xs">
              <UiCardHeader className="hidden" />
              <CardContent className="p-0">
                <DataTable
                  columns={columns}
                  data={semesters}
                  getRowId={(row) => row.id}
                  isLoading={isSemestersPending}
                  isError={isSemestersError}
                  error={semesterError}
                  emptyMessage="No academic semesters found."
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <TablePagination
        pagination={semesterResponse?.pagination}
        isPending={isSemestersPending}
        onPageChange={setPage}
      />
    </div>
  );
};

export default SemesterPage;
