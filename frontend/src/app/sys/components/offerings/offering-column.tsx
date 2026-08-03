import type { ColumnDef } from "@tanstack/react-table";
import type { CourseOfferingWithDetails } from "backend/types/offerings.type";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

interface GetCourseOfferingColumnsProps {
  onEdit: (offering: CourseOfferingWithDetails) => void;
  onDelete: (id: number, courseName: string) => void;
  isDeleting: boolean;
}

export const getCourseOfferingColumns = ({
  onEdit,
  onDelete,
  isDeleting,
}: GetCourseOfferingColumnsProps): ColumnDef<CourseOfferingWithDetails>[] => [
  {
    accessorKey: "course_initialism",
    header: "Code",
    cell: ({ row }) => (
      <span className="font-mono text-xs font-semibold">{row.original.course_initialism}</span>
    ),
  },
  {
    accessorKey: "course_name",
    header: "Course Name",
    cell: ({ row }) => <span className="font-medium">{row.original.course_name}</span>,
  },
  {
    accessorKey: "year_level",
    header: "Year / Term",
    cell: ({ row }) => (
      <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold">
        Year {row.original.year_level} - {row.original.semester_term}
      </span>
    ),
  },
  {
    accessorKey: "faculty_id",
    header: "Faculty ID",
    cell: ({ row }) => (
      <span className="text-muted-foreground font-mono text-xs">
        {row.original.faculty_id ? `#${row.original.faculty_id}` : "Unassigned"}
      </span>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex justify-end items-center gap-1">
          <Button size="sm" variant="ghost" onClick={() => onEdit(item)}>
            <Pencil className="mr-1 size-3.5" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            disabled={isDeleting}
            onClick={() => onDelete(item.id, item.course_name)}
          >
            <Trash2 className="mr-1 size-3.5" />
            Delete
          </Button>
        </div>
      );
    },
  },
];
