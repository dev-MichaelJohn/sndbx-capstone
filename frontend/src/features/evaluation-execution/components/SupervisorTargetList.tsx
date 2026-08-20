import { useMemo } from "react";
import { EvaluateeCard } from "./EvaluateeCard";
import { useUser } from "@/features/auth/context/user.context";
import type { CourseOfferingWithDetails } from "backend/types/offerings.type";

interface SupervisorTargetListProps {
  offerings: CourseOfferingWithDetails[];
  statusMap?: Record<number, { isSubmitted: boolean; hasDraft: boolean }>;
  isLoading?: boolean;
  onSelectOffering: (offering: CourseOfferingWithDetails) => void;
}

export const SupervisorTargetList = ({
  offerings,
  statusMap = {},
  isLoading = false,
  onSelectOffering,
}: SupervisorTargetListProps) => {
  const { user } = useUser();

  // Guard against supervisors evaluating their own assigned teaching classes
  const validTargets = useMemo(() => {
    if (!user) return [];
    return offerings.filter((offering) => offering.faculty_id !== user.id);
  }, [offerings, user]);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-xs text-muted-foreground animate-pulse">
        Loading evaluation targets...
      </div>
    );
  }

  if (validTargets.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/70 p-8 text-center text-xs text-muted-foreground">
        No faculty evaluation targets found under your active jurisdiction for this term.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {validTargets.map((offering) => {
        const targetStatus = statusMap[offering.id];
        return (
          <EvaluateeCard
            key={offering.id}
            offering={offering}
            isSubmitted={targetStatus?.isSubmitted ?? false}
            hasDraft={targetStatus?.hasDraft ?? false}
            onEvaluate={onSelectOffering}
          />
        );
      })}
    </div>
  );
};
