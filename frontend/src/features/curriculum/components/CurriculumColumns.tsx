import type { DataTableColumn } from "@/components/main-data-table";
import { CurriculumEditDialog } from "./CurriculumEdit";
import { CurriculumDeleteDialog } from "./CurriculumDelete";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

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

export const getCurriculumColumns = (): DataTableColumn<CurriculumColumnType>[] => [
  {
    header: "Code",
    cell: (item) => (
      <div className="w-24">
        <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold">
          {item.initialism}
        </span>
      </div>
    ),
  },
  {
    header: "Course Name",
    cell: (item) => (
      <div className="w-48">
        <span className="text-muted-foreground">{item.name}</span>
      </div>
    ),
  },
  {
    header: "Semester",
    cell: (item) => (
      <div className="w-24">
        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-xs font-medium">
          {item.semester_term} Semester
        </span>
      </div>
    ),
  },
  {
    header: "Actions",
    className: "text-right",
    cell: (item) => (
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8 cursor-pointer">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36 space-y-0.5">
            <CurriculumEditDialog curriculum={item} />
            <CurriculumDeleteDialog curriculum={item} triggerText="Remove" />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];
