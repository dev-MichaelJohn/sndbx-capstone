export interface APIResponse<T = unknown> {
  success: boolean,
  status: number,
  message: string,
  data?: T,
  errors?: unknown,
};

export const createAPIResponse = <T>(status: number, message: string, data: T | null = null, errors: unknown = null): APIResponse => {
  const response: APIResponse = {
    success: status >= 200 && status < 300,
    status, message,
    ...(data !== null && { data }),
  };

  if (errors !== null) response.errors = errors;

  return response;
};
