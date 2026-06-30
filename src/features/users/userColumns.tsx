// Shared column definitions + cells for the admin Users tables (frontend + staff):
// an identity cell (avatar, name, contact, verified mark), role/type badges, a
// status cell that surfaces pending deletion, and the joined date.
// File: src/features/users/userColumns.tsx
// Author: Hasif Ahmed <xmart@live.com> (www.hasif.info)
// Created: 2026-06-29

import { Text } from "@mantine/core";
import type { MRT_ColumnDef } from "mantine-react-table";
import { formatDate } from "@/lib/format";
import type { UserDetailOut } from "@/api/types";
import { IdentityCell, RoleCell, StatusCell } from "./UserTableCells";

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
