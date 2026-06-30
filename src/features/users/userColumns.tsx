// Shared column definitions + cells for the admin Users tables (frontend + staff):
// an identity cell (avatar, name, contact, verified mark), role/type badges, a
// status cell that surfaces pending deletion, and the joined date.
// File: src/features/users/userColumns.tsx
// Author: Hasif Ahmed <xmart@live.com> (www.hasif.info)
// Created: 2026-06-29

import { Avatar, Badge, Group, Stack, Text, Tooltip } from "@mantine/core";
import { IconCircleCheckFilled } from "@tabler/icons-react";
import type { MRT_ColumnDef } from "mantine-react-table";
import { formatDate } from "@/lib/format";
import type { RoleOut, UserDetailOut } from "@/api/types";

function initials(name: string | null | undefined, fallback: string): string {
  const source = (name ?? "").trim();
  if (!source) return fallback.slice(0, 2).toUpperCase();
  const parts = source.split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : "";
  return (first + last).toUpperCase() || fallback.slice(0, 2).toUpperCase();
}

function IdentityCell({
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

const ROLE_COLORS: Record<string, string> = {
  student: "blue",
  examiner: "grape",
  pool: "teal",
  admin: "red",
  finance: "orange",
};

function StatusCell({ user }: { user: UserDetailOut }) {
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

function RoleCell({ user }: { user: UserDetailOut }) {
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

const statusColumn: MRT_ColumnDef<UserDetailOut> = {
  accessorKey: "is_active",
  header: "Status",
  size: 150,
  Cell: ({ row }) => <StatusCell user={row.original} />,
};

const roleColumn: MRT_ColumnDef<UserDetailOut> = {
  id: "roles",
  header: "Role",
  size: 200,
  Cell: ({ row }) => <RoleCell user={row.original} />,
};

const joinedColumn: MRT_ColumnDef<UserDetailOut> = {
  accessorKey: "created_at",
  header: "Joined",
  size: 130,
  Cell: ({ row }) => (
    <Text size="sm" c="dimmed">
      {formatDate(row.original.created_at)}
    </Text>
  ),
};

export const frontendUserColumns: MRT_ColumnDef<UserDetailOut>[] = [
  {
    id: "identity",
    header: "User",
    size: 260,
    Cell: ({ row }) => (
      <IdentityCell
        user={row.original}
        secondary={row.original.phone}
        verified={row.original.phone_verified}
      />
    ),
  },
  roleColumn,
  statusColumn,
  joinedColumn,
];

export const staffUserColumns: MRT_ColumnDef<UserDetailOut>[] = [
  {
    id: "identity",
    header: "Staff",
    size: 260,
    Cell: ({ row }) => (
      <IdentityCell
        user={row.original}
        secondary={row.original.email}
        verified={row.original.email_verified}
      />
    ),
  },
  roleColumn,
  statusColumn,
  joinedColumn,
];
