// Examiner applications + roster hooks.
// Author: Hasif Ahmed (www.hasif.info)

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type Schemas } from "@/api/client";
import type {
  ApplicationStatus,
  ExaminerApplicationOut,
  ExaminerRosterOut,
  Page,
  PoolType,
  RosterStatus,
} from "@/api/types";

interface AppsParams {
  status?: ApplicationStatus;
  limit: number;
  offset: number;
}

interface RosterParams {
  status?: RosterStatus;
  limit: number;
  offset: number;
}

export const examinerKeys = {
  apps: ["examiner-apps"] as const,
  appsList: (p: AppsParams) => ["examiner-apps", "list", p] as const,
  app: (id: string) => ["examiner-apps", "detail", id] as const,
  roster: ["examiner-roster"] as const,
  rosterList: (p: RosterParams) => ["examiner-roster", "list", p] as const,
};

export function useExaminerApps(params: AppsParams) {
  return useQuery({
    queryKey: examinerKeys.appsList(params),
    queryFn: () =>
      api.get<Page<ExaminerApplicationOut>>("/admin/examiner-applications", {
        query: { status: params.status, limit: params.limit, offset: params.offset },
      }),
  });
}

export function useExaminerApp(id: string | null) {
  return useQuery({
    queryKey: examinerKeys.app(id ?? ""),
    queryFn: () =>
      api.get<ExaminerApplicationOut>(`/admin/examiner-applications/${id}`),
    enabled: Boolean(id),
  });
}

type Decision = "approve" | "reject" | "request-changes";

export function useApplicationDecision() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      decision,
      remarks,
    }: {
      id: string;
      decision: Decision;
      remarks: string;
    }) =>
      api.post<ExaminerApplicationOut>(
        `/admin/examiner-applications/${id}/${decision}`,
        { body: { remarks } },
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: examinerKeys.apps });
      qc.invalidateQueries({ queryKey: examinerKeys.roster });
    },
  });
}

export function useExaminerRoster(params: RosterParams) {
  return useQuery({
    queryKey: examinerKeys.rosterList(params),
    queryFn: () =>
      api.get<Page<ExaminerRosterOut>>("/admin/examiners", {
        query: { status: params.status, limit: params.limit, offset: params.offset },
      }),
  });
}

export function useEditDisplayFields() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      body,
    }: {
      userId: string;
      body: Schemas["ExaminerDisplayFieldsUpdate"];
    }) =>
      api.patch<Schemas["MessageResponse"]>(
        `/admin/examiners/${userId}/display-fields`,
        { body },
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: examinerKeys.roster }),
  });
}

export function useFeeOverride() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, adminOverride }: { userId: string; adminOverride: object }) =>
      api.put<Schemas["MessageResponse"]>(`/admin/examiners/${userId}/fee-override`, {
        body: { admin_override: adminOverride },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: examinerKeys.roster }),
  });
}

export function usePoolTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      poolType,
      active,
    }: {
      userId: string;
      poolType: PoolType;
      active: boolean;
    }) =>
      api.post<Schemas["MessageResponse"]>(
        `/admin/examiners/${userId}/pool-membership`,
        { body: { pool_type: poolType, active } },
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: examinerKeys.roster }),
  });
}

export function useSetAccountStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, action }: { userId: string; action: "suspend" | "reactivate" }) =>
      api.post<Schemas["MessageResponse"]>(`/admin/examiners/${userId}/${action}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: examinerKeys.roster }),
  });
}
