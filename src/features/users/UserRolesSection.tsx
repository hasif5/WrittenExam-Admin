// Staff role management section (used inside the user drawer). Assigns/revokes
// only staff roles + custom staff templates (never student/examiner/pool, which
// are a web-frontend concern).
// Author: Hasif Ahmed (www.hasif.info)

import { useMemo, useState } from "react";
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Loader,
  Select,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAssignRole, useRevokeRole } from "@/api/queries/users";
import { rbacKeys, useRbacRoles, useUserRoles } from "@/api/queries/rbac";
import { notifyError, notifySuccess } from "@/lib/notify";

export function UserRolesSection({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const rolesQuery = useRbacRoles();
  const userRolesQuery = useUserRoles(userId);
  const assign = useAssignRole();
  const revoke = useRevokeRole();
  const [role, setRole] = useState<string | null>(null);

  const assignable = useMemo(
    () => (rolesQuery.data ?? []).filter((r) => r.is_full_access || r.is_staff_template),
    [rolesQuery.data],
  );

  const currentRoles = userRolesQuery.data ?? [];
  const currentCodes = new Set(currentRoles.map((r) => r.code));
  const options = assignable
    .filter((r) => r.is_active && !currentCodes.has(r.code))
    .map((r) => ({ value: r.code, label: r.name }));

  const refresh = () => qc.invalidateQueries({ queryKey: rbacKeys.userRoles(userId) });

  const doAssign = async () => {
    if (!role) return;
    try {
      await assign.mutateAsync({ userId, roleCode: role });
      notifySuccess("Role assigned.");
      setRole(null);
      refresh();
    } catch (err) {
      notifyError(err, "Role update failed");
    }
  };

  const doRevoke = async (code: string) => {
    try {
      await revoke.mutateAsync({ userId, roleCode: code });
      notifySuccess("Role revoked.");
      refresh();
    } catch (err) {
      notifyError(err, "Role update failed");
    }
  };

  return (
    <Stack gap="sm">
      <div>
        <Text size="xs" fw={600} c="dimmed" tt="uppercase" mb={6}>
          Current roles
        </Text>
        {userRolesQuery.isLoading ? (
          <Loader size="sm" />
        ) : currentRoles.length === 0 ? (
          <Text size="sm" c="dimmed">
            No roles assigned.
          </Text>
        ) : (
          <Group gap="xs">
            {currentRoles.map((r) => (
              <Badge
                key={r.code}
                variant="light"
                color={r.is_full_access ? "red" : "brand"}
                rightSection={
                  <Tooltip label={`Revoke ${r.name}`}>
                    <ActionIcon
                      size="xs"
                      variant="transparent"
                      color="gray"
                      onClick={() => doRevoke(r.code)}
                      aria-label={`Revoke ${r.name}`}
                    >
                      <IconTrash size={12} />
                    </ActionIcon>
                  </Tooltip>
                }
              >
                {r.name}
              </Badge>
            ))}
          </Group>
        )}
      </div>

      <Group align="flex-end" gap="sm">
        <Select
          label="Assign a staff role"
          placeholder={options.length ? "Select a role" : "No more roles to assign"}
          data={options}
          value={role}
          onChange={setRole}
          disabled={options.length === 0}
          searchable
          style={{ flex: 1 }}
        />
        <Button onClick={doAssign} loading={assign.isPending} disabled={!role}>
          Assign
        </Button>
      </Group>
    </Stack>
  );
}
