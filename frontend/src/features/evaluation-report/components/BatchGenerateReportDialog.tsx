import { useState } from "react";
import { Sparkles } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSemesters } from "@/features/semester/api/semester.service";
import { useGenerateBatchReports } from "../api/evaluation-report.service";
import type { ScaleMode } from "backend/types/evaluation-report.type";

export const BatchGenerateReportDialog = () => {
  const [open, setOpen] = useState(false);
  const [semesterId, setSemesterId] = useState<string>("");
  const [minRating, setMinRating] = useState<number>(1);
  const [maxRating, setMaxRating] = useState<number>(5);
  const [scaleMode, setScaleMode] = useState<ScaleMode>("PERCENTAGE_100");

  const { data: semesterData, isLoading: isLoadingSemesters } = useSemesters({
    page: 1,
    orderBy: "school_year_start",
    orderDir: "desc",
    search: undefined,
  });
  const generateBatch = useGenerateBatchReports();

  const semesters = semesterData?.data ?? [];

  const handleGenerate = async () => {
    if (!semesterId) {
      toast.error("Please select an academic semester.");
      return;
    }

    try {
      const result = await generateBatch.mutateAsync({
        semester_id: Number(semesterId),
        min_rating: minRating,
        max_rating: maxRating,
        scale_mode: scaleMode,
      });

      const count = result?.generated_count ?? 0;
      toast.success(`Generated ${count} evaluation report(s) successfully.`);
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate batch reports.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          className="h-8 cursor-pointer gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-medium text-white hover:bg-emerald-500"
        >
          <Sparkles className="size-3.5" />
          <span>Generate Batch Reports</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="rounded-xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Generate Batch Reports</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Aggregate independent SET and SEF evaluation scores per CHED CMO 19 guidelines.
          </DialogDescription>
        </DialogHeader>

        <FieldGroup className="py-2 space-y-3">
          {/* Target Academic Semester */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Academic Semester</Label>
            <Select value={semesterId} onValueChange={setSemesterId} disabled={isLoadingSemesters}>
              <SelectTrigger className="h-8 rounded-lg text-xs bg-muted/20 border-border/60">
                <SelectValue
                  placeholder={isLoadingSemesters ? "Loading terms..." : "Select semester..."}
                />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {semesters.map((s) => (
                  <SelectItem key={s.id} value={s.id.toString()} className="text-xs">
                    AY {s.school_year_start}–{s.school_year_end} ({s.semester_term} Semester)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Scale Formula Mode */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Consolidation Scale Mode</Label>
            <Select value={scaleMode} onValueChange={(val) => setScaleMode(val as ScaleMode)}>
              <SelectTrigger className="h-8 rounded-lg text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="PERCENTAGE_100" className="text-xs">
                  CHED CMO 19 Percentage Mode (0–100%)
                </SelectItem>
                <SelectItem value="GPA_5" className="text-xs">
                  GPA Rating Scale Mode (1.00–5.00)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Score Bounds */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Min Rating Bound</Label>
              <Input
                type="number"
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="h-8 text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Max Rating Bound</Label>
              <Input
                type="number"
                value={maxRating}
                onChange={(e) => setMaxRating(Number(e.target.value))}
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>
        </FieldGroup>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={generateBatch.isPending}
            className="h-8 rounded-lg text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleGenerate}
            disabled={generateBatch.isPending || !semesterId}
            className="h-8 cursor-pointer rounded-lg bg-emerald-600 text-xs font-medium text-white hover:bg-emerald-500"
          >
            {generateBatch.isPending ? "Calculating..." : "Run Batch Aggregation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
