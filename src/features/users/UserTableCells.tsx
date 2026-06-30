// Users table cell components: identity, role badges, and account status.
// File: src/features/users/UserTableCells.tsx
// Author: Hasif Ahmed <xmart@live.com> (www.hasif.info)
// Created: 2026-06-30

import { Avatar, Badge, Group, Stack, Text, Tooltip } from "@mantine/core";
import { IconCircleCheckFilled } from "@tabler/icons-react";
import type { RoleOut, UserDetailOut } from "@/api/types";

function initials(name: string | null | undefined, fallback: string): string {
  const source = (name ?? "").trim();
  if (!source) return fallback.slice(0, 2).toUpperCase();
  const parts = source.split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : "";
  return (first + last).toUpperCase() || fallback.slice(0, 2).toUpperCase();
}

export function IdentityCell({
  user,
  secondary,
  verified,
}: {
  user: UserDetailOut;
  secondary: string | null | undefined;
  verified: boolean;
}) {
  const name = user.full_name?.trim() || "Unnamed";
  return (
    <Group gap="sm" wrap="nowrap" align="center">
      <Avatar radius="xl" size={36} color="violet">
        {initials(user.full_name, secondary ?? "U")}
      </Avatar>
      <Stack gap={0}>
        <Group gap={4} wrap="nowrap" align="center">
          <Text fw={600} size="sm" lineClamp={1}>
            {name}
          </Text>
          {verified ? (
            <Tooltip label="Verified">
              <IconCircleCheckFilled size={15} color="var(--mantine-color-teal-6)" />
            </Tooltip>
          ) : null}
        </Group>
        <Text size="xs" c="dimmed" lineClamp={1}>
          {secondary || "-"}
        </Text>
      </Stack>
    </Group>
  );
}

export function StatusCell({ user }: { user: UserDetailOut }) {
  if (user.deletion_status) {
    return (
      <Badge color="orange" variant="light">
        Pending deletion
      </Badge>
    );
  }
  return (
    <Badge color={user.is_active ? "green" : "gray"} variant="light">
      {user.is_active ? "Active" : "Inactive"}
    </Badge>
  );
}

const ROLE_COLORS: Record<string, string> = {
  student: "blue",
  examiner: "grape",
  pool: "teal",
  admin: "red",
  finance: "orange",
};

export function RoleCell({ user }: { user: UserDetailOut }) {
  const badges: { key: string; label: string; color: string }[] = [];
  if (user.staff_type === "super_admin") {
    badges.push({ key: "super", label: "Super Admin", color: "violet" });
  }
  for (const role of (user.roles ?? []) as RoleOut[]) {
    if (user.staff_type === "super_admin" && role.is_full_access) continue;
    badges.push({
      key: role.code,
      label: role.name,
      color: ROLE_COLORS[role.code] ?? "gray",
    });
  }
  if (!badges.length) {
    return (
      <Text size="sm" c="dimmed">
        -
      </Text>
    );
  }
  return (
    <Group gap={4} wrap="wrap">
      {badges.map((b) => (
        <Badge key={b.key} color={b.color} variant="light" size="sm">
          {b.label}
        </Badge>
      ))}
    </Group>
  );
}
