import { ArrowLeft, BookOpen, GraduationCap, Layers, Pencil, Users } from "lucide-react";
import { useNavigate, useParams } from "react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProgramCoursesTab } from "./details/tab-courses";
import { useProgramCourseCount } from "@/features/sys/course.service";

export const ProgramDetailsPage = () => {
  const navigate = useNavigate();
  const { programId } = useParams<{ collegeId: string; programId: string }>();
  const parsedProgramId = Number(programId);

  // Live course count from TanStack Query cache
  const courseCount = useProgramCourseCount(parsedProgramId);

  // Fallback programmatic program metadata until program detail query hook is connected
  const program = {
    id: parsedProgramId || 1,
    code: "BSIT",
    name: "Bachelor of Science in Information Technology",
    department: "Department of Information Technology",
    description:
      "Prepares students for professional careers in web development, database management, network administration, and software engineering.",
    totalCourses: courseCount ?? 0,
    totalStudents: 380,
    totalFaculty: 18,
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (!parsedProgramId || isNaN(parsedProgramId)) {
    return <div className="p-6 text-xs text-muted-foreground">Invalid Program Identifier.</div>;
  }

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
        {/* ── Header Section ────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-lg shrink-0"
              onClick={handleBack}
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight">{program.name}</h1>
                <Badge variant="outline" className="font-mono text-xs">
                  {program.code}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Overview and management of courses, active classes, assigned faculty, and enrolled
                students
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            className="h-8 rounded-lg text-xs self-start sm:self-auto"
          >
            <Pencil className="mr-1.5 size-3.5" />
            <span>Edit Program</span>
          </Button>
        </div>

        {/* ── Key Metrics Overview Cards ────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-xl shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Total Courses
              </CardTitle>
              <BookOpen className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{program.totalCourses}</div>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Active Classes
              </CardTitle>
              <Layers className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Assigned Faculty
              </CardTitle>
              <Users className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{program.totalFaculty}</div>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Enrolled Students
              </CardTitle>
              <GraduationCap className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{program.totalStudents}</div>
            </CardContent>
          </Card>
        </div>

        {/* ── Main Tabbed Content ───────────────────────────────────────────── */}
        <Tabs defaultValue="courses" className="flex flex-1 flex-col gap-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <TabsList className="h-9 rounded-lg p-1">
              <TabsTrigger value="courses" className="text-xs">
                Courses
              </TabsTrigger>
              <TabsTrigger value="classes" className="text-xs">
                Classes
              </TabsTrigger>
              <TabsTrigger value="faculty" className="text-xs">
                Faculty
              </TabsTrigger>
              <TabsTrigger value="students" className="text-xs">
                Students
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Courses Tab (Lazy Loaded Component) */}
          <TabsContent value="courses" className="m-0">
            <ProgramCoursesTab programId={parsedProgramId} />
          </TabsContent>

          {/* Classes Tab */}
          <TabsContent value="classes" className="m-0">
            <Card className="overflow-hidden rounded-xl shadow-xs p-6 text-xs text-muted-foreground">
              Classes tab component goes here.
            </Card>
          </TabsContent>

          {/* Faculty Tab */}
          <TabsContent value="faculty" className="m-0">
            <Card className="overflow-hidden rounded-xl shadow-xs p-6 text-xs text-muted-foreground">
              Faculty tab component goes here.
            </Card>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="m-0">
            <Card className="overflow-hidden rounded-xl shadow-xs p-6 text-xs text-muted-foreground">
              Students tab component goes here.
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProgramDetailsPage;
