import type {
  AccountSelect,
  PersonalDetailsSelect,
  SystemRole,
  UserLoginType,
} from "backend/types/user.type";
import { type APIResponse } from "backend/utils/response.util";
import { apiClient, getErrorMessage } from "@/lib/api.lib";
import { useMutation } from "@tanstack/react-query";
import type { VerifyOTPType } from "backend/types/otp.type";

const validateLogin = async (credentials: UserLoginType) => {
  try {
    const response = await apiClient.post<
      APIResponse<Pick<AccountSelect, "email"> & { resendAt: number }>
    >("/auth/login", credentials);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Login failed."), { cause: error });
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
        user: Pick<AccountSelect, "id" | "email"> & {
          personalDetails: PersonalDetailsSelect;
          roles: SystemRole[];
        };
      }>
    >("/auth/verify-otp", credentials);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Verifying OTP failed."), { cause: error });
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
    const response = await apiClient.get<
      APIResponse<
        Pick<AccountSelect, "id" | "email"> & {
          personalDetails: PersonalDetailsSelect;
          roles: SystemRole[];
        }
      >
    >("/auth/me");
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch current user."), { cause: error });
  }
};
