import type { APIResponse } from "backend/utils/response.util";
import type {
  ConfirmPasswordChangeType,
  RequestPasswordChangeType,
  VerifyEmailConfirmType,
} from "backend/types/auth.type";
import { apiClient, getErrorMessage } from "@/lib/api.lib";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type VerificationStatusResponse = {
  isVerified: boolean;
};

export type OTPRequestResponse = {
  email?: string;
  resendAt: number;
};

export const ACCOUNT_SETTINGS_KEYS = {
  verificationStatus: ["getVerificationStatus"] as const,
};

export const getVerificationStatus = async () => {
  try {
    const response = await apiClient<APIResponse<VerificationStatusResponse>>(
      "/auth/verification-status",
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch verification status."), {
      cause: error,
    });
  }
};

export const useVerificationStatus = (enabled = true) => {
  return useQuery({
    queryKey: ACCOUNT_SETTINGS_KEYS.verificationStatus,
    queryFn: getVerificationStatus,
    enabled,
    staleTime: 1000 * 60 * 5,
  });
};

const requestEmailVerification = async () => {
  try {
    const response = await apiClient.post<APIResponse<OTPRequestResponse>>(
      "/auth/verify-email/request",
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to request verification code."), {
      cause: error,
    });
  }
};

export const useRequestEmailVerification = () => {
  return useMutation({
    mutationFn: requestEmailVerification,
  });
};

const confirmEmailVerification = async (payload: VerifyEmailConfirmType) => {
  try {
    const response = await apiClient.post<APIResponse<null>>("/auth/verify-email/confirm", payload);
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to verify email address."), {
      cause: error,
    });
  }
};

export const useConfirmEmailVerification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: confirmEmailVerification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNT_SETTINGS_KEYS.verificationStatus });
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
};

const requestPasswordChange = async (payload: RequestPasswordChangeType) => {
  try {
    const response = await apiClient.post<APIResponse<OTPRequestResponse>>(
      "/auth/change-password/request",
      payload,
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to initiate password change."), {
      cause: error,
    });
  }
};

export const useRequestPasswordChange = () => {
  return useMutation({
    mutationFn: requestPasswordChange,
  });
};

const confirmPasswordChange = async (payload: ConfirmPasswordChangeType) => {
  try {
    const response = await apiClient.post<APIResponse<null>>(
      "/auth/change-password/confirm",
      payload,
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to update password."), {
      cause: error,
    });
  }
};

export const useConfirmPasswordChange = () => {
  return useMutation({
    mutationFn: confirmPasswordChange,
  });
};
