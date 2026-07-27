import type { APIResponse, PaginatedData } from "backend/utils/response.util";
import type { ProgramWithChairType } from "backend/types/program.type";
import { apiClient, getErrorMessage } from "../api.config";

export const getPrograms = async (search?: string) => {
  try {
    const response = await apiClient<APIResponse<PaginatedData<ProgramWithChairType[]>>>(
      `/sys/programs?search=${search || ""}`,
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Something went wrong."), { cause: error });
  }
};

export const getProgramsViaCollegeID = async (collegeId: number, search?: string) => {
  try {
    const response = await apiClient<APIResponse<PaginatedData<ProgramWithChairType[]>>>(
      `/sys/colleges/${collegeId}/programs?search=${search || ""}`,
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Something went wrong."), { cause: error });
  }
};
