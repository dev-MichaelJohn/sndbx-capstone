import { useMemo } from "react";
import { BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/main-data-table";
import { useUser } from "@/features/auth/context/user.context";
import { useFacultyOfferings } from "../api/faculty.service";
import type { CourseOfferingWithDetails } from "backend/types/offerings.type";

/**
 * Page component displaying all course offerings assigned to the logged-in faculty member.
 */
export const FacultyClassesPage = () => {
  const { user } = useUser();
  const { data: offeringsRes, isLoading, isError, error } = useFacultyOfferings(user?.id);
  const myOfferings = offeringsRes?.data ?? [];

  const columns: Array<DataTableColumn<CourseOfferingWithDetails>> = useMemo(
    () => [
      {
        header: "Course Code",
        cell: (row) => (
          <span className="font-mono text-xs font-bold text-primary">{row.course_initialism}</span>
        ),
      },
      {
        header: "Course Title",
        cell: (row) => (
          <span className="text-xs font-semibold text-foreground">{row.course_name}</span>
        ),
      },
      {
        header: "Year & Term",
        cell: (row) => (
          <Badge variant="outline" className="font-mono text-[10px]">
            Year {row.year_level} • {row.semester_term} Term
          </Badge>
        ),
      },
      {
        header: "Offering Ref ID",
        cell: (row) => (
          <span className="font-mono text-xs text-muted-foreground">#CO-{row.id}</span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            My Teaching Classes
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Overview of course offerings assigned to you for instruction and evaluation.
          </p>
        </div>

        <Card className="rounded-xl border bg-card shadow-xs overflow-hidden">
          <CardHeader className="border-b pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="size-4 text-primary" />
              <CardTitle className="text-base font-semibold">Assigned Teaching Workload</CardTitle>
            </div>
            <CardDescription className="text-xs">
              {myOfferings.length} active course offering(s)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={myOfferings}
              getRowId={(row) => row.id}
              isLoading={isLoading}
              isError={isError}
              error={error}
              emptyMessage="No teaching course offerings assigned to your account."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FacultyClassesPage;
