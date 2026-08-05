import type { ReactNode } from "react";
import type { CourseOfferingWithDetails } from "backend/types/offerings.type";
import { Button } from "@/components/ui/button";
import { Edit, MoreHorizontal, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatFullName } from "@/lib/nameFormatter";
import { CourseOfferingDeleteDialog } from "./OfferingDelete";

export interface DataTableColumn<T> {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
}

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
    header: "Course Name",
    cell: (row) => <span>{row.course_name}</span>,
  },
  {
    header: "Course Initialism",
    cell: (row) => <span>{row.course_initialism}</span>,
  },
  {
    header: "Instructor",
    cell: (row) => {
      const hasFaculty = row.first_name && row.last_name;
      return (
        <span className={!hasFaculty ? "text-muted-foreground italic" : "font-medium"}>
          {hasFaculty
            ? formatFullName({
                first_name: row.first_name!,
                middle_name: row.middle_name ?? "",
                last_name: row.last_name!,
                suffix: row.suffix ?? "",
              })
            : "Unassigned"}
        </span>
      );
    },
  },
  {
    header: "Year & Term",
    cell: (row) => (
      <span>
        {row.year_level} - {row.semester_term}
      </span>
    ),
  },
  {
    header: "Actions",
    className: "text-right",
    cell: (row) => (
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer" disabled={isDeleting}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onViewStudents(row)} className="cursor-pointer">
              <Users className="mr-2 h-3.5 w-3.5" /> View Students
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(row)} className="cursor-pointer">
              <Edit className="mr-2 h-3.5 w-3.5" /> Edit
            </DropdownMenuItem>
            <CourseOfferingDeleteDialog offering={row} />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];
