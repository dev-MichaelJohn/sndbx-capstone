import type { APIResponse, PaginatedData } from "backend/utils/response.util";
import type {
  CourseOfferingSearch,
  CourseOfferingSelect,
  CourseOfferingWithDetails,
  CreateCourseOfferingParams,
  UpdateCourseOfferingParams,
} from "backend/types/offerings.type";
import { apiClient, getErrorMessage } from "@/srcx/lib/api.lib";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Fetch course offerings filtered by class_id, semester_id, or faculty_id
export const getCourseOfferings = async (params: CourseOfferingSearch) => {
  try {
    const response = await apiClient.get<APIResponse<PaginatedData<CourseOfferingWithDetails[]>>>(
      "/protected/course-offerings",
      { params },
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch course offerings."), { cause: error });
  }
};

export const useCourseOfferings = (params: Partial<CourseOfferingSearch>) => {
  const fullParams: CourseOfferingSearch = {
    search: undefined,
    page: 1,
    orderBy: "id",
    orderDir: "asc",
    ...params,
  };

  return useQuery({
    queryKey: ["getCourseOfferings", fullParams],
    queryFn: () => getCourseOfferings(fullParams),
  });
};

export const useClassOfferingCount = (classId: number) => {
  const { data, isLoading } = useCourseOfferings({
    class_id: classId,
    page: 1,
  });

  return {
    data: data?.pagination?.totalItems ?? 0,
    isLoading,
  };
};

// Create new course offering
const createCourseOffering = async (payload: CreateCourseOfferingParams) => {
  try {
    const response = await apiClient.post<APIResponse<{ courseOffering: CourseOfferingSelect }>>(
      "/protected/course-offerings",
      payload,
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to create course offering."), { cause: error });
  }
};

export const useCreateCourseOffering = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCourseOffering,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getCourseOfferings"] });
    },
  });
};

// Update course offering
const updateCourseOffering = async (payload: UpdateCourseOfferingParams) => {
  try {
    const response = await apiClient.put<APIResponse<{ courseOffering: CourseOfferingSelect }>>(
      `/protected/course-offerings/${payload.course_offering_id}`,
      payload,
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to update course offering."), { cause: error });
  }
};

export const useUpdateCourseOffering = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCourseOffering,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getCourseOfferings"] });
    },
  });
};

// Delete course offering
const deleteCourseOffering = async (id: number) => {
  try {
    const response = await apiClient.delete<APIResponse>(`/protected/course-offerings/${id}`);
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to delete course offering."), { cause: error });
  }
};

export const useDeleteCourseOffering = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCourseOffering,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getCourseOfferings"] });
    },
  });
};
