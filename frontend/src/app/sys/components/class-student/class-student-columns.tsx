import type { ColumnDef } from "@tanstack/react-table";
import type { ClassStudentWithDetails } from "backend/types/class-student.type";
import { Button } from "@/components/ui/button";
import { UserMinus } from "lucide-react";

interface GetClassStudentColumnsProps {
  onDrop: (id: number, studentName: string) => void;
  isDropping: boolean;
}

export const getClassStudentColumns = ({
  onDrop,
  isDropping,
}: GetClassStudentColumnsProps): ColumnDef<ClassStudentWithDetails>[] => [
  {
    accessorKey: "institutional_id",
    header: "Institutional ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs font-semibold">
        {row.original.institutional_id ?? "N/A"}
      </span>
    ),
  },
  {
    accessorKey: "student_name",
    header: "Student Name",
    cell: ({ row }) => <span className="font-medium">{row.original.student_name}</span>,
  },
  {
    accessorKey: "program_name",
    header: "Program",
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.program_name}</span>,
  },
  {
    id: "year_section",
    header: "Year & Section",
    cell: ({ row }) => (
      <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold">
        Year {row.original.year_level} - {row.original.section}
      </span>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="text-right">
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            disabled={isDropping}
            onClick={() => onDrop(item.id, item.student_name)}
          >
            <UserMinus className="mr-1.5 size-4" />
            Drop
          </Button>
        </div>
      );
    },
  },
];
