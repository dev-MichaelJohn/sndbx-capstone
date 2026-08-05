import type { StudentClassWithDetails } from "backend/types/student-class.type";
import type { DataTableColumn } from "@/components/main-data-table";
import { Button } from "@/components/ui/button";
import { UserMinus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface GetStudentClassColumnsProps {
  onDrop: (record: StudentClassWithDetails) => void;
  isDropping?: boolean;
}

export const getStudentClassColumns = ({
  onDrop,
  isDropping,
}: GetStudentClassColumnsProps): DataTableColumn<StudentClassWithDetails>[] => [
  {
    header: "Institutional ID",
    className: "w-40 font-mono text-xs font-medium",
    cell: (row) => row.institutional_id || "N/A",
  },
  {
    header: "Student Name",
    className: "w-auto font-medium text-xs text-foreground",
    cell: (row) => row.student_name,
  },
  {
    header: "Program",
    className: "w-auto text-xs text-muted-foreground",
    cell: (row) => row.program_name,
  },
  {
    header: "Class & Section",
    className: "w-48",
    cell: (row) => (
      <Badge variant="secondary" className="text-[10px] px-2 py-0.5 rounded-md font-medium">
        Year {row.class_year_level} - {row.class_section}
      </Badge>
    ),
  },
  {
    header: "Actions",
    className: "w-px whitespace-nowrap text-right",
    cell: (row) => (
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          disabled={isDropping}
          onClick={() => onDrop(row)}
          className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
        >
          <UserMinus className="mr-1.5 size-3.5" />
          Drop
        </Button>
      </div>
    ),
  },
];
