import type { APIResponse, PaginatedData } from "backend/utils/response.util";
import { apiClient, getErrorMessage } from "@/lib/api.lib";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateUserReqType,
  UpdateUserReqType,
  UserSearchType,
  UserType,
  UserWithDetails,
} from "backend/types/user.type";

/**
 * Fetches a paginated, searchable list of user accounts with optional role filtering.
 */
export const getUsers = async (params: UserSearchType) => {
  try {
    const response = await apiClient.get<APIResponse<PaginatedData<UserWithDetails[]>>>(
      "/protected/users",
      { params },
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch users."), { cause: error });
  }
};

/**
 * Creates a new user account, personal details, and initial system role mapping.
 */
export const createUserRecord = async (payload: CreateUserReqType) => {
  try {
    const response = await apiClient.post<APIResponse<UserWithDetails>>(
      "/protected/users",
      payload,
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to create user account."), { cause: error });
  }
};

/**
 * Updates an existing user's email address and/or personal details.
 */
export const updateUserRecord = async ({
  id,
  payload,
}: {
  id: number;
  payload: UpdateUserReqType;
}) => {
  try {
    const response = await apiClient.put<APIResponse<UserType>>(`/protected/users/${id}`, payload);
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to update user account."), { cause: error });
  }
};

/**
 * Soft-deletes a user account and revokes associated system roles.
 */
export const deleteUserRecord = async (id: number) => {
  try {
    const response = await apiClient.delete<APIResponse<null>>(`/protected/users/${id}`);
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to delete user account."), { cause: error });
  }
};

// ── React Query Hooks ──────────────────────────────────────────────────────

/**
 * Hook to retrieve user accounts with optional filtering and pagination.
 */
export const useUsers = (params: Partial<UserSearchType> = {}) => {
  const fullParams: UserSearchType = {
    page: 1,
    orderBy: "id",
    orderDir: "asc",
    ...params,
  };

  return useQuery({
    queryKey: ["users", fullParams],
    queryFn: () => getUsers(fullParams),
  });
};

/**
 * Convenience hook for fetching faculty accounts specifically.
 */
export const useFacultyList = (params: Partial<Omit<UserSearchType, "role">> = {}) => {
  return useUsers({
    role: "FACULTY",
    ...params,
  });
};

/**
 * Convenience hook for fetching student accounts specifically.
 */
export const useStudentList = (params: Partial<Omit<UserSearchType, "role">> = {}) => {
  return useUsers({
    role: "STUDENT",
    ...params,
  });
};

/**
 * Mutation hook for creating a new user account.
 * Automatically invalidates user list and current user query cache.
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUserRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
};

/**
 * Mutation hook for updating an existing user account.
 * Automatically invalidates user list and current user query cache.
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
};

/**
 * Mutation hook for deleting a user account.
 * Automatically invalidates user list and current user query cache.
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUserRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
};
