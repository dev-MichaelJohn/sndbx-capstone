import { useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";

import { useProgramCourseCount } from "@/features/sys/course.service";
import { useProgramClassCount } from "@/features/sys/class.service";
import { useProgram } from "@/features/sys/program.service";

import { ProgramHeader } from "./details/details-header";
import { ProgramMetrics } from "./details/details-metrics";
import { ProgramTabs } from "./details/details-tabs";

export const ProgramDetailsPage = () => {
  const navigate = useNavigate();
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

  const handleBack = () => navigate(-1);

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
        <ProgramHeader
          name={programData.name ?? "Unknown Program"}
          code={programData.initialism ?? "N/A"}
          onBack={handleBack}
        />

        <ProgramMetrics
          totalCourses={courseCount ?? 0}
          totalClasses={classCount ?? 0}
          totalFaculty={18}
          totalStudents={380}
        />

        <ProgramTabs programId={parsedProgramId} />
      </div>
    </div>
  );
};

export default ProgramDetailsPage;
