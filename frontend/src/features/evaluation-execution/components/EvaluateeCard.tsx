import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, User, CheckCircle2, Clock } from "lucide-react";
import type { CourseOfferingWithDetails } from "backend/types/offerings.type";

interface EvaluateeCardProps {
  offering: CourseOfferingWithDetails;
  isSubmitted?: boolean;
  hasDraft?: boolean;
  onEvaluate: (offering: CourseOfferingWithDetails) => void;
}

export const EvaluateeCard = ({
  offering,
  isSubmitted = false,
  hasDraft = false,
  onEvaluate,
}: EvaluateeCardProps) => {
  const facultyName = offering.first_name
    ? `${offering.first_name} ${offering.last_name}`
    : "Unassigned Faculty";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border/60 bg-card p-4 shadow-2xs">
      <div className="flex items-start gap-3 min-w-0">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <BookOpen className="size-4" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-semibold text-foreground truncate">
              {offering.course_name}
            </h4>
            <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0">
              {offering.course_initialism}
            </Badge>
          </div>

          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <User className="size-3.5 shrink-0" />
            <span className="font-medium text-foreground">{facultyName}</span>
            <span>• Year {offering.year_level}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
        {isSubmitted ? (
          <Badge
            variant="outline"
            className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[11px]"
          >
            <CheckCircle2 className="size-3" /> Submitted
          </Badge>
        ) : hasDraft ? (
          <Badge
            variant="outline"
            className="gap-1 border-amber-500/30 bg-amber-500/10 text-amber-400 text-[11px]"
          >
            <Clock className="size-3" /> Draft
          </Badge>
        ) : (
          <Badge variant="outline" className="text-[11px]">
            Pending
          </Badge>
        )}

        <Button
          size="sm"
          onClick={() => onEvaluate(offering)}
          className="h-8 text-xs font-medium cursor-pointer"
        >
          {isSubmitted ? "View Evaluation" : "Evaluate"}
        </Button>
      </div>
    </div>
  );
};
