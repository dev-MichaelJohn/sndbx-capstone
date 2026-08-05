import { useState } from "react";
import { useCourses } from "../api/course.service";
import { DataTable, type DataTableColumn } from "@/components/main-data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  BookMarked,
} from "lucide-react";
import type { CourseSelect } from "backend/types/course.type";
import { CourseCreateDialog } from "./CourseCreate";
import { CourseEditDialog } from "./CourseEdit";
import { CourseDeleteDialog } from "./CourseDelete";

interface ProgramCoursesTabProps {
  programId: number;
}

export const ProgramCoursesTab = ({ programId }: ProgramCoursesTabProps) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const {
    data: coursesData,
    isLoading,
    isError,
    error,
  } = useCourses({
    program_id: programId,
    search: search.trim() || undefined,
    page,
    orderBy: "id",
    orderDir: "asc",
  });

  const courses = coursesData?.data ?? [];
  const pagination = coursesData?.pagination;

  const columns: Array<DataTableColumn<CourseSelect>> = [
    {
      header: "Course Details",
      className: "w-auto min-w-[240px]",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BookMarked className="size-4" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold tracking-tight text-foreground">{row.name}</span>
            <span className="inline-block font-mono text-[10px] font-medium text-muted-foreground/80">
              {row.initialism}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Actions",
      className: "w-px whitespace-nowrap text-right",
      cell: (row) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 cursor-pointer rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <MoreHorizontal className="size-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-40 rounded-xl p-1">
              <DropdownMenuItem
                className="cursor-pointer p-0 focus:bg-transparent hover:bg-transparent"
                onSelect={(e) => e.preventDefault()}
              >
                <CourseEditDialog course={row} />
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="cursor-pointer p-0 focus:bg-transparent hover:bg-transparent"
                onSelect={(e) => e.preventDefault()}
              >
                <CourseDeleteDialog course={row} icon={Trash2} triggerText="Delete" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
      {/* Search & Action Toolbar */}
      <div className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="h-8 rounded-lg pl-8 text-xs"
          />
        </div>

        <CourseCreateDialog icon={Plus} triggerText="Add Course" programId={programId} />
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={courses}
        getRowId={(row) => String(row.id)}
        isLoading={isLoading}
        isError={isError}
        error={error}
        emptyMessage="No courses found for this program."
      />

      {/* Pagination Footer */}
      <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-muted-foreground">
        <span>
          {pagination
            ? `Page ${pagination.currentPage} of ${pagination.totalPage}`
            : "Loading page info..."}
        </span>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 rounded-lg"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!pagination?.hasPrev || isLoading}
          >
            <ChevronLeft className="size-3.5" />
          </Button>
          <span className="flex h-7 min-w-[28px] items-center justify-center rounded-lg bg-primary/10 text-xs font-medium text-primary">
            {pagination?.currentPage ?? 1}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 rounded-lg"
            onClick={() => setPage((p) => p + 1)}
            disabled={!pagination?.hasNext || isLoading}
          >
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
