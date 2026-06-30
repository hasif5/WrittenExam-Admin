// Users & roles: two tabs to keep the list scannable - phone-based frontend
// users (students/examiners/pool, default) and email-based staff/admin accounts.
// Author: Hasif Ahmed (www.hasif.info)

import { useState, type ReactNode } from "react";
import { ActionIcon, Button, Tabs, Text, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconDeviceMobile,
  IconPencil,
  IconPlayerPause,
  IconPlayerPlay,
  IconPlus,
  IconShieldCog,
} from "@tabler/icons-react";
import type { MRT_ColumnDef } from "mantine-react-table";
import { PageHero } from "@/components/PageHero";
import { HEROES } from "@/assets/heroes";
import { DataTable } from "@/components/DataTable";
import { usePagination } from "@/lib/usePagination";
import { useSetUserActive, useUsers } from "@/api/queries/users";
import { useAuth } from "@/auth/useAuth";
import { confirmAction } from "@/lib/confirm";
import { runBulkWithToast } from "@/lib/bulk";
import type { UserDetailOut } from "@/api/types";
import { CreateStaffModal } from "./CreateStaffModal";
import { UserEditorDrawer } from "./UserEditorDrawer";
import { frontendUserColumns, staffUserColumns } from "./userColumns";
import {
  UsersToolbar,
  type JoinedPreset,
  type UserStatusFilter,
} from "./UsersToolbar";
import { joinedAfterFromPreset } from "./userFilterPresets";

// Shared bulk suspend/reactivate bar for either users tab (frontend or staff).
function userBulkActions(
  mutate: (v: { userId: string; active: boolean }) => Promise<unknown>,
) {
  const run = (selected: UserDetailOut[], active: boolean, clear: () => void) =>
    confirmAction({
      title: `${active ? "Reactivate" : "Suspend"} ${selected.length} account(s)`,
      danger: !active,
      children: (
        <Text size="sm">
          {active
            ? "Re-enables login for the selected accounts."
            : "Disables login for the selected accounts immediately."}
        </Text>
      ),
      confirmLabel: active ? "Reactivate" : "Suspend",
      onConfirm: async () => {
        await runBulkWithToast(selected, (u) => mutate({ userId: u.id, active }), {
          noun: "accounts",
          verbPast: active ? "reactivated" : "suspended",
        });
        clear();
      },
    });

  return (selected: UserDetailOut[], clear: () => void) => (
    <>
      <Button
        size="xs"
        color="red"
        variant="light"
        leftSection={<IconPlayerPause size={14} />}
        onClick={() => run(selected, false, clear)}
      >
        Suspend
      </Button>
      <Button
        size="xs"
        color="green"
        variant="light"
        leftSection={<IconPlayerPlay size={14} />}
        onClick={() => run(selected, true, clear)}
      >
        Reactivate
      </Button>
    </>
  );
}

interface UsersTabProps {
  userType: "frontend" | "staff";
  columns: MRT_ColumnDef<UserDetailOut>[];
  searchPlaceholder: string;
  emptyText: string;
  extraToolbar?: ReactNode;
}

// Shared tab body: identical table + filters for either user population; only the
// user_type, columns, copy, and an optional toolbar action (Create staff) differ.
function UsersTab({ userType, columns, searchPlaceholder, emptyText, extraToolbar }: UsersTabProps) {
  const { pagination, setPagination, limit, offset } = usePagination();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<UserStatusFilter | null>(null);
  const [joined, setJoined] = useState<JoinedPreset>("any");
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [drawerOpened, drawerHandlers] = useDisclosure(false);
  const query = useUsers({
    search: search || undefined,
    limit,
    offset,
    userType,
    status: status ?? undefined,
    joinedAfter: joinedAfterFromPreset(joined),
  });
  const setActive = useSetUserActive();

  const resetPage = () => setPagination((p) => ({ ...p, pageIndex: 0 }));
  const openUser = (id: string) => {
    setEditUserId(id);
    drawerHandlers.open();
  };
  const handleSearch = (value: string) => {
    setSearch(value);
    resetPage();
  };

  return (
    <>
      <DataTable<UserDetailOut>
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
        searchPlaceholder={searchPlaceholder}
        emptyText={emptyText}
        enableRowSelection
        getRowId={(row) => row.id}
        renderBulkActions={userBulkActions(setActive.mutateAsync)}
        toolbar={extraToolbar}
        filters={
          <UsersToolbar
            status={status}
            onStatusChange={(value) => {
              setStatus(value);
              resetPage();
            }}
            joined={joined}
            onJoinedChange={(value) => {
              setJoined(value);
              resetPage();
            }}
          />
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

      <UserEditorDrawer
        opened={drawerOpened}
        userId={editUserId}
        onClose={drawerHandlers.close}
      />
    </>
  );
}

function FrontendUsersTab() {
  return (
    <UsersTab
      userType="frontend"
      columns={frontendUserColumns}
      searchPlaceholder="Search by name, phone, or email"
      emptyText="No frontend users found."
    />
  );
}

function StaffUsersTab() {
  const { can } = useAuth();
  const [createOpened, createHandlers] = useDisclosure(false);

  return (
    <>
      <UsersTab
        userType="staff"
        columns={staffUserColumns}
        searchPlaceholder="Search by name or email"
        emptyText="No staff accounts found."
        extraToolbar={
          can("users.create_staff") ? (
            <Button leftSection={<IconPlus size={16} />} onClick={createHandlers.open}>
              Create staff
            </Button>
          ) : undefined
        }
      />
      <CreateStaffModal opened={createOpened} onClose={createHandlers.close} />
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
