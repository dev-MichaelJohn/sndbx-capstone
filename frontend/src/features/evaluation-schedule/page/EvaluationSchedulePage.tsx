import { useState, useMemo } from "react";
import { Plus, Search, CalendarDays } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/main-data-table";

import { useSchedules } from "../api/evaluation-schedule.service";
import { getScheduleColumns } from "../components/ScheduleColumns";
import { ScheduleCreateDialog } from "../components/ScheduleCreateDialog";
import { ScheduleEditDialog } from "../components/ScheduleEditDialog";

import type { EvaluationType, ScheduleSelect } from "backend/types/evaluation-schedule.type";

export const EvaluationSchedulePage = () => {
  const [activeType, setActiveType] = useState<EvaluationType>("student");
  const [semesterFilter, setSemesterFilter] = useState<string>("");
  const [editingSchedule, setEditingSchedule] = useState<ScheduleSelect | null>(null);

  const numericSemesterId = semesterFilter ? Number(semesterFilter) : undefined;

  // Fetch schedules for selected type & optional semester filter
  const {
    data: schedules = [],
    isPending: isSchedulesPending,
    isError: isSchedulesError,
    error: schedulesError,
  } = useSchedules(activeType, numericSemesterId);

  // Memoize column definitions with edit handler
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
        {/* ── Page Header ───────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <CalendarDays className="size-6 text-primary" />
              <h1 className="text-2xl font-semibold tracking-tight">Evaluation Schedules</h1>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage active, upcoming, and past evaluation submission windows for students and
              supervisors.
            </p>
          </div>

          {/* Type Tab Switcher */}
          <Tabs
            value={activeType}
            onValueChange={(v) => {
              setActiveType(v as EvaluationType);
              setEditingSchedule(null);
            }}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid w-full grid-cols-2 sm:w-64">
              <TabsTrigger value="student" className="text-xs capitalize">
                Student (SET)
              </TabsTrigger>
              <TabsTrigger value="supervisor" className="text-xs capitalize">
                Supervisor (SEF)
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* ── Schedule Data Table Card ───────────────────────────────────── */}
        <Card className="flex flex-col gap-0 overflow-hidden rounded-xl pb-0 shadow-xs">
          <CardHeader className="flex flex-col items-center justify-between gap-2.5 border-b px-6 sm:flex-row">
            {/* Filter Input */}
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="number"
                placeholder="Filter by Semester ID..."
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
                className="h-8 rounded-lg pl-8 text-xs"
              />
            </div>

            {/* Schedule Create Dialog Trigger */}
            <ScheduleCreateDialog type={activeType} icon={Plus} triggerText="Schedule Evaluation" />
          </CardHeader>

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

        {/* Edit Dialog Instance Controlled via State */}
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
