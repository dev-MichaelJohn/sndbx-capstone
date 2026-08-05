import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, getErrorMessage } from "@/lib/api.lib";
import type { APIResponse } from "backend/utils/response.util";
import type {
  EvaluationType,
  ScheduleSelect,
  UpsertScheduleReq,
} from "backend/types/evaluation-schedule.type";

const BASE_API = "/protected/evaluation-schedules";

// ── Base Fetchers ────────────────────────────────────────────────────────────

export const getSchedules = async (type: EvaluationType, semesterId?: number) => {
  try {
    const query = semesterId ? `?semester_id=${semesterId}` : "";
    const response = await apiClient<APIResponse<ScheduleSelect[]>>(
      `${BASE_API}/${type}/schedules${query}`,
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch evaluation schedules."), {
      cause: error,
    });
  }
};

export const getScheduleById = async (type: EvaluationType, id: number) => {
  try {
    const response = await apiClient<APIResponse<ScheduleSelect>>(
      `${BASE_API}/${type}/schedules/${id}`,
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch schedule details."), {
      cause: error,
    });
  }
};

export const getActiveSchedule = async (type: EvaluationType, semesterId: number) => {
  try {
    const response = await apiClient<APIResponse<ScheduleSelect | null>>(
      `${BASE_API}/${type}/schedules/active/${semesterId}`,
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to check active schedule."), {
      cause: error,
    });
  }
};

export const createScheduleRecord = async ({
  type,
  payload,
}: {
  type: EvaluationType;
  payload: UpsertScheduleReq;
}) => {
  try {
    const response = await apiClient.post<APIResponse<{ schedule: ScheduleSelect }>>(
      `${BASE_API}/${type}/schedules`,
      payload,
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to create evaluation schedule."), {
      cause: error,
    });
  }
};

export const updateScheduleRecord = async ({
  type,
  id,
  payload,
}: {
  type: EvaluationType;
  id: number;
  payload: Partial<UpsertScheduleReq>;
}) => {
  try {
    const response = await apiClient.patch<APIResponse<{ schedule: ScheduleSelect }>>(
      `${BASE_API}/${type}/schedules/${id}`,
      payload,
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to update evaluation schedule."), {
      cause: error,
    });
  }
};

export const deleteScheduleRecord = async ({ type, id }: { type: EvaluationType; id: number }) => {
  try {
    const response = await apiClient.delete<APIResponse<null>>(
      `${BASE_API}/${type}/schedules/${id}`,
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to delete schedule record."), {
      cause: error,
    });
  }
};

// ── React Query Hooks ────────────────────────────────────────────────────────

export const useSchedules = (type: EvaluationType, semesterId?: number) => {
  return useQuery({
    queryKey: ["getSchedules", type, semesterId],
    queryFn: () => getSchedules(type, semesterId),
  });
};

export const useSchedule = (type: EvaluationType, id: number) => {
  return useQuery({
    queryKey: ["getSchedule", type, id],
    queryFn: () => getScheduleById(type, id),
    enabled: !!id && !isNaN(id),
  });
};

export const useActiveSchedule = (type: EvaluationType, semesterId: number) => {
  return useQuery({
    queryKey: ["getActiveSchedule", type, semesterId],
    queryFn: () => getActiveSchedule(type, semesterId),
    enabled: !!semesterId && !isNaN(semesterId),
  });
};

export const useCreateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createScheduleRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getSchedules"] });
      queryClient.invalidateQueries({ queryKey: ["getActiveSchedule"] });
    },
  });
};

export const useUpdateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateScheduleRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getSchedules"] });
      queryClient.invalidateQueries({ queryKey: ["getSchedule"] });
      queryClient.invalidateQueries({ queryKey: ["getActiveSchedule"] });
    },
  });
};

export const useDeleteSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteScheduleRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getSchedules"] });
      queryClient.invalidateQueries({ queryKey: ["getActiveSchedule"] });
    },
  });
};
