import type { APIResponse } from "backend/utils/response.util";
import type {
  CurriculumInsert,
  CurriculumSearch,
  CurriculumSelect,
  CurriculumUpdate,
  CurriculumWithDetails,
} from "backend/types/curriculum.type";
import { apiClient, getErrorMessage } from "@/lib/api.lib";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const getCurriculums = async (params: CurriculumSearch) => {
  try {
    const { program_id, ...queryParams } = params;
    const endpoint = program_id
      ? `/protected/programs/${program_id}/curriculum`
      : "/protected/curriculum";

    const response = await apiClient.get<APIResponse<CurriculumWithDetails[]>>(endpoint, {
      params: queryParams,
    });
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch curriculum records."), {
      cause: error,
    });
  }
};

export const useCurriculums = (
  params: Partial<CurriculumSearch>,
  options?: { enabled?: boolean },
) => {
  const fullParams: CurriculumSearch = {
    search: undefined,
    page: 1,
    orderBy: "id",
    orderDir: "asc",
    ...params,
  };

  return useQuery({
    queryKey: ["getCurriculums", fullParams],
    queryFn: () => getCurriculums(fullParams),
    ...options,
  });
};
// Fetch single curriculum by ID
export const getCurriculum = async (id: number) => {
  try {
    const response = await apiClient.get<APIResponse<CurriculumWithDetails>>(
      `/protected/curriculum/${id}`,
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch curriculum details."), {
      cause: error,
    });
  }
};

export const useCurriculum = (id: number) => {
  return useQuery({
    queryKey: ["getCurriculum", id],
    queryFn: () => getCurriculum(id),
    enabled: !!id,
  });
};

// Create curriculum record
const createCurriculumRecord = async (payload: CurriculumInsert) => {
  try {
    const response = await apiClient.post<APIResponse<CurriculumSelect>>(
      `/protected/programs/${payload.program_id}/curriculum`,
      payload,
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to create curriculum record."), {
      cause: error,
    });
  }
};

export const useCreateCurriculum = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCurriculumRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getCurriculums"] });
    },
  });
};

// Update curriculum record
const updateCurriculumRecord = async ({
  curriculum_id,
  ...payload
}: CurriculumUpdate & { curriculum_id: number }) => {
  try {
    const response = await apiClient.put<APIResponse<CurriculumSelect>>(
      `/protected/curriculum/${curriculum_id}`,
      payload,
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to update curriculum record."), {
      cause: error,
    });
  }
};

export const useUpdateCurriculum = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCurriculumRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getCurriculums"] });
    },
  });
};

// Delete curriculum record
const deleteCurriculumRecord = async (curriculumId: number) => {
  try {
    const response = await apiClient.delete<APIResponse>(`/protected/curriculum/${curriculumId}`);
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to delete curriculum record."), {
      cause: error,
    });
  }
};

export const useDeleteCurriculum = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCurriculumRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getCurriculums"] });
    },
  });
};
