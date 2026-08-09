import { useQuery } from "@tanstack/react-query";
import { apiClient, getErrorMessage } from "@/lib/api.lib";
import type { APIResponse, PaginatedData } from "backend/utils/response.util";
import type { StudentClassWithDetails } from "backend/types/student-class.type";
import type { ScheduleSelect } from "backend/types/evaluation-schedule.type";

/**
 * Fetches all enrolled course offerings for the current student.
 */
export const getMyEnrolledClasses = async (studentAccountId: number) => {
  try {
    const response = await apiClient.get<APIResponse<PaginatedData<StudentClassWithDetails[]>>>(
      "/protected/student-classes",
      { params: { student_account_id: studentAccountId } },
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch enrolled classes."), { cause: error });
  }
};

export const useMyEnrolledClasses = (studentAccountId?: number) => {
  return useQuery({
    queryKey: ["myEnrolledClasses", studentAccountId],
    queryFn: () => getMyEnrolledClasses(studentAccountId!),
    enabled: !!studentAccountId && !isNaN(studentAccountId),
  });
};

/**
 * Fetches active SET evaluation schedules.
 */
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
