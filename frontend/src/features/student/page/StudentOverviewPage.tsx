import { useMemo } from "react";
import { useNavigate } from "react-router";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  GraduationCap,
  Sparkles,
  UserCheck,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/features/auth/context/user.context";
import { useMyEnrolledClasses, useActiveStudentSchedule } from "../api/student.service";
import { useSemesters } from "@/features/semester/api/semester.service";

/**
 * Overview component for student dashboard home. Displays active term context,
 * evaluation progress KPI summary cards, and active evaluation CTAs.
 */
export const StudentOverviewPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  // Fetch active evaluation schedule for student
  const { data: schedules = [] } = useActiveStudentSchedule();

  // Determine open SET evaluation schedule window
  const activeSchedule = useMemo(() => {
    if (!schedules || schedules.length === 0) return null;
    const now = Date.now();
    return (
      schedules.find((s) => {
        const open = new Date(s.open_at).getTime();
        const close = new Date(s.close_at).getTime();
        return now >= open && now <= close;
      }) ?? null
    );
  }, [schedules]);

  // Fetch all academic terms
  const { data: semesterResponse } = useSemesters({
    search: undefined,
    page: 1,
    orderBy: "id",
    orderDir: "desc",
  });

  const semesters = semesterResponse?.data ?? [];

  // Active semester context (either from the active schedule or the latest term)
  const currentSemester = useMemo(() => {
    if (activeSchedule) {
      return semesters.find((s) => s.id === activeSchedule.semester_id) ?? semesters[0];
    }
    return semesters[0];
  }, [activeSchedule, semesters]);

  // Query student enrolled courses strictly for the active semester
  const { data: classesRes, isLoading: isLoadingClasses } = useMyEnrolledClasses(
    user?.id,
    currentSemester?.id,
    { enabled: Boolean(user?.id && currentSemester?.id) },
  );

  const enrolledClasses = classesRes?.data ?? [];

  const studentName = user?.personalDetails
    ? `${user.personalDetails.first_name} ${user.personalDetails.last_name}`
    : "Student";
  const institutionalId = user?.personalDetails?.institutional_id ?? "N/A";

  return (
    <div className="flex h-full flex-1 flex-col overflow-y-auto p-6 gap-6">
      {/* Student Welcome Hero Banner */}
      <div className="flex flex-col gap-2 rounded-2xl border border-primary/20 bg-primary/5 p-6 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="gap-1 border-primary/30 bg-primary/10 text-primary text-xs"
          >
            <GraduationCap className="size-3.5" /> Institutional Student Portal
          </Badge>

          {currentSemester && (
            <Badge variant="outline" className="font-mono text-xs text-foreground bg-background">
              Active Term: A.Y. {currentSemester.school_year_start}–
              {currentSemester.school_year_end} ({currentSemester.semester_term} Semester)
            </Badge>
          )}

          <span className="font-mono text-xs text-muted-foreground">ID: {institutionalId}</span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Welcome back, {studentName}!
        </h1>
        <p className="text-xs text-muted-foreground sm:text-sm max-w-2xl">
          Complete your Student Evaluation of Teaching (SET) for your enrolled subjects during the
          active evaluation window.
        </p>
      </div>

      {/* Evaluation Progress KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="rounded-xl border bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Enrolled Subjects
              </p>
              <h2 className="text-2xl font-bold text-foreground">
                {isLoadingClasses ? "—" : enrolledClasses.length}
              </h2>
              <p className="text-[10px] text-muted-foreground">
                {currentSemester
                  ? `SY ${currentSemester.school_year_start}-${currentSemester.school_year_end} (${currentSemester.semester_term})`
                  : "Active term courses"}
              </p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BookOpen className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                SET Window Status
              </p>
              <h2 className="text-sm font-bold">
                {activeSchedule ? (
                  <span className="text-emerald-500 flex items-center gap-1">
                    <CheckCircle2 className="size-4" /> Open for Submission
                  </span>
                ) : (
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="size-4" /> Closed / Inactive
                  </span>
                )}
              </h2>
              <p className="text-[10px] text-muted-foreground">
                {activeSchedule
                  ? `Closes ${new Date(activeSchedule.close_at).toLocaleDateString()}`
                  : "No open evaluation schedule"}
              </p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <Sparkles className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Action Required
              </p>
              <h2 className="text-2xl font-bold text-foreground">
                {activeSchedule ? enrolledClasses.length : 0}
              </h2>
              <p className="text-[10px] text-muted-foreground">
                {activeSchedule ? "Teacher evaluations pending" : "Window closed"}
              </p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <UserCheck className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enrolled Courses CTA List */}
      <Card className="rounded-xl border bg-card shadow-xs">
        <CardHeader className="border-b pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Teacher Evaluations</CardTitle>
              <CardDescription className="text-xs">
                Your enrolled course offerings for teacher evaluation
              </CardDescription>
            </div>
            {activeSchedule && (
              <Button
                size="sm"
                onClick={() => navigate("/student/evaluate")}
                className="h-8 gap-1 text-xs cursor-pointer"
              >
                <span>Go to Evaluation Portal</span>
                <ArrowRight className="size-3.5" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {!activeSchedule ? (
            <div className="flex flex-col items-center justify-center gap-2 p-8 text-center text-xs text-muted-foreground border border-dashed rounded-lg bg-muted/20">
              <AlertTriangle className="size-5 text-amber-500" />
              <p className="font-semibold text-foreground">Evaluation Window Inactive</p>
              <p className="max-w-md text-muted-foreground">
                Teacher evaluations are currently closed for this term. Rating buttons will appear
                once an evaluation schedule is published by administration.
              </p>
            </div>
          ) : isLoadingClasses ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              Loading enrolled subjects...
            </div>
          ) : enrolledClasses.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-lg">
              No enrolled subjects found for evaluation in this active term.
            </div>
          ) : (
            enrolledClasses.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border bg-muted/20 hover:border-primary/30 transition-all"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary">
                      {item.course_initialism}
                    </span>
                    <span className="text-xs font-semibold text-foreground">
                      {item.course_name}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Instructor:{" "}
                    <span className="font-medium text-foreground">
                      {item.faculty_name ?? "Assigned Instructor"}
                    </span>{" "}
                    • Section {item.class_section}
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate("/student/evaluate")}
                  className="h-8 text-xs shrink-0 cursor-pointer"
                >
                  Evaluate
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentOverviewPage;
