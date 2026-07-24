import type { AccountSelect, UserLoginType } from "backend/types/user.type";
import { type APIResponse } from "backend/utils/response.util";
import { apiClient, getErrorMessage } from "@/features/api.config";
import { useMutation } from "@tanstack/react-query";

const validateLogin = async (credentials: UserLoginType) => {
  try {
    const response = await apiClient.post<
      APIResponse<Pick<AccountSelect, "email"> & { resendAt: number }>
    >(`/auth/login`, credentials);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Login failed."));
  }
};

export const useValidateLogin = () => {
  return useMutation({
    mutationFn: validateLogin,
  });
};
