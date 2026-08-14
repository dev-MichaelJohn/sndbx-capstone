import { useQuery } from "@tanstack/react-query";
import { apiClient, getErrorMessage } from "@/lib/api.lib";
import type { APIResponse, PaginatedData } from "backend/utils/response.util";
import type { StudentClassWithDetails } from "backend/types/student-class.type";
import type { ScheduleSelect } from "backend/types/evaluation-schedule.type";

export const getMyEnrolledClasses = async (studentAccountId: number, semesterId?: number) => {
  try {
    const params: Record<string, any> = {
      student_account_id: studentAccountId,
    };

    if (semesterId !== undefined && !isNaN(semesterId)) {
      params.semester_id = semesterId;
    }

    const response = await apiClient.get<APIResponse<PaginatedData<StudentClassWithDetails[]>>>(
      "/protected/student-classes",
      { params },
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch enrolled classes."), { cause: error });
  }
};

export const useMyEnrolledClasses = (
  studentAccountId?: number,
  semesterId?: number,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: ["myEnrolledClasses", studentAccountId, semesterId],
    queryFn: () => getMyEnrolledClasses(studentAccountId!, semesterId),
    enabled: !!studentAccountId && !isNaN(studentAccountId) && (options?.enabled ?? true),
  });
};

export const getActiveStudentSchedule = async (semesterId?: number) => {
  try {
    const queryParam = semesterId ? `?semester_id=${semesterId}` : "";
    const response = await apiClient.get<APIResponse<ScheduleSelect[]>>(
      `/protected/evaluation-schedules/student/schedules${queryParam}`,
    );
    return response.data.data ?? [];
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch active evaluation schedule."), {
      cause: error,
    });
  }
};

export const useActiveStudentSchedule = (semesterId?: number) => {
  return useQuery({
    queryKey: ["activeStudentSchedule", semesterId],
    queryFn: () => getActiveStudentSchedule(semesterId),
  });
};
