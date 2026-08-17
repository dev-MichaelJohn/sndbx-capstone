import { useMemo } from "react";
import { useNavigate } from "react-router";
import { BookOpen, Sparkles, UserCheck, ArrowRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useUser } from "@/features/auth/context/user.context";
import { useMyEnrolledClasses, useActiveStudentSchedule } from "../api/student.service";
import { useSemesters } from "@/features/semester/api/semester.service";
import { RoleHeroBanner } from "@/features/overview/components/RoleHeroBanner";
import { StatCard } from "@/components/ui/stat-card";

export const StudentOverviewPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const { data: schedules = [] } = useActiveStudentSchedule();

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

  const { data: semesterResponse } = useSemesters({
    search: undefined,
    page: 1,
    orderBy: "id",
    orderDir: "desc",
  });

  const semesters = semesterResponse?.data ?? [];

  const currentSemester = useMemo(() => {
    if (activeSchedule) {
      return semesters.find((s) => s.id === activeSchedule.semester_id) ?? semesters[0];
    }
    return semesters[0];
  }, [activeSchedule, semesters]);

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

  const activeTermLabel = currentSemester
    ? `A.Y. ${currentSemester.school_year_start}–${currentSemester.school_year_end} (${currentSemester.semester_term} Semester)`
    : undefined;

  return (
    <div className="flex h-full flex-1 flex-col overflow-y-auto p-6 gap-6">
      {/* Hero Banner */}
      <RoleHeroBanner
        name={studentName}
        institutionalId={institutionalId}
        role="STUDENT"
        activeTerm={activeTermLabel}
        subtitle="Complete your Student Evaluation of Teaching (SET) for your enrolled subjects during the active evaluation window."
      />

      {/* Progress KPIs */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          title="Enrolled Subjects"
          value={isLoadingClasses ? "—" : enrolledClasses.length}
          subtitle="Registered subjects in active term"
          icon={BookOpen}
          accent="primary"
          isLoading={isLoadingClasses}
        />
        <StatCard
          title="SET Window Status"
          value={activeSchedule ? "Active" : "Closed"}
          subtitle={
            activeSchedule
              ? `Closes ${new Date(activeSchedule.close_at).toLocaleDateString()}`
              : "No open evaluation schedule"
          }
          icon={Sparkles}
          accent={activeSchedule ? "emerald" : "amber"}
        />
        <StatCard
          title="Action Required"
          value={activeSchedule ? enrolledClasses.length : 0}
          subtitle={activeSchedule ? "Evaluations pending" : "Window closed"}
          icon={UserCheck}
          accent="violet"
        />
      </div>

      {/* Enrolled Courses CTA List */}
      <Card className="rounded-xl border border-border/60 bg-card shadow-2xs">
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
                className="h-8 gap-1 text-xs cursor-pointer font-medium"
              >
                <span>Go to Evaluation Portal</span>
                <ArrowRight className="size-3.5" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {!activeSchedule ? (
            <div className="flex flex-col items-center justify-center gap-2 p-8 text-center text-xs text-muted-foreground border border-dashed rounded-xl bg-muted/20">
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
            <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
              No enrolled subjects found for evaluation in this active term.
            </div>
          ) : (
            enrolledClasses.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border/50 bg-muted/20 hover:border-primary/40 transition-all"
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
                  className="h-8 text-xs shrink-0 cursor-pointer font-medium"
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
