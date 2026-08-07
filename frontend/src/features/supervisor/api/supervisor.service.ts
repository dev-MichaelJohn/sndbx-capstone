import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, getErrorMessage } from "@/lib/api.lib";
import type { APIResponse, PaginatedData } from "backend/utils/response.util";
import type {
  EvaluationAnalyticsPayload,
  GenerateBatchIferReq,
  IferSelect,
  UnifiedFacultyReportDetail,
  UpdateDevelopmentPlanReq,
} from "backend/types/evaluation-report.type";
import type { CourseOfferingSearch, CourseOfferingWithDetails } from "backend/types/offerings.type";
import type { ScheduleSelect } from "backend/types/evaluation-schedule.type";
import type {
  SubmitSupervisorEvalReq,
  SupervisorEvalSelect,
} from "backend/types/evaluation-execution.type";

const BASE_REPORTS = "/protected/evaluation-reports";
const BASE_EXEC = "/protected/evaluation-execution";
const BASE_OFFERINGS = "/protected/course-offerings";
const BASE_ANALYTICS = "/protected/evaluation-analytics";
const BASE_SCHEDULES = "/protected/evaluation-schedules";

// ── 1. Analytics ─────────────────────────────────────────────────────────────

export const getSupervisorAnalytics = async (semesterId?: number) => {
  try {
    const q = semesterId ? `?semester_id=${semesterId}` : "";
    const res = await apiClient<APIResponse<EvaluationAnalyticsPayload>>(`${BASE_ANALYTICS}${q}`);
    return res.data.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, "Failed to load analytics data."), { cause: err });
  }
};

export const useSupervisorAnalytics = (semesterId?: number) => {
  return useQuery({
    queryKey: ["supervisorAnalytics", semesterId],
    queryFn: () => getSupervisorAnalytics(semesterId),
  });
};

// ── 2. Course Offerings (Who to evaluate) ───────────────────────────────────

export const getSupervisorCourseOfferings = async (params: Partial<CourseOfferingSearch> = {}) => {
  try {
    const res = await apiClient<APIResponse<PaginatedData<CourseOfferingWithDetails[]>>>(
      BASE_OFFERINGS,
      { params },
    );
    return res.data.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, "Failed to fetch course offerings."), { cause: err });
  }
};

export const useSupervisorOfferings = (params: Partial<CourseOfferingSearch> = {}) => {
  const fullParams: CourseOfferingSearch = {
    search: undefined,
    page: 1,
    orderBy: "id",
    orderDir: "asc",
    ...params,
  };

  return useQuery({
    queryKey: ["supervisorOfferings", fullParams],
    queryFn: () => getSupervisorCourseOfferings(fullParams),
  });
};

// ── 3. Evaluation Schedules ─────────────────────────────────────────────────

export const getSupervisorSchedules = async (semesterId?: number) => {
  try {
    const q = semesterId ? `?semester_id=${semesterId}` : "";
    const res = await apiClient<APIResponse<ScheduleSelect[]>>(
      `${BASE_SCHEDULES}/supervisor/schedules${q}`,
    );
    return res.data.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, "Failed to fetch supervisor schedules."), { cause: err });
  }
};

export const useSupervisorSchedules = (semesterId?: number) => {
  return useQuery({
    queryKey: ["supervisorSchedules", semesterId],
    queryFn: () => getSupervisorSchedules(semesterId),
  });
};

export const getActiveSupervisorSchedule = async (semesterId: number) => {
  try {
    const res = await apiClient<APIResponse<ScheduleSelect | null>>(
      `${BASE_SCHEDULES}/supervisor/schedules/active/${semesterId}`,
    );
    return res.data.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, "Failed to fetch active schedule."), { cause: err });
  }
};

export const useActiveSupervisorSchedule = (semesterId: number) => {
  return useQuery({
    queryKey: ["activeSupervisorSchedule", semesterId],
    queryFn: () => getActiveSupervisorSchedule(semesterId),
    enabled: !!semesterId && !isNaN(semesterId),
  });
};

// ── 4. Evaluation Execution (SEF) ───────────────────────────────────────────

