import axios from "axios";
import type { APIResponse } from "backend/utils/response.util";

export const BACKEND_BASE_API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const apiClient = axios.create({
  baseURL: BACKEND_BASE_API,
  timeout: 30000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface BasicSearchProps {
  search?: string;
  page: number;
}

apiClient.interceptors.response.use(
  (response) => {
    const newToken = response.headers["x-access-token"];

    if (newToken) {
      const tokenValue = newToken.replace(/^bearer\s+/i, "");
      localStorage.setItem("access_token", tokenValue);
      apiClient.defaults.headers.common["Authorization"] = `bearer ${tokenValue}`;
    }

    return response;
  },
  (error) => {
    if (error.response?.status === 401) localStorage.removeItem("access_token");
    return Promise.reject(error);
  },
);

apiClient.interceptors.request.use((request) => {
  const token = localStorage.getItem("access_token");
  if (token) request.headers.Authorization = `bearer ${token}`;
  return request;
});

export const getErrorMessage = (error: unknown, fallback = "Something went wrong.") => {
  if (axios.isAxiosError(error)) {
    if (error.code === "ECONNABORTED") return "Request timed out. Please try again.";
    if (!error.response) return "Unable to reach the server. Check your connection.";

    const data = error.response.data as APIResponse<unknown> | undefined;
    if (data?.message) return data.message;
    return fallback;
  }

  if (error instanceof Error) return error.message;
  return fallback;
};
