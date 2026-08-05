import type { DataTableColumn } from "@/components/main-data-table";
import type { CourseOfferingWithDetails } from "backend/types/offerings.type";
import { Button } from "@/components/ui/button";
import { Edit, MoreHorizontal, Users, BookOpen } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatFullName } from "@/lib/nameFormatter";
import { CourseOfferingDeleteDialog } from "./OfferingDelete";

export interface GetCourseOfferingColumnsProps {
  onEdit: (offering: CourseOfferingWithDetails) => void;
  onViewStudents: (offering: CourseOfferingWithDetails) => void;
  isDeleting?: boolean;
}

export const getCourseOfferingColumns = ({
  onEdit,
  onViewStudents,
  isDeleting,
}: GetCourseOfferingColumnsProps): DataTableColumn<CourseOfferingWithDetails>[] => [
  {
    header: "Course",
    cell: (row) => (
      <div className="flex items-center gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <BookOpen className="size-4" />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-semibold tracking-tight text-foreground">
            {row.course_name}
          </span>
          <span className="font-mono text-[10px] font-medium text-muted-foreground/80">
            {row.course_initialism}
          </span>
        </div>
      </div>
    ),
  },
  {
    header: "Instructor",
    cell: (row) => {
      const hasFaculty = row.first_name && row.last_name;
      const fullName = hasFaculty
        ? formatFullName({
            first_name: row.first_name!,
            middle_name: row.middle_name ?? "",
            last_name: row.last_name!,
            suffix: row.suffix ?? "",
          })
        : "Unassigned";

      const initials = hasFaculty ? `${row.first_name![0]}${row.last_name![0]}` : "?";

      return (
        <div className="flex items-center gap-2.5">
          <div
            className={`flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
              hasFaculty ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground/60"
            }`}
          >
            {initials}
          </div>
          <span
            className={`text-xs ${
              hasFaculty ? "font-medium text-foreground" : "text-muted-foreground/60 italic"
            }`}
          >
            {fullName}
          </span>
        </div>
      );
    },
  },
  {
    header: "Term & Year",
    cell: (row) => (
      <div className="inline-flex items-center gap-1.5 rounded-md border border-border/50 bg-muted/30 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
        <span>Year {row.year_level}</span>
        <span className="text-muted-foreground/30">•</span>
        <span className="text-foreground/80">{row.semester_term} Term</span>
      </div>
    ),
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
              size="icon"
              className="size-8 cursor-pointer rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              disabled={isDeleting}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 rounded-xl">
            <DropdownMenuItem
              onClick={() => onViewStudents(row)}
              className="cursor-pointer text-xs"
            >
              <Users className="mr-2 size-3.5 text-muted-foreground" /> View Students
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(row)} className="cursor-pointer text-xs">
              <Edit className="mr-2 size-3.5 text-muted-foreground" /> Edit Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <CourseOfferingDeleteDialog offering={row} />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];
