// Question Bank hooks.
// Author: Hasif Ahmed (www.hasif.info)

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type Schemas } from "@/api/client";
import type {
  Page,
  QuestionAssetOut,
  QuestionOut,
  QuestionUsageOut,
} from "@/api/types";
import type { QuestionType } from "@/lib/constants";

export interface QuestionFilters {
  section_id?: string;
  subject_id?: string;
  chapter_id?: string;
  type?: QuestionType;
  q?: string;
  limit: number;
  offset: number;
}

export const questionKeys = {
  all: ["questions"] as const,
  list: (f: QuestionFilters) => ["questions", "list", f] as const,
  detail: (id: string) => ["questions", "detail", id] as const,
  usage: (id: string) => ["questions", "usage", id] as const,
};

export function useQuestions(filters: QuestionFilters) {
  return useQuery({
    queryKey: questionKeys.list(filters),
    queryFn: () =>
      api.get<Page<QuestionOut>>("/admin/questions", {
        query: {
          section_id: filters.section_id,
          subject_id: filters.subject_id,
          chapter_id: filters.chapter_id,
          type: filters.type,
          q: filters.q,
          limit: filters.limit,
          offset: filters.offset,
        },
      }),
  });
}

export function useQuestion(id: string | null) {
  return useQuery({
    queryKey: questionKeys.detail(id ?? ""),
    queryFn: () => api.get<QuestionOut>(`/admin/questions/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Schemas["QuestionCreate"]) =>
      api.post<QuestionOut>("/admin/questions", { body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: questionKeys.all }),
  });
}

export function useUpdateQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Schemas["QuestionUpdate"] }) =>
      api.patch<QuestionOut>(`/admin/questions/${id}`, { body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: questionKeys.all }),
  });
}

export function useDeleteQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.del<Schemas["MessageResponse"]>(`/admin/questions/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: questionKeys.all }),
  });
}

export function useAttachQuestionAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      questionId,
      body,
    }: {
      questionId: string;
      body: Schemas["QuestionAssetIn"];
    }) =>
      api.post<QuestionAssetOut>(`/admin/questions/${questionId}/assets`, { body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: questionKeys.all }),
  });
}

export function useQuestionUsage(id: string | null) {
  return useQuery({
    queryKey: questionKeys.usage(id ?? ""),
    queryFn: () => api.get<QuestionUsageOut>(`/admin/questions/${id}/usage`),
    enabled: Boolean(id),
  });
}
