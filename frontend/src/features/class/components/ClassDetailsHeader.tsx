import { ArrowLeft, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ClassHeaderProps {
  name: string;
  programCode: string;
  yearLevel: string;
  section: string;
  onBack: () => void;
}

export const ClassDetailsHeader = ({
  name,
  programCode,
  yearLevel,
  section,
  onBack,
}: ClassHeaderProps) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={onBack}
          className="h-9 w-9 shrink-0 rounded-lg"
        >
          <ArrowLeft className="size-4" />
        </Button>

        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight">{name}</h1>
            <Badge
              variant="secondary"
              className="gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium"
            >
              <GraduationCap className="size-3.5 text-primary" />
              {programCode}
            </Badge>
            <Badge variant="outline" className="rounded-md px-2 py-0.5 text-xs font-normal">
              Year {yearLevel} • Section {section}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Overview and management of course offerings and enrolled student rosters
          </p>
        </div>
      </div>
    </div>
  );
};
