import { useState, useMemo } from "react";
import { Plus, Search } from "lucide-react";

import { Card, CardContent, CardHeader as UiCardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/main-data-table";
import { ViewSwitcher, type ViewMode } from "@/components/ui/view-switcher";
import { PageHeader } from "@/components/ui/page-header";

import { useSchedules } from "../api/evaluation-schedule.service";
import { getScheduleColumns } from "../components/ScheduleColumns";
import { ScheduleCard } from "../components/ScheduleCard";
import { ScheduleCreateDialog } from "../components/ScheduleCreateDialog";
import { ScheduleEditDialog } from "../components/ScheduleEditDialog";

import type { EvaluationType, ScheduleSelect } from "backend/types/evaluation-schedule.type";

export const EvaluationSchedulePage = () => {
  const [activeType, setActiveType] = useState<EvaluationType>("student");
  const [semesterFilter, setSemesterFilter] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [editingSchedule, setEditingSchedule] = useState<ScheduleSelect | null>(null);

  const numericSemesterId = semesterFilter ? Number(semesterFilter) : undefined;

  const {
    data: schedules = [],
    isPending: isSchedulesPending,
    isError: isSchedulesError,
    error: schedulesError,
  } = useSchedules(activeType, numericSemesterId);

  const columns = useMemo(
    () =>
      getScheduleColumns({
        type: activeType,
        onEdit: (schedule) => setEditingSchedule(schedule),
      }),
    [activeType],
  );

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
        {/* Header */}
        <PageHeader
          title="Evaluation Schedules"
          description="Manage active, upcoming, and past evaluation submission windows for students and supervisors."
          badge={
            <Tabs
              value={activeType}
              onValueChange={(v) => {
                setActiveType(v as EvaluationType);
                setEditingSchedule(null);
              }}
            >
              <TabsList className="grid h-9 w-64 grid-cols-2 rounded-lg bg-muted/60 p-1">
                <TabsTrigger value="student" className="text-xs capitalize rounded-md">
                  Student (SET)
                </TabsTrigger>
                <TabsTrigger value="supervisor" className="text-xs capitalize rounded-md">
                  Supervisor (SEF)
                </TabsTrigger>
              </TabsList>
            </Tabs>
          }
          actions={
            <ScheduleCreateDialog type={activeType} icon={Plus} triggerText="Schedule Evaluation" />
          }
        />

        {/* Controls Bar & Views */}
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="number"
                placeholder="Filter by Semester ID..."
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
                className="h-8 rounded-lg pl-8 text-xs bg-card"
              />
            </div>

            <ViewSwitcher mode={viewMode} onChange={setViewMode} />
          </div>

          {/* Grid View vs Table View */}
          {viewMode === "grid" ? (
            isSchedulesPending ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-44 rounded-xl border bg-card animate-pulse" />
                ))}
              </div>
            ) : schedules.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-dashed bg-card text-center text-xs text-muted-foreground">
                No {activeType} evaluation schedules found.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {schedules.map((schedule: ScheduleSelect) => (
                  <ScheduleCard
                    key={schedule.id}
                    type={activeType}
                    schedule={schedule}
                    onEdit={(s) => setEditingSchedule(s)}
                  />
                ))}
              </div>
            )
          ) : (
            <Card className="overflow-hidden rounded-xl pb-0 shadow-2xs">
              <UiCardHeader className="hidden" />
              <CardContent className="p-0">
                <DataTable
                  columns={columns}
                  data={schedules}
                  getRowId={(row) => row.id.toString()}
                  isLoading={isSchedulesPending}
                  isError={isSchedulesError}
                  error={schedulesError}
                  emptyMessage={`No ${activeType} evaluation schedules found.`}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Controlled Edit Dialog */}
        {editingSchedule && (
          <ScheduleEditDialog
            key={editingSchedule.id}
            type={activeType}
            schedule={editingSchedule}
            open={!!editingSchedule}
            onOpenChange={(open) => {
              if (!open) setEditingSchedule(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default EvaluationSchedulePage;
