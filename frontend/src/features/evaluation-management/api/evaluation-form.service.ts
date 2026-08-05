import { apiClient, getErrorMessage } from "@/lib/api.lib";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { APIResponse } from "backend/utils/response.util";
import type {
  CategorySelect,
  CreateFormReq,
  EvaluationFormTree,
  EvaluationType,
  FormSelect,
  MeanSelect,
  QuestionSelect,
  UpsertCategoryReq,
  UpsertMeanReq,
  UpsertQuestionReq,
} from "backend/types/evaluation-form.type";

const BASE = "protected/evaluation-forms";

// ── Forms ────────────────────────────────────────────────────────────

export const getEvaluationForms = async (type: EvaluationType) => {
  try {
    const res = await apiClient<APIResponse<FormSelect[]>>(`${BASE}/${type}/forms`);
    if (!res.data.data) throw new Error("Evaluation forms payload is empty.");
    return res.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to load evaluation forms."), {
      cause: error,
    });
  }
};

export const useEvaluationForms = (type: EvaluationType) => {
  return useQuery({
    queryKey: ["getEvaluationForms", type],
    queryFn: () => getEvaluationForms(type),
  });
};

export const getFormTree = async (type: EvaluationType, formId: number) => {
  try {
    const res = await apiClient<APIResponse<EvaluationFormTree>>(`${BASE}/${type}/forms/${formId}`);
    if (!res.data.data) throw new Error("Form payload is empty.");
    return res.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to load evaluation form tree."), {
      cause: error,
    });
  }
};

export const useEvaluationFormTree = (type: EvaluationType, formId: number) => {
  return useQuery({
    queryKey: ["getFormTree", type, formId],
    queryFn: () => getFormTree(type, formId),
    enabled: Boolean(formId) && !isNaN(formId),
  });
};

const createFormRecord = async ({
  type,
  payload,
}: {
  type: EvaluationType;
  payload: CreateFormReq;
}) => {
  try {
    const res = await apiClient.post<APIResponse<{ form: FormSelect }>>(
      `${BASE}/${type}/forms`,
      payload,
    );
    if (!res.data.data) throw new Error("Failed to receive created form record.");
    return res.data.data.form;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to create evaluation form."), {
      cause: error,
    });
  }
};

export const useCreateEvaluationForm = (type: EvaluationType) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFormRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getEvaluationForms", type] });
    },
  });
};

const deleteFormRecord = async ({ type, formId }: { type: EvaluationType; formId: number }) => {
  try {
    const res = await apiClient.delete<APIResponse<null>>(`${BASE}/${type}/forms/${formId}`);
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to delete evaluation form."), {
      cause: error,
    });
  }
};

export const useDeleteEvaluationForm = (type: EvaluationType) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFormRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getEvaluationForms", type] });
    },
  });
};

// ── Categories ───────────────────────────────────────────────────────

const addCategoryRecord = async ({
  type,
  formId,
  payload,
}: {
  type: EvaluationType;
  formId: number;
  payload: UpsertCategoryReq;
}) => {
  try {
    const res = await apiClient.post<APIResponse<{ category: CategorySelect }>>(
      `${BASE}/${type}/forms/${formId}/categories`,
      payload,
    );
    if (!res.data.data) throw new Error("Failed to receive category payload.");
    return res.data.data.category;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to add category."), { cause: error });
  }
};

export const useAddCategory = (type: EvaluationType, formId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addCategoryRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getFormTree", type, formId] });
    },
  });
};

const updateCategoryRecord = async ({
  type,
  categoryId,
  payload,
}: {
  type: EvaluationType;
  categoryId: number;
  payload: Partial<UpsertCategoryReq>;
}) => {
  try {
    const res = await apiClient.patch<APIResponse<{ category: CategorySelect }>>(
      `${BASE}/${type}/categories/${categoryId}`,
      payload,
    );
    if (!res.data.data) throw new Error("Failed to receive updated category payload.");
    return res.data.data.category;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to update category."), { cause: error });
  }
};

export const useUpdateCategory = (type: EvaluationType, formId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCategoryRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getFormTree", type, formId] });
    },
  });
};

const deleteCategoryRecord = async ({
  type,
  categoryId,
}: {
  type: EvaluationType;
  categoryId: number;
}) => {
  try {
    const res = await apiClient.delete<APIResponse<null>>(
      `${BASE}/${type}/categories/${categoryId}`,
    );
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to delete category."), { cause: error });
  }
};

