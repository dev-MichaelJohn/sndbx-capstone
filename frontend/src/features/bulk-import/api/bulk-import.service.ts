import { apiClient, getErrorMessage } from "@/lib/api.lib";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { APIResponse } from "backend/utils/response.util";
import type { BulkEntity, BulkImportResult } from "backend/types/bulk-import.type";

/**
 * Sends parsed CSV rows to the backend bulk import execution endpoint.
 *
 * @param entity - The target entity ("colleges" | "programs" | "classes" | "courses" | "users")
 * @param rows - Array of parsed CSV row objects
 * @returns Summary of imported rows and any validation error details
 */
export const executeBulkImportApi = async (
  entity: BulkEntity,
  rows: unknown[],
): Promise<BulkImportResult> => {
  try {
    const response = await apiClient.post<APIResponse<BulkImportResult>>(
      `/protected/bulk-import/${entity}`,
      { rows },
    );
    if (!response.data.data) throw new Error("Bulk import response payload is empty.");
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to execute bulk import."));
  }
};

/**
 * Mutation hook for executing CSV bulk imports.
 * Automatically invalidates relevant data tables upon successful imports.
 */
export const useExecuteBulkImport = (entity: BulkEntity) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rows: unknown[]) => executeBulkImportApi(entity, rows),
    onSuccess: () => {
      // Invalidate relevant query caches depending on the imported entity
      queryClient.invalidateQueries({ queryKey: ["getColleges"] });
      queryClient.invalidateQueries({ queryKey: ["getPrograms"] });
      queryClient.invalidateQueries({ queryKey: ["getProgramsViaCollegeID"] });
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["getCourses"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
