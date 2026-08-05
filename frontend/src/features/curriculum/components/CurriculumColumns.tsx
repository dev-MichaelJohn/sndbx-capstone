import type { DataTableColumn } from "@/components/main-data-table";
import { CurriculumEditDialog } from "./CurriculumEdit";
import { CurriculumDeleteDialog } from "./CurriculumDelete";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, BookOpen } from "lucide-react";

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
    header: "Course Details",
    className: "w-auto min-w-[240px]",
    cell: (item) => (
      <div className="flex items-center gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <BookOpen className="size-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-foreground">{item.name}</span>
          <span className="font-mono text-[11px] text-muted-foreground">{item.initialism}</span>
        </div>
      </div>
    ),
  },
  {
    header: "Semester Term",
    className: "w-40",
    cell: (item) => (
      <Badge variant="outline" className="font-mono text-[10px]">
        {item.semester_term} Semester
      </Badge>
    ),
  },
  {
    header: "Actions",
    className: "w-px whitespace-nowrap",
    cell: (item) => (
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8 cursor-pointer p-0">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 p-1">
            <DropdownMenuItem
              className="p-0 focus:bg-transparent hover:bg-transparent cursor-pointer"
              onSelect={(e) => e.preventDefault()}
            >
              <CurriculumEditDialog curriculum={item} />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="p-0 focus:bg-transparent hover:bg-transparent cursor-pointer"
              onSelect={(e) => e.preventDefault()}
            >
              <CurriculumDeleteDialog curriculum={item} triggerText="Remove" />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];
