import type { APIResponse, PaginatedData } from "backend/utils/response.util";
import type {
  EligibleStudentOption,
  StudentClassInsert,
  StudentClassSearch,
  StudentClassSelect,
  StudentClassWithDetails,
} from "backend/types/student-class.type";
import { apiClient, getErrorMessage } from "@/lib/api.lib";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Fetch paginated student class records for a specific course offering[cite: 1, 4]
export const getCourseOfferingStudents = async (
  courseOfferingId: number,
  params: Partial<StudentClassSearch> = {},
) => {
  try {
    const response = await apiClient.get<APIResponse<PaginatedData<StudentClassWithDetails[]>>>(
      `/protected/course-offerings/${courseOfferingId}/student-classes`,
      { params },
    );
    return response.data.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Failed to fetch enrolled students for course offering."),
      { cause: error },
    );
  }
};

export const useCourseOfferingStudents = (
  courseOfferingId: number,
  params: Partial<StudentClassSearch>,
  options?: { enabled?: boolean },
) => {
  const fullParams: StudentClassSearch = {
    search: undefined,
    page: 1,
    orderBy: "id",
    orderDir: "asc",
    ...params,
  };

  return useQuery({
    queryKey: ["courseOfferings", courseOfferingId, "studentClasses", fullParams],
    queryFn: () => getCourseOfferingStudents(courseOfferingId, fullParams),
    enabled: !!courseOfferingId && (options?.enabled ?? true),
  });
};

// Fetch eligible students available for enrollment in a specific course offering
export const getEligibleStudentsForOffering = async (courseOfferingId: number, search?: string) => {
  try {
    const response = await apiClient.get<APIResponse<EligibleStudentOption[]>>(
      `/protected/course-offerings/${courseOfferingId}/student-classes/eligible-students`,
      { params: { search: search?.trim() || undefined } },
    );
    return response.data.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Failed to fetch eligible students for course offering."),
      { cause: error },
    );
  }
};

export const useEligibleStudentsForOffering = (
  courseOfferingId: number,
  search?: string,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: ["courseOfferings", courseOfferingId, "eligibleStudents", search],
    queryFn: () => getEligibleStudentsForOffering(courseOfferingId, search),
    enabled: !!courseOfferingId && (options?.enabled ?? true),
  });
};

// Enroll an irregular student in a course offering[cite: 1]
const enrollIrregularStudentRecord = async (payload: StudentClassInsert) => {
  try {
    const response = await apiClient.post<APIResponse<StudentClassSelect>>(
      "/protected/student-classes",
      payload,
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to enroll student."), {
      cause: error,
    });
  }
};

export const useEnrollIrregularStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: enrollIrregularStudentRecord,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["courseOfferings", variables.course_offering_id, "studentClasses"],
      });
      queryClient.invalidateQueries({
        queryKey: ["courseOfferings", variables.course_offering_id, "eligibleStudents"],
      });
    },
  });
};

// Drop a student from a course offering[cite: 1]
const dropStudentFromOfferingRecord = async (studentClassId: number) => {
  try {
    const response = await apiClient.delete<APIResponse>(
      `/protected/student-classes/${studentClassId}`,
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to drop student from course offering."), {
      cause: error,
    });
  }
};

export const useDropStudentFromOffering = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: dropStudentFromOfferingRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courseOfferings"] });
      queryClient.invalidateQueries({ queryKey: ["studentClasses"] });
    },
  });
};
