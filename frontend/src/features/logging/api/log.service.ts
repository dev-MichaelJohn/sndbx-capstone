import type { APIResponse, PaginatedData } from "backend/utils/response.util";
import type { LogEntry, SystemLogQuery } from "backend/types/system-log.type";
import { apiClient, getErrorMessage } from "@/lib/api.lib";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export type LogFile = "combined" | "error";

export const getSystemLogs = async ({ file, page, limit, search }: SystemLogQuery) => {
  try {
    const response = await apiClient<APIResponse<PaginatedData<LogEntry[]>>>(
      `/protected/logs?file=${file || "combined"}&page=${page || 1}&limit=${limit || 20}&search=${search || ""}`,
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to retrieve system logs."), { cause: error });
  }
};

export const useSystemLogs = (query: SystemLogQuery) => {
  return useQuery({
    queryKey: ["getSystemLogs", query.file, query.page, query.limit, query.search],
    queryFn: () => getSystemLogs(query),
    placeholderData: (previousData) => previousData,
  });
};

export function useSystemLogFilters(initialFile: LogFile = "combined") {
  const [file, setFile] = useState<LogFile>(initialFile);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to first page on new search
    }, 300);
    return () => clearTimeout(handle);
  }, [search]);

  const handleFileChange = (nextFile: LogFile) => {
    setFile(nextFile);
    setPage(1);
  };

  const queryParams: SystemLogQuery = {
    file,
    page,
    limit,
    search: debouncedSearch,
  };

  const { data, isLoading, isFetching, error } = useSystemLogs(queryParams);

  return {
    file,
    setFile: handleFileChange,
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
    data,
    isLoading,
    isFetching,
    error,
  };
}
