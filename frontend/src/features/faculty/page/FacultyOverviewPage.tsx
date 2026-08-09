import { useMemo } from "react";
import { useNavigate } from "react-router";
import { BookOpen, FileText, Star, ArrowRight, ShieldAlert, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/features/auth/context/user.context";
import { useFacultyOfferings, useFacultySelfReports } from "../api/faculty.service";
import { EvaluationReportStatusBadge } from "@/features/evaluation-report/components/EvaluationReportStatusBadge";

/**
 * Faculty Overview component displaying teaching workload KPIs, latest SET/SEF
 * evaluation results, and pending report acknowledgment alerts.
 */
export const FacultyOverviewPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const { data: offeringsRes, isLoading: isLoadingOfferings } = useFacultyOfferings(user?.id);
  const myOfferings = offeringsRes?.data ?? [];

  const { data: myReports = [] } = useFacultySelfReports();

  const latestReport = useMemo(() => {
    if (!myReports.length) return null;
    return myReports[0];
  }, [myReports]);

  const unacknowledgedCount = useMemo(() => {
    return myReports.filter((r) => r.status === "FINALIZED").length;
  }, [myReports]);

  const facultyName = user?.personalDetails
    ? `${user.personalDetails.first_name} ${user.personalDetails.last_name}`
    : "Faculty Member";
  const institutionalId = user?.personalDetails?.institutional_id ?? "N/A";

  return (
    <div className="flex h-full flex-1 flex-col overflow-y-auto p-6 gap-6">
      {/* Faculty Hero Banner */}
      <div className="flex flex-col gap-2 rounded-2xl border border-primary/20 bg-primary/5 p-6 shadow-xs">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="gap-1 border-primary/30 bg-primary/10 text-primary text-xs"
          >
            <BookOpen className="size-3.5" /> Faculty Instruction Portal
          </Badge>
          <span className="font-mono text-xs text-muted-foreground">ID: {institutionalId}</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Welcome back, {facultyName}!
        </h1>
        <p className="text-xs text-muted-foreground sm:text-sm max-w-2xl">
          Access your teaching workload, student class rosters, and review your CHED Individual
          Faculty Evaluation Reports (IFER).
        </p>
      </div>

      {/* Unacknowledged Report Notice */}
      {unacknowledgedCount > 0 && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-600 dark:text-amber-400">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="size-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Action Required: Pending Report Acknowledgment</p>
              <p className="mt-0.5">
                You have {unacknowledgedCount} finalized evaluation report(s) awaiting your formal
                acknowledgment per CHED CMO 19 regulations.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => navigate("/faculty/reports")}
            className="h-8 shrink-0 bg-amber-600 hover:bg-amber-500 text-white text-xs cursor-pointer"
          >
            Review & Acknowledge
          </Button>
        </div>
      )}

      {/* Teaching & Evaluation KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card className="rounded-xl border bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Teaching Classes
              </p>
              <h2 className="text-2xl font-bold text-foreground">
                {isLoadingOfferings ? "—" : myOfferings.length}
              </h2>
              <p className="text-[10px] text-muted-foreground">Active course offerings</p>
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
                Latest SET Score
              </p>
              <h2 className="text-2xl font-bold font-mono text-emerald-500">
                {latestReport?.overall_set_rating ? `${latestReport.overall_set_rating}` : "N/A"}
              </h2>
              <p className="text-[10px] text-muted-foreground">Student rating average</p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <Star className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Latest SEF Score
              </p>
              <h2 className="text-2xl font-bold font-mono text-sky-500">
                {latestReport?.overall_sef_rating ? `${latestReport.overall_sef_rating}` : "N/A"}
              </h2>
              <p className="text-[10px] text-muted-foreground">Supervisor rating average</p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-lg bg-sky-500/10 text-sky-500">
              <UserCheck className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                IFER Report Status
              </p>
              <div className="mt-1">
                {latestReport ? (
                  <EvaluationReportStatusBadge status={latestReport.status} />
                ) : (
                  <span className="text-xs text-muted-foreground">No reports</span>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground">Latest term status</p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
              <FileText className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teaching Load Subjects Card */}
      <Card className="rounded-xl border bg-card shadow-xs">
        <CardHeader className="border-b pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Assigned Course Offerings</CardTitle>
              <CardDescription className="text-xs">
                Your teaching subjects for the active academic session
              </CardDescription>
            </div>
            <Button
              size="sm"
              onClick={() => navigate("/faculty/classes")}
              className="h-8 gap-1 text-xs cursor-pointer"
            >
              <span>View All Classes</span>
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {isLoadingOfferings ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              Loading assigned classes...
            </div>
          ) : myOfferings.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-lg">
              No teaching course offerings assigned to your account.
            </div>
          ) : (
            myOfferings.map((offering) => (
              <div
                key={offering.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border bg-muted/20 hover:border-primary/30 transition-all"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary">
                      {offering.course_initialism}
                    </span>
                    <span className="text-xs font-semibold text-foreground">
                      {offering.course_name}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Year Level: Year {offering.year_level} • Term: {offering.semester_term} Semester
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate("/faculty/classes")}
                  className="h-8 text-xs shrink-0 cursor-pointer"
                >
                  View Class Roster
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FacultyOverviewPage;
