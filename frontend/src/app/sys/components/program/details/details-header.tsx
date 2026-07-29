import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProgramHeaderProps {
  name: string;
  code: string;
  onBack: () => void;
}

export const ProgramHeader = ({ name, code, onBack }: ProgramHeaderProps) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 shrink-0 rounded-lg"
          onClick={onBack}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{name}</h1>
            <Badge variant="outline" className="font-mono text-xs">
              {code}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Overview and management of courses, active classes, assigned faculty, and enrolled
            students
          </p>
        </div>
      </div>
    </div>
  );
};
