import type { APIResponse, PaginatedData } from "backend/utils/response.util";
import type {
  ChairCandidateType,
  CreateProgramType,
  ProgramWithChairType,
  UpdateProgramType,
} from "backend/types/program.type";
import { apiClient, getErrorMessage } from "@/srcx/lib/api.lib";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export const getPrograms = async (search?: string) => {
  try {
    const response = await apiClient<APIResponse<PaginatedData<ProgramWithChairType[]>>>(
      `/protected/programs?search=${search || ""}`,
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Something went wrong."), { cause: error });
  }
};

export const getProgramsViaCollegeID = async (collegeId: number, search?: string) => {
  try {
    const response = await apiClient<APIResponse<PaginatedData<ProgramWithChairType[]>>>(
      `/protected/colleges/${collegeId}/programs?search=${search || ""}`,
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Something went wrong."), { cause: error });
  }
};

const getProgramById = async (programId: number) => {
  try {
    const response = await apiClient<APIResponse<ProgramWithChairType>>(
      `/protected/programs/${programId}`,
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch program details."), { cause: error });
  }
};

export const useProgram = (programId: number) => {
  return useQuery({
    queryKey: ["program", programId],
    queryFn: () => getProgramById(programId),
    enabled: !!programId && !isNaN(programId),
  });
};

const createProgramRecord = async ({ program, chair }: CreateProgramType) => {
  try {
    const response = await apiClient.post<APIResponse<ProgramWithChairType>>(
      "/protected/programs/",
      {
        program,
        chair,
      },
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Something went wrong."), { cause: error });
  }
};

export const useCreateProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProgramRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getProgramsViaCollegeID"] });
    },
  });
};

const updateProgramRecord = async ({ program_id, program, chair }: UpdateProgramType) => {
  try {
    const response = await apiClient.put<APIResponse<ProgramWithChairType>>(
      `/protected/programs/${program_id}`,
      {
        program,
        chair,
      },
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to update program record."), { cause: error });
  }
};

export const useUpdateProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProgramRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getProgramsViaCollegeID"] });
    },
  });
};

const deleteProgramRecord = async (programId: number) => {
  try {
    const response = await apiClient.delete<APIResponse>(`/protected/programs/${programId}`, {});
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to delete program record."), { cause: error });
  }
};

export const useDeleteProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProgramRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getProgramsViaCollegeID"] });
    },
  });
};

export const searchChairCandidates = async (search?: string) => {
  try {
    const response = await apiClient<APIResponse<ChairCandidateType[]>>(
      `/protected/programs/available-chairs?search=${search || ""}`,
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Something went wrong."), { cause: error });
  }
};

export const useSearchChairCandidates = (search?: string) => {
  return useQuery({
    queryKey: ["searchChairCandidates", search],
    queryFn: () => searchChairCandidates(search),
    enabled: !!search && search.length >= 2,
  });
};

export function useChairSelection(initial: ChairCandidateType | null) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selected, setSelected] = useState<ChairCandidateType | null>(initial);

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handle);
  }, [search]);

  const { data: candidates, isFetching: isSearching } = useSearchChairCandidates(debouncedSearch);

  const reset = (next: ChairCandidateType | null = initial) => {
    setSearch("");
    setDebouncedSearch("");
    setSelected(next);
  };

  return { search, setSearch, candidates, isSearching, selected, setSelected, reset };
}
