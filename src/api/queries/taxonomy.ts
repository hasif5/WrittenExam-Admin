// Taxonomy (sections / subjects / chapters) hooks.
// Author: Hasif Ahmed (www.hasif.info)

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type Schemas } from "@/api/client";
import type { ChapterOut, SectionOut, SubjectOut } from "@/api/types";

export interface SectionUsage {
  entity_type: string;
  entity_id: string;
  usage: Record<string, number>;
}

export const taxonomyKeys = {
  sections: ["sections"] as const,
  subjects: (sectionId?: string) => ["subjects", sectionId ?? "all"] as const,
  chapters: (subjectId?: string) => ["chapters", subjectId ?? "all"] as const,
  sectionUsage: (id: string) => ["section-usage", id] as const,
};

// --- Sections ---------------------------------------------------------------

export function useSections(includeInactive = true) {
  return useQuery({
    queryKey: [...taxonomyKeys.sections, includeInactive],
    queryFn: () =>
      api.get<SectionOut[]>("/admin/sections", {
        query: { include_inactive: includeInactive },
      }),
  });
}

export function useCreateSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Schemas["SectionCreate"]) =>
      api.post<SectionOut>("/admin/sections", { body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: taxonomyKeys.sections }),
  });
}

export function useUpdateSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Schemas["SectionUpdate"] }) =>
      api.patch<SectionOut>(`/admin/sections/${id}`, { body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: taxonomyKeys.sections }),
  });
}

export function useDeleteSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.del<Schemas["MessageResponse"]>(`/admin/sections/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: taxonomyKeys.sections }),
  });
}

export function useReorderSections() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderedIds: string[]) =>
      api.post<SectionOut[]>("/admin/sections/reorder", {
        body: { ordered_ids: orderedIds },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: taxonomyKeys.sections }),
  });
}

export function useSectionUsage(id: string | null) {
  return useQuery({
    queryKey: taxonomyKeys.sectionUsage(id ?? ""),
    queryFn: () => api.get<SectionUsage>(`/admin/sections/${id}/usage`),
    enabled: Boolean(id),
  });
}

// --- Subjects ---------------------------------------------------------------

export function useSubjects(sectionId?: string) {
  return useQuery({
    queryKey: taxonomyKeys.subjects(sectionId),
    queryFn: () =>
      api.get<SubjectOut[]>("/admin/subjects", {
        query: { section_id: sectionId },
      }),
    enabled: Boolean(sectionId),
  });
}

export function useCreateSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Schemas["SubjectCreate"]) =>
      api.post<SubjectOut>("/admin/subjects", { body }),
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: taxonomyKeys.subjects(vars.section_id) }),
  });
}

export function useUpdateSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Schemas["SubjectUpdate"] }) =>
      api.patch<SubjectOut>(`/admin/subjects/${id}`, { body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subjects"] }),
  });
}

export function useDeleteSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.del<Schemas["MessageResponse"]>(`/admin/subjects/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subjects"] }),
  });
}

export function useReorderSubjects() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sectionId, orderedIds }: { sectionId: string; orderedIds: string[] }) =>
      api.post<SubjectOut[]>("/admin/subjects/reorder", {
        body: { section_id: sectionId, ordered_ids: orderedIds },
      }),
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: taxonomyKeys.subjects(vars.sectionId) }),
  });
}

// --- Chapters ---------------------------------------------------------------

export function useChapters(subjectId?: string) {
  return useQuery({
    queryKey: taxonomyKeys.chapters(subjectId),
    queryFn: () =>
      api.get<ChapterOut[]>("/admin/chapters", {
        query: { subject_id: subjectId },
      }),
    enabled: Boolean(subjectId),
  });
}

export function useCreateChapter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Schemas["ChapterCreate"]) =>
      api.post<ChapterOut>("/admin/chapters", { body }),
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: taxonomyKeys.chapters(vars.subject_id) }),
  });
}

export function useUpdateChapter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Schemas["ChapterUpdate"] }) =>
      api.patch<ChapterOut>(`/admin/chapters/${id}`, { body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chapters"] }),
  });
}

export function useDeleteChapter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.del<Schemas["MessageResponse"]>(`/admin/chapters/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chapters"] }),
  });
}

export function useReorderChapters() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ subjectId, orderedIds }: { subjectId: string; orderedIds: string[] }) =>
      api.post<ChapterOut[]>("/admin/chapters/reorder", {
        body: { subject_id: subjectId, ordered_ids: orderedIds },
      }),
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: taxonomyKeys.chapters(vars.subjectId) }),
  });
}
