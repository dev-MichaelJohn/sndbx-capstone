import type { DataTableColumn } from "@/components/main-data-table";
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
}: GetClassStudentColumnsProps): DataTableColumn<ClassStudentWithDetails>[] => [
  {
    header: "Institutional ID",
    cell: (student) => (
      <span className="font-mono text-xs font-semibold">{student.institutional_id ?? "N/A"}</span>
    ),
  },
  {
    header: "Student Name",
    cell: (student) => <span className="font-medium">{student.student_name}</span>,
  },
  {
    header: "Program",
    cell: (student) => <span className="text-muted-foreground">{student.program_name}</span>,
  },
  {
    header: "Year & Section",
    cell: (student) => (
      <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold">
        Year {student.year_level} - {student.section}
      </span>
    ),
  },
  {
    header: "Actions",
    className: "text-right",
    cell: (student) => (
      <div className="text-right">
        <Button
          size="sm"
          variant="ghost"
          className="text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
          disabled={isDropping}
          onClick={() => onDrop(student.id, student.student_name)}
        >
          <UserMinus className="mr-1.5 size-4" />
          Drop
        </Button>
      </div>
    ),
  },
];
