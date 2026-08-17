import { useState } from "react";
import { Sparkles, Sliders } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
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
  const [minRating, _setMinRating] = useState<number>(1);
  const [maxRating, _setMaxRating] = useState<number>(5);
  const [scaleMode, setScaleMode] = useState<ScaleMode>("PERCENTAGE_100");

  // Optional Combined Weighting Toggle & States
  const [enableCombinedScore, setEnableCombinedScore] = useState<boolean>(false);
  const [setWeightPct, setSetWeightPct] = useState<number>(60); // 60%
  const [sefWeightPct, setSefWeightPct] = useState<number>(40); // 40%

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

    if (enableCombinedScore && setWeightPct + sefWeightPct !== 100) {
      toast.error("SET Weight % and SEF Weight % must sum to 100%.");
      return;
    }

    try {
      const result = await generateBatch.mutateAsync({
        semester_id: Number(semesterId),
        min_rating: minRating,
        max_rating: maxRating,
        scale_mode: scaleMode,
        set_weight: enableCombinedScore ? setWeightPct / 100 : undefined,
        sef_weight: enableCombinedScore ? sefWeightPct / 100 : undefined,
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
            Consolidate SET and SEF evaluation scores per CHED CMO 19 guidelines.
          </DialogDescription>
        </DialogHeader>

        <FieldGroup className="py-2 space-y-3.5">
          {/* Target Academic Semester */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium">Academic Semester</Label>
            <Select value={semesterId} onValueChange={setSemesterId} disabled={isLoadingSemesters}>
              <SelectTrigger className="h-8 rounded-lg text-xs bg-muted/20 border-border/60">
                <SelectValue
                  placeholder={isLoadingSemesters ? "Loading terms..." : "Select semester..."}
                />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {semesters.map((s) => (
                  <SelectItem key={s.id} value={s.id.toString()} className="text-xs">
                    A.Y. {s.school_year_start}–{s.school_year_end} ({s.semester_term} Semester)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Scale Formula Mode */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium">Consolidation Scale Mode</Label>
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

          {/* Optional Combined Score Weighting Toggle */}
          <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Sliders className="size-3.5 text-primary" />
                  Optional Combined Score
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  {enableCombinedScore
                    ? "Combined score enabled for SUC internal promotion points."
                    : "Off by default (Pure CMO 19 parallel SET & SEF mode)."}
                </p>
              </div>
              <Switch checked={enableCombinedScore} onCheckedChange={setEnableCombinedScore} />
            </div>

            {/* Custom Weights Inputs (Rendered only when toggle is ON) */}
            {enableCombinedScore && (
              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-border/40">
                <div className="space-y-1">
                  <Label className="text-[11px]">SET Weight %</Label>
                  <Input
                    type="number"
                    value={setWeightPct}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setSetWeightPct(val);
                      setSefWeightPct(100 - val);
                    }}
                    className="h-8 text-xs font-mono"
                    min={0}
                    max={100}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px]">SEF Weight %</Label>
                  <Input
                    type="number"
                    value={sefWeightPct}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setSefWeightPct(val);
                      setSetWeightPct(100 - val);
                    }}
                    className="h-8 text-xs font-mono"
                    min={0}
                    max={100}
                  />
                </div>
              </div>
            )}
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
