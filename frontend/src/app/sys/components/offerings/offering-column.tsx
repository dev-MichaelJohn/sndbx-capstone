import type { ReactNode } from "react";
import type { CourseOfferingWithDetails } from "backend/types/offerings.type";
import { Button } from "@/components/ui/button";
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface DataTableColumn<T> {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
}

export interface GetCourseOfferingColumnsProps {
  onEdit: (offering: CourseOfferingWithDetails) => void;
  onDelete: (offering: CourseOfferingWithDetails) => void;
  isDeleting?: boolean;
}

export const getCourseOfferingColumns = ({
  onEdit,
  onDelete,
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
            <DropdownMenuItem onClick={() => onEdit(row)} className="cursor-pointer">
              <Edit className="mr-2 h-3.5 w-3.5" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(row)}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <Trash className="mr-2 h-3.5 w-3.5" /> Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];
