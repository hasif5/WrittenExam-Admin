// Assign/revoke a role for a user. The Phase 1 list endpoint does not return a
// user's current roles, so this offers explicit assign and revoke actions by role
// code rather than a (misleading) toggle of unknown state.
// Author: Hasif Ahmed (www.hasif.info)

import { useState } from "react";
import { Button, Group, Modal, Select, Stack, Text } from "@mantine/core";
import { useAssignRole, useRevokeRole } from "@/api/queries/users";
import { ALL_ROLES, ROLE_LABELS, type RoleCode } from "@/lib/constants";
import { notifyError, notifySuccess } from "@/lib/notify";
import type { UserOut } from "@/api/types";

const roleOptions = ALL_ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] }));

export function ManageRolesModal({
  user,
  onClose,
}: {
  user: UserOut | null;
  onClose: () => void;
}) {
  const [role, setRole] = useState<RoleCode>("examiner");
  const assign = useAssignRole();
  const revoke = useRevokeRole();

  if (!user) return null;

  const run = async (mode: "assign" | "revoke") => {
    try {
      if (mode === "assign") {
        await assign.mutateAsync({ userId: user.id, roleCode: role });
        notifySuccess(`Assigned ${ROLE_LABELS[role]}.`);
      } else {
        await revoke.mutateAsync({ userId: user.id, roleCode: role });
        notifySuccess(`Revoked ${ROLE_LABELS[role]}.`);
      }
    } catch (err) {
      notifyError(err, "Role update failed");
    }
  };

  return (
    <Modal opened={Boolean(user)} onClose={onClose} title="Manage roles" centered>
      <Stack>
        <Text size="sm" c="dimmed">
          {user.email ?? user.phone ?? user.id}
        </Text>
        <Select
          label="Role"
          data={roleOptions}
          value={role}
          onChange={(v) => setRole((v as RoleCode) ?? "examiner")}
          allowDeselect={false}
        />
        <Group justify="flex-end" mt="sm">
          <Button
            variant="light"
            color="red"
            loading={revoke.isPending}
            onClick={() => run("revoke")}
          >
            Revoke
          </Button>
          <Button loading={assign.isPending} onClick={() => run("assign")}>
            Assign
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
