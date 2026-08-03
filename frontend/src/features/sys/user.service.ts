import type { APIResponse, PaginatedData } from "backend/utils/response.util";
import { apiClient, getErrorMessage } from "../api.config";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateUserReqType, UserSearchType, UserWithDetails } from "backend/types/user.type";

// ── API Functions ──────────────────────────────────────────────────────────

/**
 * Fetches a paginated, searchable list of users with role filtering[cite: 6].
 * Endpoint: GET /protected/users[cite: 4]
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
 * Creates a new user account, personal details, and role mapping[cite: 5, 6].
 * Endpoint: POST /protected/users[cite: 3, 4]
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
 * Mutation hook for creating a new user account.
 * Automatically invalidates active user queries on success.
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUserRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
