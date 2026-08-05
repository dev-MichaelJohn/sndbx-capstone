import type { APIResponse, PaginatedData } from "backend/utils/response.util";
import type {
  ClassStudentInsert,
  ClassStudentSearch,
  ClassStudentSelect,
  ClassStudentWithDetails,
} from "backend/types/class-student.type";
import { apiClient, getErrorMessage } from "@/srcx/lib/api.lib";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Fetch paginated class student records (filterable by class_id or student_account_id)
export const getClassStudents = async (params: ClassStudentSearch) => {
  try {
    const response = await apiClient.get<APIResponse<PaginatedData<ClassStudentWithDetails[]>>>(
      "/protected/class-students",
      {
        params,
      },
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch class student records."), {
      cause: error,
    });
  }
};

export const useClassStudents = (
  params: Partial<ClassStudentSearch>,
  options?: { enabled?: boolean },
) => {
  const fullParams: ClassStudentSearch = {
    search: undefined,
    page: 1,
    orderBy: "id",
    orderDir: "asc",
    ...params,
  };

  return useQuery({
    queryKey: ["getClassStudents", fullParams],
    queryFn: () => getClassStudents(fullParams),
    ...options,
  });
};

export const useClassStudentCount = (classId: number) => {
  const { data, isLoading } = useClassStudents(
    { class_id: classId, page: 1 },
    { enabled: !!classId },
  );

  return {
    data: data?.pagination?.totalItems ?? 0,
    isLoading,
  };
};

// Fetch single class student record by ID
export const getClassStudent = async (id: number) => {
  try {
    const response = await apiClient.get<APIResponse<ClassStudentWithDetails>>(
      `/protected/class-students/${id}`,
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch class student details."), {
      cause: error,
    });
  }
};

export const useClassStudent = (id: number) => {
  return useQuery({
    queryKey: ["getClassStudent", id],
    queryFn: () => getClassStudent(id),
    enabled: !!id,
  });
};

// Enroll a student in a class
const enrollStudentRecord = async (payload: ClassStudentInsert) => {
  try {
    const response = await apiClient.post<APIResponse<ClassStudentSelect>>(
      "/protected/class-students",
      payload,
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to enroll student in class."), { cause: error });
  }
};

export const useEnrollStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: enrollStudentRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getClassStudents"] });
    },
  });
};

// Drop a student from a class roster
const dropStudentRecord = async (classStudentId: number) => {
  try {
    const response = await apiClient.delete<APIResponse>(
      `/protected/class-students/${classStudentId}`,
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to drop student from class."), { cause: error });
  }
};

export const useDropStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: dropStudentRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getClassStudents"] });
    },
  });
};
