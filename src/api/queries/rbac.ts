// Staff RBAC hooks: role templates + permission catalog.
// Author: Hasif Ahmed (www.hasif.info)

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type Schemas } from "@/api/client";
import type { PermissionOut, RoleDetailOut, RoleOut } from "@/api/types";

export const rbacKeys = {
  all: ["rbac"] as const,
  roles: ["rbac", "roles"] as const,
  permissions: ["rbac", "permissions"] as const,
  userRoles: (userId: string) => ["rbac", "user-roles", userId] as const,
};

export function useRbacRoles() {
  return useQuery({
    queryKey: rbacKeys.roles,
    queryFn: () => api.get<RoleDetailOut[]>("/admin/rbac/roles"),
  });
}

export function usePermissions() {
  return useQuery({
    queryKey: rbacKeys.permissions,
    queryFn: () => api.get<PermissionOut[]>("/admin/rbac/permissions"),
  });
}

export function useUserRoles(userId: string | null) {
  return useQuery({
    queryKey: userId ? rbacKeys.userRoles(userId) : ["rbac", "user-roles", "none"],
    queryFn: () => api.get<RoleOut[]>(`/admin/users/${userId}/roles`),
    enabled: Boolean(userId),
  });
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Schemas["RoleCreateRequest"]) =>
      api.post<RoleDetailOut>("/admin/rbac/roles", { body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: rbacKeys.roles }),
  });
}

export function useUpdateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, body }: { roleId: string; body: Schemas["RoleUpdateRequest"] }) =>
      api.patch<RoleDetailOut>(`/admin/rbac/roles/${roleId}`, { body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: rbacKeys.roles }),
  });
}

export function useSetRolePermissions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      roleId,
      permission_codes,
    }: {
      roleId: string;
      permission_codes: string[];
    }) =>
      api.put<RoleDetailOut>(`/admin/rbac/roles/${roleId}/permissions`, {
        body: { permission_codes },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: rbacKeys.roles }),
  });
}
