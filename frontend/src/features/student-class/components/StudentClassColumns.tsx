import type { StudentClassWithDetails } from "backend/types/student-class.type";
import type { DataTableColumn } from "@/components/main-data-table";
import { Button } from "@/components/ui/button";
import { UserMinus } from "lucide-react";

export interface GetStudentClassColumnsProps {
  onDrop: (record: StudentClassWithDetails) => void;
  isDropping?: boolean;
  officialStudentAccountIds?: Set<number>;
}

const getInitials = (name: string) => {
  if (!name) return "ST";

  if (name.includes(",")) {
    const [lastName, firstName] = name.split(",").map((s) => s.trim());
    const firstInitial = firstName ? firstName[0] : "";
    const lastInitial = lastName ? lastName[0] : "";
    return `${firstInitial}${lastInitial}`.toUpperCase() || "ST";
  }

  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    const firstInitial = parts[0][0];
    const lastInitial = parts[parts.length - 1][0];
    return `${firstInitial}${lastInitial}`.toUpperCase();
  }

  return parts[0].slice(0, 2).toUpperCase();
};

export const getStudentClassColumns = ({
  onDrop,
  isDropping,
  officialStudentAccountIds,
}: GetStudentClassColumnsProps): DataTableColumn<StudentClassWithDetails>[] => [
  {
    header: "Institutional ID",
    cell: (row) => (
      <span className="inline-block rounded-md border border-border/40 bg-muted/50 px-2 py-0.5 font-mono text-[11px] font-semibold text-foreground/90">
        {row.institutional_id || "N/A"}
      </span>
    ),
  },
  {
    header: "Student Name",
    cell: (row) => {
      const initials = getInitials(row.student_name);

      return (
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
            {initials}
          </div>
          <span className="text-xs font-semibold tracking-tight text-foreground">
            {row.student_name}
          </span>
        </div>
      );
    },
  },
  {
    header: "Enrollment Type",
    cell: (row) => {
      const isRegular = officialStudentAccountIds?.has(row.student_account_id);

      return isRegular ? (
        <span className="inline-flex items-center rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-500">
          Regular
        </span>
      ) : (
        <span className="inline-flex items-center rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-500">
          Cross-Enrolled
        </span>
      );
    },
  },
  {
    header: "Home Class",
    cell: (row) => (
      <div className="inline-flex items-center gap-1.5 rounded-md border border-border/50 bg-muted/30 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
        <span>{row.program_name}</span>
        <span className="text-muted-foreground/30">•</span>
        <span>
          Year {row.class_year_level}-{row.class_section}
        </span>
      </div>
    ),
  },
  {
    header: "Actions",
    className: "text-right",
    cell: (row) => (
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          disabled={isDropping}
          onClick={() => onDrop(row)}
          className="h-7 cursor-pointer rounded-lg px-2.5 text-xs font-medium text-destructive/80 hover:bg-destructive/10 hover:text-destructive"
        >
          <UserMinus className="mr-1.5 size-3.5" />
          Drop
        </Button>
      </div>
    ),
  },
];
