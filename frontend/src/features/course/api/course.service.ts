import type { APIResponse, PaginatedData } from "backend/utils/response.util";
import type {
  CourseInsert,
  CourseSearch,
  CourseSelect,
  CourseUpdate,
} from "backend/types/course.type";
import { apiClient, getErrorMessage } from "@/lib/api.lib";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Fetch paginated courses for a specific program
export const getCourses = async (params: CourseSearch) => {
  try {
    const { program_id, ...queryParams } = params;

    const endpoint = program_id
      ? `/protected/programs/${program_id}/courses`
      : "/protected/courses";

    const response = await apiClient.get<APIResponse<PaginatedData<CourseSelect[]>>>(endpoint, {
      params: queryParams,
    });
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch courses."), { cause: error });
  }
};

export const useCourses = (
  params: Partial<CourseSearch> & { program_id?: number } = {},
  options?: { enabled?: boolean },
) => {
  const fullParams: CourseSearch = {
    search: undefined,
    page: 1,
    orderBy: "id",
    orderDir: "asc",
    ...params,
  };

  return useQuery({
    queryKey: ["getCourses", fullParams],
    queryFn: () => getCourses(fullParams),
    ...options,
  });
};

// Inspects query cache to read current program course count without triggering a re-fetch
export const useProgramCourseCount = (programId: number) => {
  const { data, isLoading } = useCourses(
    { program_id: programId, page: 1 },
    { enabled: !!programId },
  );

  return {
    data: data?.pagination?.totalItems ?? 0,
    isLoading,
  };
};

// Fetch single course by ID
export const getCourse = async (id: number) => {
  try {
    const response = await apiClient.get<APIResponse<CourseSelect>>(`/protected/courses/${id}`);
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch course details."), { cause: error });
  }
};

export const useCourse = (id: number) => {
  return useQuery({
    queryKey: ["getCourse", id],
    queryFn: () => getCourse(id),
    enabled: !!id,
  });
};

// Create course record
const createCourseRecord = async (payload: CourseInsert) => {
  try {
    const response = await apiClient.post<APIResponse<CourseSelect>>("/protected/courses", payload);
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to create course record."), { cause: error });
  }
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCourseRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getCourses"] });
    },
  });
};

// Update course record
const updateCourseRecord = async ({
  course_id,
  ...payload
}: CourseUpdate & { course_id: number }) => {
  try {
    const response = await apiClient.put<APIResponse<CourseSelect>>(
      `/protected/courses/${course_id}`,
      payload,
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to update course record."), { cause: error });
  }
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCourseRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getCourses"] });
    },
  });
};

// Delete course record
const deleteCourseRecord = async (courseId: number) => {
  try {
    const response = await apiClient.delete<APIResponse>(`/protected/courses/${courseId}`);
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to delete course record."), { cause: error });
  }
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCourseRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getCourses"] });
    },
  });
};
