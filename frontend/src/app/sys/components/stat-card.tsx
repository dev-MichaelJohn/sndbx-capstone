import { Skeleton } from "@/components/ui/skeleton";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value?: string | number;
  defaultValue: string | number;
  isLoading: boolean;
}

export const StatCard = ({ icon: Icon, label, value, defaultValue, isLoading }: StatCardProps) => {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="size-5 text-primary" />
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">
            {isLoading ? <Skeleton className="h-8 w-12" /> : (value ?? defaultValue)}
          </p>
        </div>
      </div>
    </div>
  );
};
