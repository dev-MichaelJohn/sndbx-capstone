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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSemesters } from "@/features/semester/api/semester.service";
import { useGenerateBatchReports } from "../api/evaluation-report.service";

export const BatchGenerateReportDialog = () => {
  const [open, setOpen] = useState(false);
  const [semesterId, setSemesterId] = useState<string>("");

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
        set_weight: 0.6,
        sef_weight: 0.4,
      });

      const count = result?.generated_count ?? 0;
      toast.success(`Generated ${count} evaluation report(s) successfully.`);
      setOpen(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to generate batch evaluation reports.",
      );
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
            Calculate and aggregate SET/SEF rating scores for all faculty offering courses in the
            selected semester.
          </DialogDescription>
        </DialogHeader>

        <FieldGroup className="py-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground">Target Academic Semester</label>
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
            {generateBatch.isPending ? "Generating..." : "Run Batch Aggregation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
