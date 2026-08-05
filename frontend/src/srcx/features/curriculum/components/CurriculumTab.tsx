import { useState } from "react";
import { useCurriculums } from "../api/curriculum.service";
import { CurriculumCreateDialog } from "./CurriculumCreate";
import { DataTable } from "@/components/main-data-table";
import { getCurriculumColumns, type CurriculumColumnType } from "./CurriculumColumns.tsx";

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
  const [yearLevelFilter, setYearLevelFilter] = useState<string>("ALL");

  const {
    data: paginatedData,
    isLoading,
    isError,
    error,
  } = useCurriculums({
    program_id: programId,
    search: search || undefined,
    semester_term: semesterFilter !== "ALL" ? (semesterFilter as any) : undefined,
    year_level: yearLevelFilter !== "ALL" ? (yearLevelFilter as any) : undefined,
    page: 1,
  });

  const curriculums = (paginatedData?.data ?? []) as CurriculumColumnType[];

  const columns = getCurriculumColumns();

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

          <Select value={yearLevelFilter} onValueChange={setYearLevelFilter}>
            <SelectTrigger className="h-8 w-40 rounded-lg text-xs cursor-pointer">
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

          <Select value={semesterFilter} onValueChange={setSemesterFilter}>
            <SelectTrigger className="h-8 w-40 rounded-lg text-xs cursor-pointer">
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
        {curriculums.length === 0 && !isLoading && !isError ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            No curriculum entries found for this program.
          </div>
        ) : (
          <div className="space-y-6">
            {YEAR_LEVELS.map(({ key, label }) => {
              const levelData = curriculums.filter((item) => item.year_level === key);

              if (levelData.length === 0 && !isLoading) return null;

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
                    <DataTable
                      columns={columns}
                      data={levelData}
                      getRowId={(row) => row.id}
                      isLoading={isLoading}
                      isError={isError}
                      error={error}
                      emptyMessage="No courses assigned for this year level."
                    />
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
