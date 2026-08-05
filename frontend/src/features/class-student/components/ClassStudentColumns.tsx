import type { DataTableColumn } from "@/components/main-data-table";
import type { ClassStudentWithDetails } from "backend/types/class-student.type";
import { Button } from "@/components/ui/button";
import { UserMinus } from "lucide-react";

interface GetClassStudentColumnsProps {
  onDrop: (id: number, studentName: string) => void;
  isDropping: boolean;
}

const getInitials = (name: string) => {
  if (!name) return "ST";

  // Handles "LastName, FirstName" format (e.g. "Dela Cruz, Juan" -> "JD")
  if (name.includes(",")) {
    const [lastName, firstName] = name.split(",").map((s) => s.trim());
    const firstInitial = firstName ? firstName[0] : "";
    const lastInitial = lastName ? lastName[0] : "";
    return `${firstInitial}${lastInitial}`.toUpperCase() || "ST";
  }

  // Fallback for "FirstName LastName" format (e.g. "Juan Dela Cruz" -> "JD")
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    const firstInitial = parts[0][0];
    const lastInitial = parts[parts.length - 1][0];
    return `${firstInitial}${lastInitial}`.toUpperCase();
  }

  return parts[0].slice(0, 2).toUpperCase();
};

export const getClassStudentColumns = ({
  onDrop,
  isDropping,
}: GetClassStudentColumnsProps): DataTableColumn<ClassStudentWithDetails>[] => [
  {
    header: "Institutional ID",
    cell: (student) => (
      <span className="inline-block rounded-md border border-border/40 bg-muted/50 px-2 py-0.5 font-mono text-[11px] font-semibold text-foreground/90">
        {student.institutional_id ?? "N/A"}
      </span>
    ),
  },
  {
    header: "Student Name",
    cell: (student) => {
      const initials = getInitials(student.student_name);

      return (
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
            {initials}
          </div>
          <span className="text-xs font-semibold tracking-tight text-foreground">
            {student.student_name}
          </span>
        </div>
      );
    },
  },
  {
    header: "Program",
    cell: (student) => (
      <span className="text-xs font-medium text-muted-foreground">{student.program_name}</span>
    ),
  },
  {
    header: "Year & Section",
    cell: (student) => (
      <div className="inline-flex items-center gap-1.5 rounded-md border border-border/50 bg-muted/30 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
        <span>Year {student.year_level}</span>
        <span className="text-muted-foreground/30">•</span>
        <span className="text-foreground/80">Section {student.section}</span>
      </div>
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
          className="h-7 cursor-pointer rounded-lg px-2.5 text-xs font-medium text-destructive/80 hover:bg-destructive/10 hover:text-destructive"
          disabled={isDropping}
          onClick={() => onDrop(student.id, student.student_name)}
        >
          <UserMinus className="mr-1.5 size-3.5" />
          Drop
        </Button>
      </div>
    ),
  },
];
