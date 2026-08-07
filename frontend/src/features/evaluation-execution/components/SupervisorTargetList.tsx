import { useMemo } from "react";
import { EvaluateeCard } from "./EvaluateeCard";
import { useUser } from "@/features/auth/context/user.context";
import type { CourseOfferingWithDetails } from "backend/types/offerings.type";

interface SupervisorTargetListProps {
  offerings: CourseOfferingWithDetails[];
  isLoading?: boolean;
  onSelectOffering: (offering: CourseOfferingWithDetails) => void;
}

export const SupervisorTargetList = ({
  offerings,
  isLoading = false,
  onSelectOffering,
}: SupervisorTargetListProps) => {
  const { user } = useUser();

  // Self-exclusion filter: prevent supervisors evaluating themselves
  const validTargets = useMemo(() => {
    if (!user) return [];
    return offerings.filter((offering) => offering.faculty_id !== user.id);
  }, [offerings, user]);

  if (isLoading) {
    return <div className="p-8 text-center text-xs text-muted-foreground">Loading targets...</div>;
  }

  if (validTargets.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center text-xs text-muted-foreground">
        No faculty evaluation targets under your current supervisor scope.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {validTargets.map((offering) => (
        <EvaluateeCard key={offering.id} offering={offering} onEvaluate={onSelectOffering} />
      ))}
    </div>
  );
};
