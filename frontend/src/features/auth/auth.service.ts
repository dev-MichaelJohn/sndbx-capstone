import type { AccountSelect, UserLoginType, UserType } from "backend/types/user.type";
import { type APIResponse } from "backend/utils/response.util";
import { apiClient, getErrorMessage } from "@/features/api.config";
import { useMutation } from "@tanstack/react-query";
import type { VerifyOTPType } from "backend/types/otp.type";

const validateLogin = async (credentials: UserLoginType) => {
  try {
    const response = await apiClient.post<
      APIResponse<Pick<AccountSelect, "email"> & { resendAt: number }>
    >("/auth/login", credentials);
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

const validateOTP = async (credentials: VerifyOTPType) => {
  try {
    const response = await apiClient.post<
      APIResponse<{
        token: string;
        info: UserType;
      }>
    >("/auth/verify-otp", credentials);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Verifying OTP failed."));
  }
};

export const useValidateOTP = () => {
  return useMutation({
    mutationFn: validateOTP,
  });
};

export const setBearerToken = (token: string) => {
  localStorage.setItem("access_token", token);
};

export const fetchCurrentUser = async () => {
  try {
    const response = await apiClient.get<APIResponse<UserType>>("/auth/me");
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch current user."));
  }
};
