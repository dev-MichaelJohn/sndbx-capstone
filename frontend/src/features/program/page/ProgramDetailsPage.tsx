import { useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";

import { useProgramCourseCount } from "@/features/course/api/course.service";
import { useProgramClassCount } from "@/features/class/api/class.service";
import { useProgram } from "../api/program.service";

import { ProgramDetailsHeader } from "../components/ProgramDetailsHeader";
import { ProgramDetailsMetrics } from "../components/ProgramDetailsMetrics";
import { ProgramDetailsTabs } from "../components/ProgramDetailsTabs";

export const ProgramDetailsPage = () => {
  const navigate = useNavigate();
  // Extract collegeId as well so we can route back to its specific program list
  const { programId } = useParams<{ collegeId: string; programId: string }>();
  const parsedProgramId = Number(programId);

  // Live data connections
  const courseCount = useProgramCourseCount(parsedProgramId);
  const classCount = useProgramClassCount(parsedProgramId);
  const {
    data: programData,
    isLoading: isProgramLoading,
    isError: isProgramError,
  } = useProgram(parsedProgramId);

  const handleBack = () => {
    navigate("..", { relative: "path" });
  };

  if (!parsedProgramId || isNaN(parsedProgramId)) {
    return <div className="p-6 text-xs text-muted-foreground">Invalid Program Identifier.</div>;
  }

  if (isProgramLoading) {
    return (
      <div className="flex h-full flex-1 items-center justify-center p-6 text-sm text-muted-foreground">
        Loading program details...
      </div>
    );
  }

  if (isProgramError || !programData) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center gap-4 p-6">
        <p className="text-sm text-muted-foreground">
          Failed to load program details or program not found.
        </p>
        <Button variant="outline" onClick={handleBack}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
        <ProgramDetailsHeader
          name={programData.name ?? "Unknown Program"}
          code={programData.initialism ?? "N/A"}
          onBack={handleBack}
        />

        <ProgramDetailsMetrics
          totalCourses={courseCount.data ?? 0}
          totalClasses={classCount.data ?? 0}
          totalStudents={380}
        />

        <ProgramDetailsTabs programId={parsedProgramId} />
      </div>
    </div>
  );
};

export default ProgramDetailsPage;