export const useDeleteCategory = (type: EvaluationType, formId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategoryRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getFormTree", type, formId] });
    },
  });
};

// ── Questions ────────────────────────────────────────────────────────

const addQuestionRecord = async ({
  type,
  categoryId,
  payload,
}: {
  type: EvaluationType;
  categoryId: number;
  payload: UpsertQuestionReq;
}) => {
  try {
    const res = await apiClient.post<APIResponse<{ question: QuestionSelect }>>(
      `${BASE}/${type}/categories/${categoryId}/questions`,
      payload,
    );
    if (!res.data.data) throw new Error("Failed to receive question payload.");
    return res.data.data.question;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to add question."), { cause: error });
  }
};

export const useAddQuestion = (type: EvaluationType, formId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ categoryId, payload }: { categoryId: number; payload: UpsertQuestionReq }) =>
      addQuestionRecord({ type, categoryId, payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getFormTree", type, formId] });
    },
  });
};

const updateQuestionRecord = async ({
  type,
  questionId,
  payload,
}: {
  type: EvaluationType;
  questionId: number;
  payload: Partial<UpsertQuestionReq>;
}) => {
  try {
    const res = await apiClient.patch<APIResponse<{ question: QuestionSelect }>>(
      `${BASE}/${type}/questions/${questionId}`,
      payload,
    );
    if (!res.data.data) throw new Error("Failed to receive updated question payload.");
    return res.data.data.question;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to update question."), { cause: error });
  }
};

export const useUpdateQuestion = (type: EvaluationType, formId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateQuestionRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getFormTree", type, formId] });
    },
  });
};

const deleteQuestionRecord = async ({
  type,
  questionId,
}: {
  type: EvaluationType;
  questionId: number;
}) => {
  try {
    const res = await apiClient.delete<APIResponse<null>>(
      `${BASE}/${type}/questions/${questionId}`,
    );
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to delete question."), { cause: error });
  }
};

export const useDeleteQuestion = (type: EvaluationType, formId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteQuestionRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getFormTree", type, formId] });
    },
  });
};

// ── Supervisor Means ──────────────────────────────────────────────────

export const getSupervisorMeans = async (questionId: number) => {
  try {
    const res = await apiClient<APIResponse<MeanSelect[]>>(
      `${BASE}/supervisor/questions/${questionId}/means`,
    );
    if (!res.data.data) throw new Error("Means payload is empty.");
    return res.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to load supervisor means."), {
      cause: error,
    });
  }
};

export const useSupervisorMeans = (questionId: number) => {
  return useQuery({
    queryKey: ["getSupervisorMeans", questionId],
    queryFn: () => getSupervisorMeans(questionId),
    enabled: Boolean(questionId) && !isNaN(questionId),
  });
};

const addMeanRecord = async ({
  questionId,
  payload,
}: {
  questionId: number;
  payload: UpsertMeanReq;
}) => {
  try {
    const res = await apiClient.post<APIResponse<{ mean: MeanSelect }>>(
      `${BASE}/supervisor/questions/${questionId}/means`,
      payload,
    );
    if (!res.data.data) throw new Error("Failed to receive mean descriptor payload.");
    return res.data.data.mean;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to add mean descriptor."), { cause: error });
  }
};

export const useAddSupervisorMean = (questionId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addMeanRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getSupervisorMeans", questionId] });
    },
  });
};

const updateMeanRecord = async ({
  meanId,
  payload,
}: {
  meanId: number;
  payload: Partial<UpsertMeanReq>;
}) => {
  try {
    const res = await apiClient.patch<APIResponse<{ mean: MeanSelect }>>(
      `${BASE}/supervisor/means/${meanId}`,
      payload,
    );
    if (!res.data.data) throw new Error("Failed to receive updated mean descriptor payload.");
    return res.data.data.mean;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to update mean descriptor."), {
      cause: error,
    });
  }
};

export const useUpdateSupervisorMean = (questionId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMeanRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getSupervisorMeans", questionId] });
    },
  });
};

const deleteMeanRecord = async (meanId: number) => {
  try {
    const res = await apiClient.delete<APIResponse<null>>(`${BASE}/supervisor/means/${meanId}`);
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to delete mean descriptor."), {
      cause: error,
    });
  }
};

export const useDeleteSupervisorMean = (questionId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMeanRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getSupervisorMeans", questionId] });
    },
  });
};
