// Users & roles + account-deletion queue hooks.
// Author: Hasif Ahmed (www.hasif.info)

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type Schemas } from "@/api/client";
import type {
  AccountDeletionRequestOut,
  Page,
  UserDetailOut,
  UserOut,
} from "@/api/types";

interface UsersParams {
  search?: string;
  limit: number;
  offset: number;
  userType?: "frontend" | "staff";
}

export const userKeys = {
  all: ["users"] as const,
  list: (params: UsersParams) => ["users", "list", params] as const,
  detail: (id: string) => ["users", "detail", id] as const,
  deletionQueue: ["users", "deletion-queue"] as const,
};

export function useUsers(params: UsersParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () =>
      api.get<Page<UserOut>>("/admin/users", {
        query: {
          search: params.search,
          limit: params.limit,
          offset: params.offset,
          user_type: params.userType,
        },
      }),
  });
}

export function useUser(userId: string | null) {
  return useQuery({
    queryKey: userKeys.detail(userId ?? ""),
    queryFn: () => api.get<UserDetailOut>(`/admin/users/${userId}`),
    enabled: Boolean(userId),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, body }: { userId: string; body: Schemas["AdminUserUpdate"] }) =>
      api.patch<UserDetailOut>(`/admin/users/${userId}`, { body }),
    onSuccess: (_data, { userId }) => {
      qc.invalidateQueries({ queryKey: userKeys.detail(userId) });
      qc.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export function useSetUserActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, active }: { userId: string; active: boolean }) =>
      api.post<UserDetailOut>(
        `/admin/users/${userId}/${active ? "reactivate" : "suspend"}`,
      ),
    onSuccess: (_data, { userId }) => {
      qc.invalidateQueries({ queryKey: userKeys.detail(userId) });
      qc.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export function useResetUserPassword() {
  return useMutation({
    mutationFn: ({ userId, newPassword }: { userId: string; newPassword: string }) =>
      api.post<Schemas["MessageResponse"]>(`/admin/users/${userId}/reset-password`, {
        body: { new_password: newPassword },
      }),
  });
}

export function useCreateStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Schemas["StaffCreateRequest"]) =>
      api.post<UserOut>("/admin/users/staff", { body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.all }),
  });
}

export function useAssignRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleCode }: { userId: string; roleCode: string }) =>
      api.post<Schemas["MessageResponse"]>(`/admin/users/${userId}/roles`, {
        body: { role_code: roleCode },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.all }),
  });
}

export function useRevokeRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleCode }: { userId: string; roleCode: string }) =>
      api.del<Schemas["MessageResponse"]>(`/admin/users/${userId}/roles/${roleCode}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.all }),
  });
}

export function useDeletionQueue(enabled = true) {
  return useQuery({
    queryKey: userKeys.deletionQueue,
    queryFn: () => api.get<AccountDeletionRequestOut[]>("/admin/users/deletion-queue"),
    enabled,
  });
}

export function useRestoreAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) =>
      api.post<AccountDeletionRequestOut>(
        `/admin/users/deletion-queue/${requestId}/restore`,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.deletionQueue });
      qc.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export function useHardDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) =>
      api.post<AccountDeletionRequestOut>(
        `/admin/users/deletion-queue/${requestId}/hard-delete`,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.deletionQueue });
      qc.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}
