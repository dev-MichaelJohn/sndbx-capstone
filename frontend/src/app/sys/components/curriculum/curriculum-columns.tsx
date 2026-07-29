import type { ColumnDef } from "@tanstack/react-table";
import { CurriculumEditDialog } from "./curriculum-edit";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2 } from "lucide-react";

export type CurriculumColumnType = {
  id: number;
  course_id: number;
  program_id: number;
  year_level: "I" | "II" | "III" | "IV" | "V";
  semester_term: "1st" | "2nd" | "Summer";
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  name: string;
  initialism: string;
};

interface GetCurriculumColumnsProps {
  onDelete: (id: number, initialism: string) => void;
  isDeleting: boolean;
}

export const getCurriculumColumns = ({
  onDelete,
  isDeleting,
}: GetCurriculumColumnsProps): ColumnDef<CurriculumColumnType>[] => [
  {
    accessorKey: "initialism",
    header: "Code",
    cell: ({ row }) => (
      <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold">
        {row.original.initialism}
      </span>
    ),
  },
  {
    accessorKey: "name",
    header: "Course Name",
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.name}</span>,
  },
  {
    accessorKey: "semester_term",
    header: "Semester",
    cell: ({ row }) => (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-xs font-medium">
        {row.original.semester_term} Semester
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <CurriculumEditDialog curriculum={item} />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive cursor-pointer"
                disabled={isDeleting}
                onSelect={() => onDelete(item.id, item.initialism)}
              >
                <Trash2 className="mr-2 size-3.5" />
                <span>Remove</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
