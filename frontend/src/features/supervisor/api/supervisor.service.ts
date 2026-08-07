import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, getErrorMessage } from "@/lib/api.lib";
import type { APIResponse, PaginatedData } from "backend/utils/response.util";
import type {
  EvaluationAnalyticsPayload,
  IferSelect,
  UnifiedFacultyReportDetail,
  UpdateDevelopmentPlanReq,
} from "backend/types/evaluation-report.type";

// ── Analytics ────────────────────────────────────────────────────────────────

export const getSupervisorAnalytics = async (semesterId?: number) => {
  try {
    const response = await apiClient<APIResponse<EvaluationAnalyticsPayload>>(
      `/protected/evaluation-analytics${semesterId ? `?semester_id=${semesterId}` : ""}`,
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to load analytics data."), { cause: error });
  }
};

export const useSupervisorAnalytics = (semesterId?: number) => {
  return useQuery({
    queryKey: ["supervisor-analytics", semesterId],
    queryFn: () => getSupervisorAnalytics(semesterId),
  });
};

// ── Course Offerings / Coverage Inspector ───────────────────────────────────

export const getSupervisorCourseOfferings = async (params?: {
  semester_id?: number;
  page?: number;
  search?: string;
}) => {
  try {
    const query = new URLSearchParams();
    if (params?.semester_id) query.append("semester_id", String(params.semester_id));
    if (params?.page) query.append("page", String(params.page));
    if (params?.search) query.append("search", params.search);

    const response = await apiClient<APIResponse<PaginatedData<CourseOfferingWithDetails[]>>>(
      `/protected/course-offerings?${query.toString()}`,
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch course offerings."), { cause: error });
  }
};

export const useSupervisorOfferings = (params?: {
  semester_id?: number;
  page?: number;
  search?: string;
}) => {
  return useQuery({
    queryKey: ["supervisor-offerings", params?.semester_id, params?.page, params?.search],
    queryFn: () => getSupervisorCourseOfferings(params),
    placeholderData: (previousData) => previousData,
  });
};

// ── Evaluation Execution ─────────────────────────────────────────────────────

export const submitSupervisorEvaluation = async (payload: SubmitSupervisorEvalReq) => {
  try {
    const response = await apiClient.post<APIResponse<unknown>>(
      "/protected/evaluation-execution/supervisor",
      payload,
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to submit evaluation."), { cause: error });
  }
};

export const useSubmitSupervisorEvaluation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitSupervisorEvaluation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supervisor-offerings"] });
      queryClient.invalidateQueries({ queryKey: ["supervisor-analytics"] });
    },
  });
};

// ── Reports Management ────────────────────────────────────────────────────────

export const getSupervisorReports = async () => {
  try {
    const response = await apiClient<
      APIResponse<Array<IferSelect & { faculty_name: string | null }>>
    >("/protected/evaluation-reports");
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to load evaluation reports."), { cause: error });
  }
};

export const useSupervisorReports = () => {
  return useQuery({
    queryKey: ["supervisor-reports"],
    queryFn: () => getSupervisorReports(),
  });
};

export const getReportDetail = async (reportId: number) => {
  try {
    const response = await apiClient<APIResponse<UnifiedFacultyReportDetail>>(
      `/protected/evaluation-reports/${reportId}`,
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch report details."), { cause: error });
  }
};

export const useReportDetail = (reportId: number) => {
  return useQuery({
    queryKey: ["supervisor-report-detail", reportId],
    queryFn: () => getReportDetail(reportId),
    enabled: !!reportId && !isNaN(reportId),
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
    const response = await apiClient.patch<APIResponse<IferSelect>>(
      `/protected/evaluation-reports/${reportId}/development-plan`,
      payload,
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to update development plan."), { cause: error });
  }
};

export const useUpdateDevelopmentPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDevelopmentPlan,
    onSuccess: (_, { reportId }) => {
      queryClient.invalidateQueries({ queryKey: ["supervisor-report-detail", reportId] });
      queryClient.invalidateQueries({ queryKey: ["supervisor-reports"] });
    },
  });
};
