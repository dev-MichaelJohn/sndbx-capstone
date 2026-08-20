import { useParams, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";

import { useClass } from "../api/class.service";
import { useProgram } from "@/features/program/api/program.service";
import { useClassOfferingCount } from "@/features/offerings/api/offerings.service";

import { ClassDetailsHeader } from "./ClassDetailsHeader";
import { ClassDetailsMetrics } from "./ClassDetailsMetrics";
import { ClassDetailsTabs } from "./ClassDetailsTab";
import { useClassStudentCount } from "@/features/class-student/api/class-student.service";
import { PageHeader } from "@/components/ui/page-header";
import { ArrowLeft } from "lucide-react";

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

  // 1. Fetch Class & Program Data
  const {
    data: classData,
    isLoading: isClassLoading,
    isError: isClassError,
  } = useClass(parsedClassId);

  const effectiveProgramId = classData?.program_id ?? Number(programId);
  const { data: programData } = useProgram(effectiveProgramId);

  // 2. Fetch Metrics
  const { data: totalOfferings } = useClassOfferingCount(parsedClassId);

  const classStudents = useClassStudentCount(parsedClassId);

  const handleBack = () => {
    if (collegeId && programId) {
      navigate("../..", { relative: "path" });
    } else {
      navigate(-1);
    }
  };

  if (!isValidClassId) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center gap-4 p-6 text-xs text-muted-foreground">
        Invalid or missing Class Identifier.
        <Button variant="outline" size="sm" onClick={handleBack}>
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
        <Button variant="outline" size="sm" onClick={handleBack}>
          Go Back
        </Button>
      </div>
    );
  }

  const numericYear = YEAR_LEVEL_MAP[classData.year_level] ?? classData.year_level;
  const programCode = programData?.initialism ?? "BSIT";
  const className = `${programCode} ${numericYear}${classData.section}`;

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
        {/* Header Section */}
        <PageHeader
          title={className}
          description="Overview and management of course offerings and enrolled student rosters"
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

        {/* KPI Summary Cards */}
        <ClassDetailsMetrics
          totalOfferings={totalOfferings ?? 0}
          totalStudents={classStudents.data ?? 0} // Replace with student count hook when available
        />

        {/* Tabs Section */}
        <ClassDetailsTabs classId={parsedClassId} />
      </div>
    </div>
  );
};

export default ClassDetailsPage;
