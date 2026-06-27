// Roles & Permissions: staff role templates + permission matrix management.
// Shows the locked super-admin role, the starter Finance role, and any custom
// staff roles. Phone roles (student/examiner/pool) are web-side and not shown.
// Author: Hasif Ahmed (www.hasif.info)

import { useMemo, useState } from "react";
import {
  ActionIcon,
  Badge,
  Button,
  Center,
  Loader,
  Paper,
  Table,
  Text,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconLock, IconPencil, IconPlus } from "@tabler/icons-react";
import { PageHero } from "@/components/PageHero";
import { HEROES } from "@/assets/heroes";
import { ErrorState } from "@/components/ErrorState";
import { useRbacRoles } from "@/api/queries/rbac";
import type { RoleDetailOut } from "@/api/types";
import { RoleEditorModal } from "./RoleEditorModal";

function RoleTypeBadge({ role }: { role: RoleDetailOut }) {
  if (role.is_full_access) return <Badge color="red" variant="light">Super admin</Badge>;
  if (role.is_system) return <Badge color="gray" variant="light">System</Badge>;
  return <Badge color="brand" variant="light">Custom</Badge>;
}

export function RolesPage() {
  const rolesQuery = useRbacRoles();
  const [editorOpened, editorHandlers] = useDisclosure(false);
  const [editing, setEditing] = useState<RoleDetailOut | null>(null);

  // Staff-relevant roles only: super-admin + staff templates (custom + Finance).
  const roles = useMemo(
    () =>
      (rolesQuery.data ?? []).filter((r) => r.is_full_access || r.is_staff_template),
    [rolesQuery.data],
  );

  const openCreate = () => {
    setEditing(null);
    editorHandlers.open();
  };

  const openEdit = (role: RoleDetailOut) => {
    setEditing(role);
    editorHandlers.open();
  };

  return (
    <>
      <PageHero
        image={HEROES.roles}
        title="Roles & Permissions"
        description="Create staff roles and assign permission bundles. The super-admin role is locked to full access."
        actions={
          <Button leftSection={<IconPlus size={16} />} onClick={openCreate}>
            Create role
          </Button>
        }
      />

      {rolesQuery.isError ? (
        <ErrorState error={rolesQuery.error} onRetry={() => rolesQuery.refetch()} />
      ) : rolesQuery.isLoading ? (
        <Center h={200}>
          <Loader />
        </Center>
      ) : (
        <Paper withBorder shadow="xs">
          <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Role</Table.Th>
                <Table.Th w={140}>Type</Table.Th>
                <Table.Th w={110}>Status</Table.Th>
                <Table.Th w={130}>Permissions</Table.Th>
                <Table.Th w={80} ta="right">
                  Actions
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {roles.map((role) => {
                const locked = role.is_full_access || role.is_system;
                return (
                  <Table.Tr key={role.id}>
                    <Table.Td>
                      <Text fw={500}>{role.name}</Text>
                      <Text size="xs" c="dimmed">
                        {role.code}
                        {role.description ? ` - ${role.description}` : ""}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <RoleTypeBadge role={role} />
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        color={role.is_active ? "green" : "gray"}
                        variant="light"
                      >
                        {role.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      {role.is_full_access ? (
                        <Text size="sm" c="dimmed">
                          All
                        </Text>
                      ) : (
                        <Text size="sm">{role.permissions?.length ?? 0}</Text>
                      )}
                    </Table.Td>
                    <Table.Td ta="right">
                      <Tooltip label={locked ? "View (locked)" : "Edit role"}>
                        <ActionIcon variant="subtle" onClick={() => openEdit(role)}>
                          {locked ? <IconLock size={16} /> : <IconPencil size={16} />}
                        </ActionIcon>
                      </Tooltip>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </Paper>
      )}

      <RoleEditorModal role={editing} opened={editorOpened} onClose={editorHandlers.close} />
    </>
  );
}
