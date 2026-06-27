// Users & roles: two tabs to keep the list scannable - phone-based frontend
// users (students/examiners/pool, default) and email-based staff/admin accounts.
// Author: Hasif Ahmed (www.hasif.info)

import { useMemo, useState } from "react";
import { ActionIcon, Badge, Button, Code, Tabs, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconDeviceMobile,
  IconPencil,
  IconPlus,
  IconShieldCog,
} from "@tabler/icons-react";
import type { MRT_ColumnDef } from "mantine-react-table";
import { PageHero } from "@/components/PageHero";
import { HEROES } from "@/assets/heroes";
import { DataTable } from "@/components/DataTable";
import { usePagination } from "@/lib/usePagination";
import { useUsers } from "@/api/queries/users";
import { useAuth } from "@/auth/useAuth";
import type { UserOut } from "@/api/types";
import { CreateStaffModal } from "./CreateStaffModal";
import { UserEditorDrawer } from "./UserEditorDrawer";

function StatusBadge({ active }: { active: boolean }) {
  return (
    <Badge color={active ? "green" : "gray"} variant="light">
      {active ? "Active" : "Inactive"}
    </Badge>
  );
}

function verifiedText(user: UserOut): string {
  const flags: string[] = [];
  if (user.phone_verified) flags.push("phone");
  if (user.email_verified) flags.push("email");
  return flags.length ? flags.join(", ") : "-";
}

function FrontendUsersTab() {
  const { pagination, setPagination, limit, offset } = usePagination();
  const [search, setSearch] = useState("");
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [drawerOpened, drawerHandlers] = useDisclosure(false);
  const query = useUsers({ search: search || undefined, limit, offset, userType: "frontend" });

  const openUser = (id: string) => {
    setEditUserId(id);
    drawerHandlers.open();
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const columns = useMemo<MRT_ColumnDef<UserOut>[]>(
    () => [
      { accessorKey: "phone", header: "Phone", Cell: ({ row }) => row.original.phone ?? "-" },
      {
        accessorKey: "is_active",
        header: "Status",
        size: 110,
        Cell: ({ row }) => <StatusBadge active={row.original.is_active} />,
      },
      {
        id: "verified",
        header: "Verified",
        size: 140,
        Cell: ({ row }) => verifiedText(row.original),
      },
      {
        accessorKey: "id",
        header: "ID",
        size: 120,
        Cell: ({ row }) => <Code>{row.original.id.slice(0, 8)}</Code>,
      },
    ],
    [],
  );

  return (
    <>
      <DataTable<UserOut>
        columns={columns}
        data={query.data?.items ?? []}
        rowCount={query.data?.total ?? 0}
        pagination={pagination}
        onPaginationChange={setPagination}
        isLoading={query.isLoading}
        isFetching={query.isFetching}
        isError={query.isError}
        error={query.error}
        enableGlobalFilter
        globalFilter={search}
        onGlobalFilterChange={handleSearch}
        searchPlaceholder="Search by phone or email"
        emptyText="No frontend users found."
        enableRowActions
        renderRowActions={({ row }) => (
          <Tooltip label="Manage user">
            <ActionIcon variant="subtle" onClick={() => openUser(row.original.id)}>
              <IconPencil size={18} />
            </ActionIcon>
          </Tooltip>
        )}
      />

      <UserEditorDrawer
        opened={drawerOpened}
        userId={editUserId}
        onClose={drawerHandlers.close}
      />
    </>
  );
}

function StaffUsersTab() {
  const { can } = useAuth();
  const canCreateStaff = can("users.create_staff");
  const { pagination, setPagination, limit, offset } = usePagination();
  const [search, setSearch] = useState("");
  const [createOpened, createHandlers] = useDisclosure(false);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [drawerOpened, drawerHandlers] = useDisclosure(false);
  const query = useUsers({ search: search || undefined, limit, offset, userType: "staff" });

  const openUser = (id: string) => {
    setEditUserId(id);
    drawerHandlers.open();
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const columns = useMemo<MRT_ColumnDef<UserOut>[]>(
    () => [
      { accessorKey: "email", header: "Email", Cell: ({ row }) => row.original.email ?? "-" },
      {
        accessorKey: "is_active",
        header: "Status",
        size: 110,
        Cell: ({ row }) => <StatusBadge active={row.original.is_active} />,
      },
      {
        id: "verified",
        header: "Verified",
        size: 140,
        Cell: ({ row }) => verifiedText(row.original),
      },
      {
        accessorKey: "id",
        header: "ID",
        size: 120,
        Cell: ({ row }) => <Code>{row.original.id.slice(0, 8)}</Code>,
      },
    ],
    [],
  );

  return (
    <>
      <DataTable<UserOut>
        columns={columns}
        data={query.data?.items ?? []}
        rowCount={query.data?.total ?? 0}
        pagination={pagination}
        onPaginationChange={setPagination}
        isLoading={query.isLoading}
        isFetching={query.isFetching}
        isError={query.isError}
        error={query.error}
        enableGlobalFilter
        globalFilter={search}
        onGlobalFilterChange={handleSearch}
        searchPlaceholder="Search by email"
        emptyText="No staff accounts found."
        toolbar={
          canCreateStaff ? (
            <Button leftSection={<IconPlus size={16} />} onClick={createHandlers.open}>
              Create staff
            </Button>
          ) : undefined
        }
        enableRowActions
        renderRowActions={({ row }) => (
          <Tooltip label="Manage user">
            <ActionIcon variant="subtle" onClick={() => openUser(row.original.id)}>
              <IconPencil size={18} />
            </ActionIcon>
          </Tooltip>
        )}
      />

      <CreateStaffModal opened={createOpened} onClose={createHandlers.close} />
      <UserEditorDrawer
        opened={drawerOpened}
        userId={editUserId}
        onClose={drawerHandlers.close}
      />
    </>
  );
}

export function UsersPage() {
  return (
    <>
      <PageHero
        image={HEROES.users}
        title="Users & Roles"
        description="Browse frontend users and manage staff accounts and their roles."
      />

      <Tabs defaultValue="frontend" keepMounted={false}>
        <Tabs.List mb="md">
          <Tabs.Tab value="frontend" leftSection={<IconDeviceMobile size={16} />}>
            Frontend Users
          </Tabs.Tab>
          <Tabs.Tab value="staff" leftSection={<IconShieldCog size={16} />}>
            Staff &amp; Admins
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="frontend">
          <FrontendUsersTab />
        </Tabs.Panel>
        <Tabs.Panel value="staff">
          <StaffUsersTab />
        </Tabs.Panel>
      </Tabs>
    </>
  );
}
