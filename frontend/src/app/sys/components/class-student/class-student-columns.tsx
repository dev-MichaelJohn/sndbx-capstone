import type { ColumnDef } from "@tanstack/react-table";
import type { ClassStudentWithDetails } from "backend/types/class-student.type";
import { Button } from "@/components/ui/button";
import { UserMinus } from "lucide-react";

interface GetClassStudentColumnsProps {
  onDrop: (id: number, studentName: string) => void;
  isDropping: boolean;
}

export function getClassStudentColumns({
  onDrop,
  isDropping,
}: GetClassStudentColumnsProps): ColumnDef<ClassStudentWithDetails>[] {
  return [
    {
      accessorKey: "institutional_id",
      header: "Institutional ID",
      cell: ({ row }) => (
        <span className="font-mono text-xs font-medium">
          {row.original.institutional_id || "N/A"}
        </span>
      ),
    },
    {
      accessorKey: "student_name",
      header: "Student Name",
      cell: ({ row }) => (
        <span className="font-medium text-xs text-foreground">{row.original.student_name}</span>
      ),
    },
    {
      accessorKey: "program_name",
      header: "Program",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">{row.original.program_name}</span>
      ),
    },
    {
      id: "class_info",
      header: "Yr / Section",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          Year {row.original.year_level} — {row.original.section}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
            disabled={isDropping}
            onClick={() => onDrop(row.original.id, row.original.student_name)}
          >
            <UserMinus className="mr-1 size-3.5" />
            Drop
          </Button>
        </div>
      ),
    },
  ];
}
