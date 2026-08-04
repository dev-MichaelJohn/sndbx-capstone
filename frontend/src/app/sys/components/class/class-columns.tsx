import type { ColumnDef } from "@tanstack/react-table";
import { ClassEditDialog } from "./class-edit";
import { ClassDeleteDialog } from "./class-delete";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import type { ClassSelect } from "backend/types/class.type";
import { ClassManageItem } from "./class-manage";
import type { StudentClassWithDetails } from "backend/types/student-class.type";

interface GetClassColumnsProps {
  isDeleting?: boolean;
}

export const getClassColumns = ({}: GetClassColumnsProps): ColumnDef<ClassSelect>[] => [
  {
    accessorKey: "section",
    header: "Section",
    cell: ({ row }) => (
      <div className="w-48">
        <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold">
          Section {row.original.section}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "year_level",
    header: "Year Level",
    cell: ({ row }) => (
      <div className="w-48">
        <span className="text-muted-foreground font-medium">Year {row.original.year_level}</span>
      </div>
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
              <ClassManageItem classId={item.id} />
              <ClassEditDialog classData={item} />
              <ClassDeleteDialog classItem={item as unknown as StudentClassWithDetails} />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
