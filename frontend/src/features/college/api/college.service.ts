import type { APIResponse, PaginatedData } from "backend/utils/response.util";
import type {
  CollegeDeanSelect,
  CollegeSelect,
  CollegeWithDean,
  CreateCollegeRecordType,
  DeanCandidate,
  UpdateCollegeRecordType,
} from "backend/types/college.types";
import { apiClient, getErrorMessage, type BasicSearchProps } from "@/lib/api.lib";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

/**
 * Fetches paginated colleges joined with assigned Dean metadata.
 */
export const getColleges = async ({ page, search }: BasicSearchProps) => {
  try {
    const response = await apiClient<APIResponse<PaginatedData<CollegeWithDean[]>>>(
      `/protected/colleges?page=${page}&search=${search || ""}`,
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Something went wrong."), { cause: error });
  }
};

/**
 * Searches faculty accounts eligible for College Dean assignment.
 */
export const searchDeanCandidates = async (search?: string) => {
  try {
    const response = await apiClient<APIResponse<DeanCandidate[]>>(
      `/protected/colleges/available-deans?search=${search || ""}`,
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
    >(`/protected/colleges/${collegeId}`, {
      college,
      dean,
    });
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to update college record."), { cause: error });
  }
};

/**
 * Mutation hook for updating a college or reassigning a Dean.
 * Invalidates college list, user list, and current user cache (role sync).
 */
export const useUpdateCollege = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCollegeRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getColleges"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
};

const deleteCollegeRecord = async (collegeId: number) => {
  try {
    const response = await apiClient.delete<APIResponse>(`/protected/colleges/${collegeId}`, {});
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to delete college record."), { cause: error });
  }
};

/**
 * Mutation hook for soft-deleting a college record.
 * Invalidates college list, user list, and current user cache (role sync).
 */
export const useDeleteCollege = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCollegeRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getColleges"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
};

const createCollegeRecord = async ({ college, dean }: CreateCollegeRecordType) => {
  try {
    const response = await apiClient.post<
      APIResponse<Promise<{ college?: CollegeSelect; dean?: CollegeDeanSelect }>>
    >("/protected/colleges", { college, dean });
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to create college record."), { cause: error });
  }
};

/**
 * Mutation hook for creating a college record and optional Dean assignment.
 * Invalidates college list, user list, and current user cache (role sync).
 */
export const useCreateCollege = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCollegeRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getColleges"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
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
