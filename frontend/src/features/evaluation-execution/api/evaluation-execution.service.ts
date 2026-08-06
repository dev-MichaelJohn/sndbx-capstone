import { useEffect } from "react";
import type { APIResponse } from "backend/utils/response.util";
import type {
  SubmitStudentEvalReq,
  SubmitSupervisorEvalReq,
  StudentEvalSelect,
  SupervisorEvalSelect,
} from "backend/types/evaluation-execution.type";
import type { AnonymousSubmissionEvent } from "backend/types/socket.type";
import { apiClient, getErrorMessage } from "@/lib/api.lib";
import { socket } from "@/lib/socket.lib";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const EVALUATION_EXECUTION_KEYS = {
  recentSubmissions: ["getRecentSubmissions"] as const,
  studentEval: (scheduleId?: number, studentClassId?: number) =>
    ["getStudentEvaluation", scheduleId, studentClassId] as const,
  supervisorEval: (scheduleId?: number, courseOfferingId?: number) =>
    ["getSupervisorEvaluation", scheduleId, courseOfferingId] as const,
};

export const getRecentAnonymousSubmissions = async () => {
  try {
    const response = await apiClient<APIResponse<AnonymousSubmissionEvent[]>>(
      "/protected/evaluation-execution/recent-submissions",
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch recent submissions."), {
      cause: error,
    });
  }
};

export const useRecentAnonymousSubmissions = () => {
  return useQuery({
    queryKey: EVALUATION_EXECUTION_KEYS.recentSubmissions,
    queryFn: getRecentAnonymousSubmissions,
    staleTime: 1000 * 60,
  });
};

export const useEvaluationSocket = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    const handleLiveSubmission = (event: AnonymousSubmissionEvent) => {
      queryClient.setQueryData<AnonymousSubmissionEvent[]>(
        EVALUATION_EXECUTION_KEYS.recentSubmissions,
        (previousData = []) => {
          const filtered = previousData.filter((item) => item.id !== event.id);
          return [event, ...filtered].slice(0, 10);
        },
      );
    };

    socket.on("evaluation:submitted", handleLiveSubmission);

    return () => {
      socket.off("evaluation:submitted", handleLiveSubmission);
    };
  }, [queryClient]);
};

export const getStudentEvaluation = async (scheduleId: number, studentClassId: number) => {
  try {
    const response = await apiClient<
      APIResponse<{ evaluation: StudentEvalSelect; ratings: unknown[] } | null>
    >(`/protected/evaluation-execution/student/schedule/${scheduleId}/class/${studentClassId}`);
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch student evaluation."), {
      cause: error,
    });
  }
};

export const useStudentEvaluation = (
  scheduleId?: number,
  studentClassId?: number,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: EVALUATION_EXECUTION_KEYS.studentEval(scheduleId, studentClassId),
    queryFn: () => getStudentEvaluation(scheduleId!, studentClassId!),
    enabled: !!scheduleId && !!studentClassId && (options?.enabled ?? true),
  });
};

const submitStudentEvaluation = async (payload: SubmitStudentEvalReq) => {
  try {
    const response = await apiClient.post<APIResponse<{ evaluation: StudentEvalSelect }>>(
      "/protected/evaluation-execution/student/submit",
      payload,
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to save student evaluation."), {
      cause: error,
    });
  }
};

export const useSubmitStudentEvaluation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitStudentEvaluation,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: EVALUATION_EXECUTION_KEYS.studentEval(
          variables.schedule_id,
          variables.student_class_id,
        ),
      });
      queryClient.invalidateQueries({
        queryKey: EVALUATION_EXECUTION_KEYS.recentSubmissions,
      });
    },
  });
};

export const getSupervisorEvaluation = async (scheduleId: number, courseOfferingId: number) => {
  try {
    const response = await apiClient<
      APIResponse<{ evaluation: SupervisorEvalSelect; ratings: unknown[] } | null>
    >(
      `/protected/evaluation-execution/supervisor/schedule/${scheduleId}/course/${courseOfferingId}`,
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch supervisor evaluation."), {
      cause: error,
    });
  }
};

export const useSupervisorEvaluation = (
  scheduleId?: number,
  courseOfferingId?: number,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: EVALUATION_EXECUTION_KEYS.supervisorEval(scheduleId, courseOfferingId),
    queryFn: () => getSupervisorEvaluation(scheduleId!, courseOfferingId!),
    enabled: !!scheduleId && !!courseOfferingId && (options?.enabled ?? true),
  });
};

const submitSupervisorEvaluation = async (payload: SubmitSupervisorEvalReq) => {
  try {
    const response = await apiClient.post<APIResponse<{ evaluation: SupervisorEvalSelect }>>(
      "/protected/evaluation-execution/supervisor/submit",
      payload,
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to save supervisor evaluation."), {
      cause: error,
    });
  }
};

export const useSubmitSupervisorEvaluation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitSupervisorEvaluation,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: EVALUATION_EXECUTION_KEYS.supervisorEval(
          variables.schedule_id,
          variables.course_offering_id,
        ),
      });
      queryClient.invalidateQueries({
        queryKey: EVALUATION_EXECUTION_KEYS.recentSubmissions,
      });
    },
  });
};
