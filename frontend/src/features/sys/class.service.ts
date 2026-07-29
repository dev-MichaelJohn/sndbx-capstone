import type { APIResponse, PaginatedData } from "backend/utils/response.util";
import { apiClient, getErrorMessage } from "../api.config";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type ClassInsert,
  type ClassSearch,
  type ClassSelect,
  type ClassUpdate,
} from "backend/types/class.type";

// ── Types ──────────────────────────────────────────────────────────────────
export type YearLevel = "I" | "II" | "III" | "IV" | "V";
export type Section = "A" | "B" | "C" | "D" | "E" | "F";

// ── API Functions ──────────────────────────────────────────────────────────

export const getClasses = async (params: ClassSearch) => {
  try {
    const url = params.program_id ? `/sys/programs/${params.program_id}/classes` : `/sys/classes`;

    const response = await apiClient<APIResponse<PaginatedData<ClassSelect[]>>>(url, {
      params,
    });
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch classes."), { cause: error });
  }
};

const getClassById = async (classId: number) => {
  try {
    const response = await apiClient<APIResponse<ClassSelect>>(`/sys/classes/${classId}`);
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch class details."), { cause: error });
  }
};

const createClassRecord = async (data: ClassInsert) => {
  try {
    const url = `/sys/programs/${data.program_id}/classes`;
    const response = await apiClient.post<APIResponse<ClassSelect>>(url, data);
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to create class record."), { cause: error });
  }
};

const updateClassRecord = async ({ id: class_id, ...data }: ClassUpdate) => {
  try {
    const response = await apiClient.patch<APIResponse<ClassSelect>>(
      `/sys/classes/${class_id}`,
      data,
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to update class record."), { cause: error });
  }
};

const deleteClassRecord = async (classId: number) => {
  try {
    const response = await apiClient.delete<APIResponse<null>>(`/sys/classes/${classId}`);
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to delete class record."), { cause: error });
  }
};

// ── React Query Hooks ──────────────────────────────────────────────────────

export const useClasses = (params: Partial<ClassSearch> = {}, options?: { enabled?: boolean }) => {
  const fullParams: ClassSearch = {
    search: undefined,
    page: 1,
    orderBy: "id",
    orderDir: "asc",
    ...params,
  };

  return useQuery({
    queryKey: ["classes", fullParams],
    queryFn: () => getClasses(fullParams),
    ...options,
  });
};

export const useProgramClassCount = (programId: number) => {
  const queryClient = useQueryClient();

  const queryKey = [
    "classes",
    {
      page: 1,
      program_id: programId,
      search: undefined,
    },
  ];

  const cachedData = queryClient.getQueryData<PaginatedData<ClassSelect[]>>(queryKey);

  return cachedData?.data?.length;
};

export const useClass = (classId: number) => {
  return useQuery({
    queryKey: ["class", classId],
    queryFn: () => getClassById(classId),
    enabled: !!classId && !isNaN(classId),
  });
};

export const useCreateClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createClassRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
  });
};

export const useUpdateClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateClassRecord,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["class", variables.id] });
    },
  });
};

export const useDeleteClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteClassRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
  });
};
