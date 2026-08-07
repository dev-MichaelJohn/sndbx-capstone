import { useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileEdit, Check } from "lucide-react";
import type { UpdateDevelopmentPlanReq } from "backend/types/evaluation-report.type";

interface FedafPlanFormProps {
  initialPlan?: UpdateDevelopmentPlanReq;
  isSaving?: boolean;
  onSave: (payload: UpdateDevelopmentPlanReq) => void;
}

export const FedafPlanForm = ({ initialPlan, isSaving = false, onSave }: FedafPlanFormProps) => {
  const [areas, setAreas] = useState(initialPlan?.areas_for_improvement ?? "");
  const [activities, setActivities] = useState(initialPlan?.proposed_activities ?? "");
  const [actionPlan, setActionPlan] = useState(initialPlan?.action_plan ?? "");

  const handleSubmit = (e: ChangeEvent) => {
    e.preventDefault();
    onSave({
      areas_for_improvement: areas,
      proposed_activities: activities,
      action_plan: actionPlan,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-border/60 bg-card p-4 shadow-2xs"
    >
      <div className="flex items-center gap-2 border-b pb-2">
        <FileEdit className="size-4 text-emerald-500" />
        <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
          FEDAF Development Plan
        </h4>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-foreground">Areas for Improvement</label>
        <Textarea
          value={areas}
          disabled={isSaving}
          onChange={(e) => setAreas(e.target.value)}
          placeholder="Identify specific instructional areas needing growth..."
          className="min-h-20 text-xs"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-foreground">Proposed L&D Activities</label>
        <Textarea
          value={activities}
          disabled={isSaving}
          onChange={(e) => setActivities(e.target.value)}
          placeholder="List seminars, workshops, or mentoring sessions..."
          className="min-h-20 text-xs"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-foreground">Action Plan & Target Timeline</label>
        <Textarea
          value={actionPlan}
          disabled={isSaving}
          onChange={(e) => setActionPlan(e.target.value)}
          placeholder="Define measurable goals and target completion dates..."
          className="min-h-20 text-xs"
        />
      </div>

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          size="sm"
          disabled={isSaving || !areas.trim() || !activities.trim() || !actionPlan.trim()}
          className="h-8 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
        >
          <Check className="size-3.5" />
          <span>{isSaving ? "Saving..." : "Save FEDAF Plan"}</span>
        </Button>
      </div>
    </form>
  );
};