export const getSupervisorEvaluation = async (scheduleId: number, courseOfferingId: number) => {
  try {
    const res = await apiClient<
      APIResponse<{ evaluation: SupervisorEvalSelect; ratings: unknown[] } | null>
    >(`${BASE_EXEC}/supervisor/schedule/${scheduleId}/course/${courseOfferingId}`);
    return res.data.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, "Failed to fetch supervisor evaluation."), { cause: err });
  }
};

export const useSupervisorEvaluation = (
  scheduleId?: number,
  courseOfferingId?: number,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: ["supervisorEval", scheduleId, courseOfferingId],
    queryFn: () => getSupervisorEvaluation(scheduleId!, courseOfferingId!),
    enabled: !!scheduleId && !!courseOfferingId && (options?.enabled ?? true),
  });
};

export const submitSupervisorEvaluation = async (payload: SubmitSupervisorEvalReq) => {
  try {
    const res = await apiClient.post<APIResponse<{ evaluation: SupervisorEvalSelect }>>(
      `${BASE_EXEC}/supervisor/submit`,
      payload,
    );
    return res.data.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, "Failed to submit evaluation."), { cause: err });
  }
};

export const useSubmitSupervisorEvaluation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitSupervisorEvaluation,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["supervisorEval", variables.schedule_id, variables.course_offering_id],
      });
      queryClient.invalidateQueries({ queryKey: ["supervisorOfferings"] });
      queryClient.invalidateQueries({ queryKey: ["supervisorAnalytics"] });
    },
  });
};

// ── 5. Reports & Development Plan (Managed + Self) ──────────────────────────

export const getSupervisorReports = async () => {
  try {
    const res =
      await apiClient<APIResponse<Array<IferSelect & { faculty_name: string | null }>>>(
        BASE_REPORTS,
      );
    return res.data.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, "Failed to load evaluation reports."), { cause: err });
  }
};

export const useSupervisorReports = () => {
  return useQuery({
    queryKey: ["supervisorReports"],
    queryFn: getSupervisorReports,
  });
};

export const getMyReports = async () => {
  try {
    const res = await apiClient<APIResponse<IferSelect[]>>(`${BASE_REPORTS}/my-reports`);
    return res.data.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, "Failed to load personal reports."), { cause: err });
  }
};

export const useMyReports = () => {
  return useQuery({
    queryKey: ["myReports"],
    queryFn: getMyReports,
  });
};

export const getReportDetail = async (reportId: number) => {
  try {
    const res = await apiClient<APIResponse<UnifiedFacultyReportDetail>>(
      `${BASE_REPORTS}/${reportId}`,
    );
    return res.data.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, "Failed to fetch report detail."), { cause: err });
  }
};

export const useReportDetail = (reportId: number) => {
  return useQuery({
    queryKey: ["reportDetail", reportId],
    queryFn: () => getReportDetail(reportId),
    enabled: !!reportId && !isNaN(reportId),
  });
};

export const generateBatchReports = async (payload: GenerateBatchIferReq) => {
  try {
    const res = await apiClient.post<APIResponse<{ generated_count: number }>>(
      `${BASE_REPORTS}/batch-generate`,
      payload,
    );
    return res.data.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, "Failed to generate batch reports."), { cause: err });
  }
};

export const useBatchGenerateReports = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateBatchReports,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supervisorReports"] });
      queryClient.invalidateQueries({ queryKey: ["myReports"] });
      queryClient.invalidateQueries({ queryKey: ["supervisorAnalytics"] });
    },
  });
};

export const updateDevelopmentPlan = async ({
  reportId,
  payload,
}: {
  reportId: number;
  payload: UpdateDevelopmentPlanReq;
}) => {
  try {
    const res = await apiClient.patch<APIResponse<IferSelect>>(
      `${BASE_REPORTS}/${reportId}/development-plan`,
      payload,
    );
    return res.data.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, "Failed to update development plan."), { cause: err });
  }
};

export const useUpdateDevelopmentPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDevelopmentPlan,
    onSuccess: (_, { reportId }) => {
      queryClient.invalidateQueries({ queryKey: ["reportDetail", reportId] });
      queryClient.invalidateQueries({ queryKey: ["supervisorReports"] });
    },
  });
};
