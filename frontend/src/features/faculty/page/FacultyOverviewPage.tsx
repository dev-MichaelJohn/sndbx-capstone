import { useMemo } from "react";
import { useNavigate } from "react-router";
import { BookOpen, FileText, Star, ArrowRight, ShieldAlert, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useUser } from "@/features/auth/context/user.context";
import { useFacultyOfferings, useFacultySelfReports } from "../api/faculty.service";
import { RoleHeroBanner } from "@/features/overview/components/RoleHeroBanner";
import { StatCard } from "@/components/ui/stat-card";

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
      {/* Hero Banner */}
      <RoleHeroBanner
        name={facultyName}
        institutionalId={institutionalId}
        role="FACULTY"
        subtitle="Access your teaching workload, student class rosters, and review your CHED Individual Faculty Evaluation Reports (IFER)."
      />

      {/* Unacknowledged Report Notice */}
      {unacknowledgedCount > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-600 dark:text-amber-400">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="size-4 shrink-0" />
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
            className="h-8 shrink-0 bg-amber-600 hover:bg-amber-500 text-white text-xs cursor-pointer font-medium"
          >
            Review & Acknowledge
          </Button>
        </div>
      )}

      {/* Teaching & Evaluation KPIs */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Teaching Classes"
          value={isLoadingOfferings ? "—" : myOfferings.length}
          subtitle="Active course offerings"
          icon={BookOpen}
          accent="primary"
          isLoading={isLoadingOfferings}
        />
        <StatCard
          title="Latest SET Score"
          value={latestReport?.overall_set_rating ? `${latestReport.overall_set_rating}` : "N/A"}
          subtitle="Student rating mean"
          icon={Star}
          accent="emerald"
        />
        <StatCard
          title="Latest SEF Score"
          value={latestReport?.overall_sef_rating ? `${latestReport.overall_sef_rating}` : "N/A"}
          subtitle="Supervisor rating mean"
          icon={UserCheck}
          accent="sky"
        />
        <StatCard
          title="IFER Report Status"
          value={latestReport ? latestReport.status : "N/A"}
          subtitle="Latest term status"
          icon={FileText}
          accent="indigo"
        />
      </div>

      {/* Teaching Load Subjects Card */}
      <Card className="rounded-xl border border-border/60 bg-card shadow-2xs">
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
              className="h-8 gap-1 text-xs cursor-pointer font-medium"
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
            <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
              No teaching course offerings assigned to your account.
            </div>
          ) : (
            myOfferings.map((offering) => (
              <div
                key={offering.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border/50 bg-muted/20 hover:border-primary/40 transition-all"
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
                  className="h-8 text-xs shrink-0 cursor-pointer font-medium"
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
