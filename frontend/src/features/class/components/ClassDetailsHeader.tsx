import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ClassHeaderProps {
  name: string;
  onBack: () => void;
}

export const ClassDetailsHeader = ({ name, onBack }: ClassHeaderProps) => {
  return (
    <div className="flex items-center gap-4">
      <Button variant="outline" size="icon" onClick={onBack} className="size-9 shrink-0 rounded-lg">
        <ArrowLeft className="size-4" />
      </Button>
      <div className="space-y-0.5">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight">{name}</h1>
        </div>
        <p className="text-xs text-muted-foreground">
          Overview and management of course offerings and enrolled student rosters
        </p>
      </div>
    </div>
  );
};
