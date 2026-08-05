import { apiClient, getErrorMessage } from "@/lib/api.lib";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { APIResponse } from "backend/utils/response.util";
import type {
  GenerateBatchIferReq,
  IferSelect,
  UnifiedFacultyReportDetail,
  UpdateDevelopmentPlanReq,
  UpdateIferStatusReq,
} from "backend/types/evaluation-report.type";

const BASE = "protected/evaluation-reports";

export const getAllReportsApi = async (): Promise<
  Array<IferSelect & { faculty_name?: string }>
> => {
  try {
    const res = await apiClient<APIResponse<Array<IferSelect & { faculty_name?: string }>>>(
      `${BASE}`,
    );
    if (!res.data.data) throw new Error("Reports payload is empty.");
    return res.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to load evaluation reports."));
  }
};

export const getMyReportsApi = async (): Promise<IferSelect[]> => {
  try {
    const res = await apiClient<APIResponse<IferSelect[]>>(`${BASE}/my-reports`);
    if (!res.data.data) throw new Error("Reports payload is empty.");
    return res.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to load evaluation reports."));
  }
};

export const getFacultyReportsApi = async (facultyId: number): Promise<IferSelect[]> => {
  try {
    const res = await apiClient<APIResponse<IferSelect[]>>(`${BASE}/faculty/${facultyId}`);
    if (!res.data.data) throw new Error("Faculty reports payload is empty.");
    return res.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to load faculty evaluation reports."));
  }
};

export const getReportDetailApi = async (reportId: number): Promise<UnifiedFacultyReportDetail> => {
  try {
    const res = await apiClient<APIResponse<UnifiedFacultyReportDetail>>(`${BASE}/${reportId}`);
    if (!res.data.data) throw new Error("Report detail payload is empty.");
    return res.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to load evaluation report details."));
  }
};

export const generateBatchReportsApi = async (
  payload: GenerateBatchIferReq,
): Promise<{ generated_count: number }> => {
  try {
    const res = await apiClient.post<APIResponse<{ generated_count: number }>>(
      `${BASE}/batch-generate`,
      payload,
    );
    if (!res.data.data) throw new Error("Batch generation response is empty.");
    return res.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to generate batch evaluation reports."));
  }
};

export const saveDevelopmentPlanApi = async (
  reportId: number,
  payload: UpdateDevelopmentPlanReq,
): Promise<IferSelect> => {
  try {
    const res = await apiClient.patch<APIResponse<IferSelect>>(
      `${BASE}/${reportId}/development-plan`,
      payload,
    );
    if (!res.data.data) throw new Error("Development plan response is empty.");
    return res.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to save FEDAF development plan."));
  }
};

export const acknowledgeReportApi = async (reportId: number): Promise<IferSelect> => {
  try {
    const res = await apiClient.patch<APIResponse<IferSelect>>(`${BASE}/${reportId}/acknowledge`);
    if (!res.data.data) throw new Error("Acknowledgment response is empty.");
    return res.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to acknowledge evaluation report."));
  }
};

export const updateReportStatusApi = async (
  reportId: number,
  payload: UpdateIferStatusReq,
): Promise<IferSelect> => {
  try {
    const res = await apiClient.patch<APIResponse<IferSelect>>(
      `${BASE}/${reportId}/status`,
      payload,
    );
    if (!res.data.data) throw new Error("Status update response is empty.");
    return res.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to update report status."));
  }
};

export const downloadIferPdf = async (reportId: number): Promise<void> => {
  try {
    const res = await apiClient.get(`${BASE}/${reportId}/ifer/pdf`, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `IFER-Report-${reportId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to download IFER document."));
  }
};

export const downloadFedafPdf = async (reportId: number): Promise<void> => {
  try {
    const res = await apiClient.get(`${BASE}/${reportId}/fedaf/pdf`, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `FEDAF-Report-${reportId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to download FEDAF document."));
  }
};

// ============================================================================
// 3. REACT QUERY HOOKS (Cache & Lifecycle Management)
// ============================================================================

export const useAllReports = () => {
  return useQuery({
    queryKey: ["getAllReports"],
    queryFn: getAllReportsApi,
  });
};

export const useMyReports = () => {
  return useQuery({
    queryKey: ["getMyReports"],
    queryFn: getMyReportsApi,
  });
};

export const useFacultyReports = (facultyId?: number) => {
  return useQuery({
    queryKey: ["getFacultyReports", facultyId],
    queryFn: () => getFacultyReportsApi(facultyId!),
    enabled: Boolean(facultyId) && !isNaN(facultyId!),
  });
};

export const useReportDetail = (reportId: number) => {
  return useQuery({
    queryKey: ["getReportDetail", reportId],
    queryFn: () => getReportDetailApi(reportId),
    enabled: Boolean(reportId) && !isNaN(reportId),
  });
};

export const useGenerateBatchReports = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateBatchReportsApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getAllReports"] });
      queryClient.invalidateQueries({ queryKey: ["getMyReports"] });
      queryClient.invalidateQueries({ queryKey: ["getFacultyReports"] });
    },
  });
};

export const useSaveDevelopmentPlan = (reportId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateDevelopmentPlanReq) => saveDevelopmentPlanApi(reportId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getReportDetail", reportId] });
    },
  });
};

export const useAcknowledgeReport = (reportId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => acknowledgeReportApi(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getReportDetail", reportId] });
      queryClient.invalidateQueries({ queryKey: ["getMyReports"] });
      queryClient.invalidateQueries({ queryKey: ["getAllReports"] });
    },
  });
};

export const useUpdateReportStatus = (reportId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateIferStatusReq) => updateReportStatusApi(reportId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getReportDetail", reportId] });
      queryClient.invalidateQueries({ queryKey: ["getMyReports"] });
      queryClient.invalidateQueries({ queryKey: ["getFacultyReports"] });
      queryClient.invalidateQueries({ queryKey: ["getAllReports"] });
    },
  });
};
