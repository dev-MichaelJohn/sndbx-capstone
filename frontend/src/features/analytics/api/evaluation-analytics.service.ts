import type { APIResponse } from "backend/utils/response.util";
import type { EvaluationAnalyticsPayload } from "backend/types/evaluation-analytics.type";
import { apiClient, getErrorMessage } from "@/lib/api.lib";
import { useQuery } from "@tanstack/react-query";

export const getEvaluationAnalytics = async (semesterId?: number) => {
  try {
    const queryParam = semesterId ? `?semester_id=${semesterId}` : "";
    const response = await apiClient<APIResponse<EvaluationAnalyticsPayload>>(
      `/protected/evaluation-analytics${queryParam}`,
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch evaluation analytics."), {
      cause: error,
    });
  }
};

export const useEvaluationAnalytics = (semesterId?: number) => {
  return useQuery({
    queryKey: ["evaluationAnalytics", semesterId],
    queryFn: () => getEvaluationAnalytics(semesterId),
    placeholderData: (previousData) => previousData,
  });
};
