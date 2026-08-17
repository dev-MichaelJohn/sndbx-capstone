import { useEffect } from "react";
import { Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSemesters } from "@/features/semester/api/semester.service";

interface AnalyticsHeaderProps {
  selectedSemesterId?: number;
  onSemesterChange: (semesterId?: number) => void;
}

export const AnalyticsHeader = ({ selectedSemesterId, onSemesterChange }: AnalyticsHeaderProps) => {
  const { data: semesterResponse, isLoading } = useSemesters({
    search: undefined,
    page: 1,
    orderBy: "id",
    orderDir: "desc",
  });

  const semesters = semesterResponse?.data ?? [];

  // Default to the current active semester once semesters load
  useEffect(() => {
    if (semesters.length > 0 && selectedSemesterId === undefined) {
      onSemesterChange(semesters[0].id);
    }
  }, [semesters, selectedSemesterId, onSemesterChange]);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Evaluation Analytics</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Institutional performance insights, sentiment breakdown, and evaluation rankings
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Calendar className="size-3.5 text-muted-foreground" />
        <Select
          value={selectedSemesterId ? String(selectedSemesterId) : "ALL"}
          onValueChange={(val) => onSemesterChange(val === "ALL" ? undefined : Number(val))}
          disabled={isLoading}
        >
          <SelectTrigger className="h-8 w-56 text-xs rounded-lg bg-card">
            <SelectValue placeholder={isLoading ? "Loading terms..." : "Select Semester"} />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="ALL" className="text-xs font-medium">
              All Semesters
            </SelectItem>
            {semesters.map((s) => (
              <SelectItem key={s.id} value={String(s.id)} className="text-xs">
                A.Y. {s.school_year_start}–{s.school_year_end} ({s.semester_term} Term)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
