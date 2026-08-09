import type { APIResponse, PaginatedData } from "backend/utils/response.util";
import type {
  ChairCandidateType,
  CreateProgramType,
  ProgramWithChairType,
  UpdateProgramType,
} from "backend/types/program.type";
import { apiClient, getErrorMessage } from "@/lib/api.lib";
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

/**
 * Mutation hook for creating a program record and optional Chair assignment.
 * Invalidates program queries, user list, and current user cache (role sync).
 */
export const useCreateProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProgramRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getProgramsViaCollegeID"] });
      queryClient.invalidateQueries({ queryKey: ["getPrograms"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
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

/**
 * Mutation hook for updating a program or reassigning a Chair.
 * Invalidates program queries, user list, and current user cache (role sync).
 */
export const useUpdateProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProgramRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getProgramsViaCollegeID"] });
      queryClient.invalidateQueries({ queryKey: ["getPrograms"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
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

/**
 * Mutation hook for soft-deleting a program record.
 * Invalidates program queries, user list, and current user cache (role sync).
 */
export const useDeleteProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProgramRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getProgramsViaCollegeID"] });
      queryClient.invalidateQueries({ queryKey: ["getPrograms"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
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

export const fetchProgramStudentCount = async (programId: number): Promise<number> => {
  try {
    // 1. Get classes for this program
    const classesRes = await apiClient.get("/protected/classes", {
      params: { program_id: programId, page: 1 },
    });
    const classes = classesRes.data.data.data ?? [];

    if (classes.length === 0) return 0;

    let totalStudents = 0;

    // 2. Loop through classes to find course offerings
    for (const cls of classes) {
      const offeringsRes = await apiClient.get("/protected/course-offerings", {
        params: { class_id: cls.id, page: 1 },
      });
      const offerings = offeringsRes.data.data.data ?? [];

      // 3. For each offering, get the student count using pagination total items
      for (const offering of offerings) {
        const studentsRes = await apiClient.get(
          `/protected/course-offerings/${offering.id}/student-classes`,
          {
            params: { page: 1, limit: 1 }, // Just request page 1 to read the total pagination count
          },
        );

        // If your backend returns pagination metadata with total count:
        const totalInOffering =
          studentsRes.data.data.pagination?.totalItems ?? studentsRes.data.data.data?.length ?? 0;
        totalStudents += totalInOffering;
      }
    }

    return totalStudents;
  } catch (error) {
    console.error("Failed to calculate program student count:", error);
    return 0;
  }
};

// React Query Hook for your Program Details page
export const useProgramStudentCount = (programId: number) => {
  return useQuery({
    queryKey: ["programs", programId, "calculated-student-count"],
    queryFn: () => fetchProgramStudentCount(programId),
    enabled: !!programId && !isNaN(programId),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes to avoid excessive queries
  });
};
