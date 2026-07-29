import { useState } from "react";
import { useCourses } from "@/features/sys/course.service";
import { DataTable, type DataTableColumn } from "@/components/main-data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronLeft, ChevronRight, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react";
import type { CourseSelect } from "backend/types/course.type";
import { CourseCreateDialog } from "../../course/course-create";
import { CourseEditDialog } from "../../course/course-edit";
import { CourseDeleteDialog } from "../../course/course-delete";

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
      header: "Code",
      className: "w-24",
      cell: (row) => (
        <Badge variant="outline" className="font-mono text-sm">
          {row.initialism}
        </Badge>
      ),
    },
    {
      header: "Course Name",
      className: "w-auto",
      cell: (row) => row.name,
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
                <CourseEditDialog course={row} />
              </DropdownMenuItem>

              <DropdownMenuItem
                className="p-0 focus:bg-transparent hover:bg-transparent cursor-pointer"
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
    <Card className="overflow-hidden rounded-xl shadow-xs gap-0 pb-0">
      {/* ── Card Header / Search Toolbar ────────────────────────────────── */}
      <CardHeader className="flex items-center justify-between border-b px-6 flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="h-8 rounded-lg pl-8"
          />
        </div>

        <CourseCreateDialog icon={Plus} triggerText="Add Course" programId={programId} />
      </CardHeader>

      {/* ── Table Content ──────────────────────────────────────────────── */}
      <CardContent className="p-0">
        <DataTable
          columns={columns}
          data={courses}
          getRowId={(row) => String(row.id)}
          isLoading={isLoading}
          isError={isError}
          error={error}
          emptyMessage="No courses found for this program."
        />
      </CardContent>

      {/* ── Pagination Footer (Inside the Tab Card) ──────────────────────── */}
      <div className="shrink-0 border-t bg-card px-6 py-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {pagination
              ? `Page ${pagination.currentPage} of ${pagination.totalPage}`
              : "Loading page info..."}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 rounded-lg p-0"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!pagination?.hasPrev || isLoading}
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-medium text-primary">
              {pagination?.currentPage ?? 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 rounded-lg p-0"
              onClick={() => setPage((p) => p + 1)}
              disabled={!pagination?.hasNext || isLoading}
            >
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
