// Right-side drawer to create/edit a staff role + its permission bundle (grouped
// permission matrix). The super-admin role is locked (full access); system roles
// are not editable. Mirrors the User/Question editor drawers.
// File: src/features/roles/RoleEditorDrawer.tsx
// Author: Hasif Ahmed (www.hasif.info)

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Checkbox,
  Divider,
  Group,
  Stack,
  Switch,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import { IconLock } from "@tabler/icons-react";
import { EditorDrawer } from "@/components/EditorDrawer";
import { HEROES } from "@/assets/heroes";
import {
  useCreateRole,
  usePermissions,
  useSetRolePermissions,
  useUpdateRole,
} from "@/api/queries/rbac";
import { notifyError, notifySuccess } from "@/lib/notify";
import type { PermissionOut, RoleDetailOut } from "@/api/types";

const GROUP_LABELS: Record<string, string> = {
  users: "Users",
  examiners: "Examiners",
  taxonomy: "Taxonomy",
  question_bank: "Question Bank",
  rbac: "Roles & Permissions",
  finance: "Finance",
  reports: "Reports",
};

function groupPermissions(perms: PermissionOut[]): [string, PermissionOut[]][] {
  const map = new Map<string, PermissionOut[]>();
  for (const p of perms) {
    const list = map.get(p.group) ?? [];
    list.push(p);
    map.set(p.group, list);
  }
  return [...map.entries()];
}

export function RoleEditorDrawer({
  role,
  opened,
  onClose,
}: {
  // null = create mode; a role = edit mode.
  role: RoleDetailOut | null;
  opened: boolean;
  onClose: () => void;
}) {
  const permsQuery = usePermissions();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const setPermissions = useSetRolePermissions();

  const isEdit = Boolean(role);
  const locked = Boolean(role?.is_full_access || role?.is_system);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!opened) return;
    setName(role?.name ?? "");
    setDescription(role?.description ?? "");
    setIsActive(role?.is_active ?? true);
    setSelected(new Set(role?.permissions ?? []));
  }, [opened, role]);

  const grouped = useMemo(
    () => groupPermissions(permsQuery.data ?? []),
    [permsQuery.data],
  );

  const toggle = (code: string, on: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (on) next.add(code);
      else next.delete(code);
      return next;
    });
  };

  const save = async () => {
    try {
      if (!isEdit) {
        await createRole.mutateAsync({
          name,
          description: description || null,
          permission_codes: [...selected],
        });
        notifySuccess("Role created.");
      } else if (role) {
        await updateRole.mutateAsync({
          roleId: role.id,
          body: { name, description: description || null, is_active: isActive },
        });
        await setPermissions.mutateAsync({
          roleId: role.id,
          permission_codes: [...selected],
        });
        notifySuccess("Role updated.");
      }
      onClose();
    } catch (err) {
      notifyError(err, "Could not save role");
    }
  };

  const busy = createRole.isPending || updateRole.isPending || setPermissions.isPending;

  const caption = locked
    ? "This role is locked"
    : isEdit
      ? "Adjust this role's permissions"
      : "Bundle the permissions this role grants";

  const footer = (
    <Group justify="flex-end">
      <Button variant="default" onClick={onClose}>
        {locked ? "Close" : "Cancel"}
      </Button>
      {!locked && (
        <Button onClick={save} loading={busy} disabled={!name.trim()}>
          {isEdit ? "Save changes" : "Create role"}
        </Button>
      )}
    </Group>
  );

  return (
    <EditorDrawer
      opened={opened}
      onClose={onClose}
      title={isEdit ? `Edit role: ${role?.name}` : "Create staff role"}
      caption={caption}
      image={HEROES.roleEditor}
      footer={footer}
    >
      <Stack>
        {locked && (
          <Alert color="gray" variant="light" icon={<IconLock size={16} />}>
            {role?.is_full_access
              ? "The super-admin role always holds every permission and cannot be edited."
              : "This is a system role and cannot be edited here."}
          </Alert>
        )}

        <TextInput
          label="Role name"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          disabled={locked}
          required
        />
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          disabled={locked}
          autosize
          minRows={2}
        />
        {isEdit && !locked && (
          <Switch
            label="Active"
            checked={isActive}
            onChange={(e) => setIsActive(e.currentTarget.checked)}
          />
        )}

        <Divider label="Permissions" labelPosition="left" />
        <Stack gap="md">
          {grouped.map(([group, perms]) => (
            <div key={group}>
              <Text size="sm" fw={600} mb={6}>
                {GROUP_LABELS[group] ?? group}
              </Text>
              <Stack gap={6}>
                {perms.map((p) => (
                  <Checkbox
                    key={p.code}
                    label={p.name}
                    description={p.description ?? undefined}
                    checked={role?.is_full_access ? true : selected.has(p.code)}
                    disabled={locked}
                    onChange={(e) => toggle(p.code, e.currentTarget.checked)}
                  />
                ))}
              </Stack>
            </div>
          ))}
        </Stack>
      </Stack>
    </EditorDrawer>
  );
}
