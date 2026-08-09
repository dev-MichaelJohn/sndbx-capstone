import { useState } from "react";
import { useClasses, useDeleteClass } from "../api/class.service";
import { ClassCreateDialog } from "./ClassCreate";
import { DataTable } from "@/components/data-table";
import { getClassColumns } from "./ClassColumns";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import type { ClassSelect } from "backend/types/class.type";
import { CSVImportDialog } from "@/features/bulk-import/components/CSVImportDialog";

interface ClassesTabProps {
  programId: number;
}

const YEAR_LEVELS: Array<{ key: "I" | "II" | "III" | "IV" | "V"; label: string }> = [
  { key: "I", label: "FIRST YEAR" },
  { key: "II", label: "SECOND YEAR" },
  { key: "III", label: "THIRD YEAR" },
  { key: "IV", label: "FOURTH YEAR" },
  { key: "V", label: "FIFTH YEAR" },
];

const SECTIONS = ["A", "B", "C", "D", "E", "F"];

export const ClassesTab = ({ programId }: ClassesTabProps) => {
  const [search, _setSearch] = useState("");
  const [yearLevelFilter, setYearLevelFilter] = useState<string>("ALL");
  const [sectionFilter, setSectionFilter] = useState<string>("ALL");

  const {
    data: paginatedData,
    isLoading,
    refetch,
  } = useClasses({
    program_id: programId,
    search: search || undefined,
    year_level: yearLevelFilter !== "ALL" ? (yearLevelFilter as any) : undefined,
    section: sectionFilter !== "ALL" ? (sectionFilter as any) : undefined,
    page: 1,
  });

  const { isPending: isDeleting } = useDeleteClass();

  const classesData = (paginatedData?.data ?? []) as ClassSelect[];

  const columns = getClassColumns({ isDeleting });

  return (
    <Card className="overflow-hidden rounded-xl shadow-xs gap-0 pb-0">
      {/* ── Card Header / Search Toolbar ────────────────────────────────── */}
      <CardHeader className="flex items-center justify-between border-b px-6 flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Select value={yearLevelFilter} onValueChange={setYearLevelFilter}>
            <SelectTrigger className="h-8 w-40 rounded-lg text-xs">
              <SelectValue placeholder="All Year Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Year Levels</SelectItem>
              <SelectItem value="I">1st Year</SelectItem>
              <SelectItem value="II">2nd Year</SelectItem>
              <SelectItem value="III">3rd Year</SelectItem>
              <SelectItem value="IV">4th Year</SelectItem>
              <SelectItem value="V">5th Year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sectionFilter} onValueChange={setSectionFilter}>
            <SelectTrigger className="h-8 w-32 rounded-lg text-xs">
              <SelectValue placeholder="All Sections" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Sections</SelectItem>
              {SECTIONS.map((sec) => (
                <SelectItem key={sec} value={sec}>
                  Section {sec}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <CSVImportDialog
            entity="classes"
            title="Import Classes"
            defaultContext={{ program_id: programId }}
            onSuccess={() => refetch()}
          />
          <ClassCreateDialog programId={programId} icon={Plus} triggerText="Create Class" />
        </div>
      </CardHeader>

      {/* ── Card Content / Year Level Sections ──────────────────────────── */}
      <CardContent className="p-6">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            Loading active classes...
          </div>
        ) : classesData.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            No active classes found for this program.
          </div>
        ) : (
          <div className="space-y-6">
            {YEAR_LEVELS.map(({ key, label }) => {
              const levelData = classesData.filter((item) => item.year_level === key);

              if (levelData.length === 0) return null;

              return (
                <div key={key} className="overflow-hidden rounded-xl border bg-card shadow-xs">
                  <div className="flex items-center justify-between border-b px-6 py-3.5 bg-muted/30">
                    <span className="text-xs font-semibold tracking-tight uppercase text-muted-foreground">
                      {label}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
                      {levelData.length} {levelData.length === 1 ? "class" : "classes"}
                    </span>
                  </div>
                  <div className="p-0">
                    <DataTable columns={columns} data={levelData} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
