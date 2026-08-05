import type { ColumnDef } from "@tanstack/react-table";
import { ClassEditDialog } from "./ClassEdit";
import { ClassDeleteDialog } from "./ClassDelete";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Layers, Calendar } from "lucide-react";
import type { ClassSelect } from "backend/types/class.type";
import { ClassManageItem } from "./ClassManage.tsx";
import type { StudentClassWithDetails } from "backend/types/student-class.type";

interface GetClassColumnsProps {
  isDeleting?: boolean;
}

export const getClassColumns = ({}: GetClassColumnsProps): ColumnDef<ClassSelect>[] => [
  {
    accessorKey: "section",
    header: "Class Section",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
          <Layers className="size-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-foreground">
            Section {row.original.section}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">Active Section</span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "year_level",
    header: "Year Level",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Calendar className="size-3.5 text-muted-foreground/70" />
        <Badge variant="outline" className="font-mono text-[10px]">
          Year {row.original.year_level}
        </Badge>
      </div>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const item = row.original;

      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 p-1">
              <DropdownMenuItem className="p-0 focus:bg-transparent hover:bg-transparent cursor-pointer">
                <ClassManageItem classId={item.id} />
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="p-0 focus:bg-transparent hover:bg-transparent cursor-pointer"
                onSelect={(e) => e.preventDefault()}
              >
                <ClassEditDialog classData={item} />
              </DropdownMenuItem>
              <DropdownMenuItem
                className="p-0 focus:bg-transparent hover:bg-transparent cursor-pointer"
                onSelect={(e) => e.preventDefault()}
              >
                <ClassDeleteDialog classItem={item as unknown as StudentClassWithDetails} />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
