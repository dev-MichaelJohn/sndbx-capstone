import { useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";

import { useProgramCourseCount } from "@/features/course/api/course.service";
import { useProgramClassCount } from "@/features/class/api/class.service";
import { useProgram } from "../api/program.service";

import { ProgramDetailsMetrics } from "../components/ProgramDetailsMetrics";
import { ProgramDetailsTabs } from "../components/ProgramDetailsTabs";
import { PageHeader } from "@/components/ui/page-header";
import { ArrowLeft } from "lucide-react";

export const ProgramDetailsPage = () => {
  const navigate = useNavigate();
  const { programId } = useParams<{ collegeId: string; programId: string }>();
  const parsedProgramId = Number(programId);

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
        <PageHeader
          title={programData.name ?? "Unknown Program"}
          description="Overview and management of courses, active classes, assigned faculty, and enrolled students"
          badge={
            <Button
              variant="outline"
              size="icon"
              className="size-8 shrink-0 rounded-lg"
              onClick={handleBack}
              title="Back to Colleges"
            >
              <ArrowLeft className="size-4" />
            </Button>
          }
        />

        <ProgramDetailsMetrics
          totalCourses={courseCount.data ?? 0}
          totalClasses={classCount.data ?? 0}
          totalStudents={programData.student_count ?? 0}
        />

        <ProgramDetailsTabs programId={parsedProgramId} />
      </div>
    </div>
  );
};

export default ProgramDetailsPage;
