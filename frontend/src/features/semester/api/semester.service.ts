import type { APIResponse, PaginatedData } from "backend/utils/response.util";
import type {
  SemesterInsert,
  SemesterSearch,
  SemesterSelect,
  SemesterUpdate,
} from "backend/types/semester.type";
import { apiClient, getErrorMessage } from "@/lib/api.lib";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const getSemesters = async (params: SemesterSearch) => {
  try {
    const response = await apiClient.get<APIResponse<PaginatedData<SemesterSelect[]>>>(
      "/protected/semesters",
      { params },
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch semesters."), { cause: error });
  }
};

export const useSemesters = (params: SemesterSearch) => {
  return useQuery({
    queryKey: ["getSemesters", params],
    queryFn: () => getSemesters(params),
    staleTime: 1000 * 60 * 5, // 5 minutes cache TTL
  });
};

export const getSemester = async (id: number) => {
  try {
    const response = await apiClient.get<APIResponse<SemesterSelect>>(`/protected/semesters/${id}`);
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch semester details."), { cause: error });
  }
};

export const useSemester = (id: number) => {
  return useQuery({
    queryKey: ["getSemester", id],
    queryFn: () => getSemester(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

const createSemesterRecord = async (payload: SemesterInsert) => {
  try {
    const response = await apiClient.post<APIResponse<SemesterSelect>>(
      "/protected/semesters",
      payload,
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to create semester record."), { cause: error });
  }
};

export const useCreateSemester = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSemesterRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getSemesters"] });
    },
  });
};

const updateSemesterRecord = async ({
  semester_id,
  ...payload
}: SemesterUpdate & { semester_id: number }) => {
  try {
    const response = await apiClient.put<APIResponse<SemesterSelect>>(
      `/protected/semesters/${semester_id}`,
      payload,
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to update semester record."), { cause: error });
  }
};

export const useUpdateSemester = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSemesterRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getSemesters"] });
    },
  });
};

const deleteSemesterRecord = async (semesterId: number) => {
  try {
    const response = await apiClient.delete<APIResponse>(`/protected/semesters/${semesterId}`);
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to delete semester record."), { cause: error });
  }
};

export const useDeleteSemester = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSemesterRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getSemesters"] });
    },
  });
};
