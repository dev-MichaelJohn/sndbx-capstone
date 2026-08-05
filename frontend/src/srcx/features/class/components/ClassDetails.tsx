import { useParams, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";

import { useClass } from "../api/class.service";
import { useProgram } from "@/srcx/features/program/api/program.service";

import { ClassDetailsHeader } from "./ClassDetailsHeader";
import { ClassDetailsTabs } from "./ClassDetailsTab";

// Helper map to convert Roman numeral year levels to numbers
const YEAR_LEVEL_MAP: Record<string, number> = {
  I: 1,
  II: 2,
  III: 3,
  IV: 4,
  V: 5,
};

export const ClassDetailsPage = () => {
  const navigate = useNavigate();
  const { collegeId, programId, classId } = useParams<{
    collegeId: string;
    programId: string;
    classId: string;
  }>();

  const parsedClassId = Number(classId);
  const isValidClassId = !isNaN(parsedClassId) && parsedClassId > 0;

  // 1. Fetch Class Data
  const {
    data: classData,
    isLoading: isClassLoading,
    isError: isClassError,
  } = useClass(parsedClassId);

  // 2. Fetch Program Data using program_id from classData (or fallback to URL param)
  const effectiveProgramId = classData?.program_id ?? Number(programId);
  const { data: programData } = useProgram(effectiveProgramId);

  // 3. Fetch Metrics

  const handleBack = () => {
    if (collegeId && programId) {
      navigate(`/sys/institution/${collegeId}/programs/${programId}`);
    } else {
      navigate(-1);
    }
  };

  if (!isValidClassId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 gap-4 p-6 text-xs text-muted-foreground">
        Invalid or missing Class Identifier.
        <Button variant="outline" onClick={handleBack}>
          Go Back
        </Button>
      </div>
    );
  }

  if (isClassLoading) {
    return (
      <div className="flex h-full flex-1 items-center justify-center p-6 text-sm text-muted-foreground">
        Loading class details...
      </div>
    );
  }

  if (isClassError || !classData) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center gap-4 p-6">
        <p className="text-sm text-muted-foreground">
          Failed to load class details or class not found.
        </p>
        <Button variant="outline" onClick={handleBack}>
          Go Back
        </Button>
      </div>
    );
  }

  // Converts "III" + "A" -> "3A"
  const numericYear = YEAR_LEVEL_MAP[classData.year_level] ?? classData.year_level;
  const programCode = programData?.initialism ?? "BSIT";

  // Formats to "BSIT 3A"
  const className = `${programCode} ${numericYear}${classData.section}`;

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
        <ClassDetailsHeader name={className} onBack={handleBack} />
        <ClassDetailsTabs classId={parsedClassId} />
      </div>
    </div>
  );
};

export default ClassDetailsPage;
