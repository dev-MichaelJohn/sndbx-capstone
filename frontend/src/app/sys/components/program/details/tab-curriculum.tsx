import { useState } from "react";
import { useCurriculums, useDeleteCurriculum } from "@/features/sys/curriculum.service";
import { CurriculumCreateDialog } from "../../curriculum/curriculum-create";
import { DataTable } from "@/components/data-table";
import {
  getCurriculumColumns,
  type CurriculumColumnType,
} from "../../curriculum/curriculum-columns";

import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus } from "lucide-react";

interface CurriculumTabProps {
  programId: number;
}

const YEAR_LEVELS: Array<{ key: "I" | "II" | "III" | "IV" | "V"; label: string }> = [
  { key: "I", label: "FIRST YEAR" },
  { key: "II", label: "SECOND YEAR" },
  { key: "III", label: "THIRD YEAR" },
  { key: "IV", label: "FOURTH YEAR" },
  { key: "V", label: "FIFTH YEAR" },
];

export const CurriculumTab = ({ programId }: CurriculumTabProps) => {
  const [search, setSearch] = useState("");
  const [semesterFilter, setSemesterFilter] = useState<string>("ALL");

  const { data: paginatedData, isLoading } = useCurriculums({
    program_id: programId,
    search: search || undefined,
    semester_term: semesterFilter !== "ALL" ? (semesterFilter as any) : undefined,
    page: 1,
  });

  const { mutate: deleteCurriculum, isPending: isDeleting } = useDeleteCurriculum();

  const curriculums = (paginatedData?.data ?? []) as CurriculumColumnType[];

  const handleDelete = (id: number, initialism: string) => {
    if (confirm(`Are you sure you want to remove ${initialism} from the curriculum?`)) {
      deleteCurriculum(id);
    }
  };

  const columns = getCurriculumColumns({ onDelete: handleDelete, isDeleting });

  return (
    <Card className="overflow-hidden rounded-xl shadow-xs gap-0 pb-0">
      {/* ── Card Header / Search Toolbar ────────────────────────────────── */}
      <CardHeader className="flex items-center justify-between border-b px-6 flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 rounded-lg"
            />
          </div>

          <Select value={semesterFilter} onValueChange={setSemesterFilter}>
            <SelectTrigger className="h-8 w-75 rounded-lg text-xs">
              <SelectValue placeholder="All Semesters" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Semesters</SelectItem>
              <SelectItem value="1st">1st Semester</SelectItem>
              <SelectItem value="2nd">2nd Semester</SelectItem>
              <SelectItem value="Summer">Summer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <CurriculumCreateDialog
          programId={programId}
          icon={Plus}
          triggerText="Add Curriculum Item"
        />
      </CardHeader>

      {/* ── Card Content / Year Level Sections ──────────────────────────── */}
      <CardContent className="p-6">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            Loading curriculum records...
          </div>
        ) : curriculums.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            No curriculum entries found for this program.
          </div>
        ) : (
          <div className="space-y-6">
            {YEAR_LEVELS.map(({ key, label }) => {
              const levelData = curriculums.filter((item) => item.year_level === key);

              if (levelData.length === 0) return null;

              return (
                <div key={key} className="overflow-hidden rounded-xl border bg-card shadow-xs">
                  <div className="flex items-center justify-between border-b px-6 py-3.5 bg-muted/30">
                    <span className="text-xs font-semibold tracking-tight uppercase text-muted-foreground">
                      {label}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
                      {levelData.length} {levelData.length === 1 ? "course" : "courses"}
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
