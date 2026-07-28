import type { APIResponse, PaginatedData } from "backend/utils/response.util";
import type {
  CollegeDeanSelect,
  CollegeSelect,
  CollegeWithDean,
  CreateCollegeRecordType,
  DeanCandidate,
  UpdateCollegeRecordType,
} from "backend/types/college.types";
import { apiClient, getErrorMessage, type BasicSearchProps } from "../api.config";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export const getColleges = async ({ page, search }: BasicSearchProps) => {
  try {
    const response = await apiClient<APIResponse<PaginatedData<CollegeWithDean[]>>>(
      `/sys/colleges?page=${page}&search=${search || ""}`,
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Something went wrong."), { cause: error });
  }
};

export const searchDeanCandidates = async (search?: string) => {
  try {
    const response = await apiClient<APIResponse<DeanCandidate[]>>(
      `/sys/colleges/available-deans?search=${search || ""}`,
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Something went wrong."), { cause: error });
  }
};

export const useSearchDeanCandidates = (search?: string) => {
  return useQuery({
    queryKey: ["searchDeanCandidates", search],
    queryFn: () => searchDeanCandidates(search),
    enabled: !!search && search.length >= 2,
  });
};

const updateCollegeRecord = async ({ collegeId, college, dean }: UpdateCollegeRecordType) => {
  try {
    const response = await apiClient.put<
      APIResponse<Promise<{ college?: CollegeSelect; dean?: CollegeDeanSelect }>>
    >(`/sys/colleges/${collegeId}`, {
      college,
      dean,
    });
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to update college record."), { cause: error });
  }
};

export const useUpdateCollege = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCollegeRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getColleges"] });
    },
  });
};

const deleteCollegeRecord = async (collegeId: number) => {
  try {
    const response = await apiClient.delete<APIResponse>(`/sys/colleges/${collegeId}`, {});
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to delete college record."), { cause: error });
  }
};

export const useDeleteCollege = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCollegeRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getColleges"] });
    },
  });
};

const createCollegeRecord = async ({ college, dean }: CreateCollegeRecordType) => {
  try {
    const response = await apiClient.post<
      APIResponse<Promise<{ college?: CollegeSelect; dean?: CollegeDeanSelect }>>
    >("/sys/colleges", { college, dean });
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to create college record."), { cause: error });
  }
};

export const useCreateCollege = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCollegeRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getColleges"] });
    },
  });
};

export function useDeanSelection(initial: DeanCandidate | null) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selected, setSelected] = useState<DeanCandidate | null>(initial);

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handle);
  }, [search]);

  const { data: candidates, isFetching: isSearching } = useSearchDeanCandidates(debouncedSearch);

  const reset = (next: DeanCandidate | null = initial) => {
    setSearch("");
    setDebouncedSearch("");
    setSelected(next);
  };

  return { search, setSearch, candidates, isSearching, selected, setSelected, reset };
}
