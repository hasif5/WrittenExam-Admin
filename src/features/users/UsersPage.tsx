// Users & roles list/search + create staff + manage roles.
// Author: Hasif Ahmed (www.hasif.info)

import { useMemo, useState } from "react";
import { ActionIcon, Badge, Button, Code, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus, IconUserCog } from "@tabler/icons-react";
import type { MRT_ColumnDef } from "mantine-react-table";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { usePagination } from "@/lib/usePagination";
import { useUsers } from "@/api/queries/users";
import type { UserOut } from "@/api/types";
import { CreateStaffModal } from "./CreateStaffModal";
import { ManageRolesModal } from "./ManageRolesModal";

export function UsersPage() {
  const { pagination, setPagination, limit, offset } = usePagination();
  const [search, setSearch] = useState("");
  const [createOpened, createHandlers] = useDisclosure(false);
  const [rolesUser, setRolesUser] = useState<UserOut | null>(null);

  const query = useUsers({ search: search || undefined, limit, offset });

  const handleSearch = (value: string) => {
    setSearch(value);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const columns = useMemo<MRT_ColumnDef<UserOut>[]>(
    () => [
      {
        accessorKey: "email",
        header: "Email",
        Cell: ({ row }) => row.original.email ?? "-",
      },
      {
        accessorKey: "phone",
        header: "Phone",
        Cell: ({ row }) => row.original.phone ?? "-",
      },
      {
        accessorKey: "is_active",
        header: "Status",
        size: 110,
        Cell: ({ row }) => (
          <Badge color={row.original.is_active ? "green" : "gray"} variant="light">
            {row.original.is_active ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        id: "verified",
        header: "Verified",
        size: 140,
        Cell: ({ row }) => {
          const flags: string[] = [];
          if (row.original.phone_verified) flags.push("phone");
          if (row.original.email_verified) flags.push("email");
          return flags.length ? flags.join(", ") : "-";
        },
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
      <PageHeader
        title="Users & Roles"
        description="Search all users, create staff accounts, and assign or revoke roles."
        actions={
          <Button leftSection={<IconPlus size={16} />} onClick={createHandlers.open}>
            Create staff
          </Button>
        }
      />

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
        searchPlaceholder="Search by email or phone"
        enableRowActions
        renderRowActions={({ row }) => (
          <Tooltip label="Manage roles">
            <ActionIcon variant="subtle" onClick={() => setRolesUser(row.original)}>
              <IconUserCog size={18} />
            </ActionIcon>
          </Tooltip>
        )}
      />

      <CreateStaffModal opened={createOpened} onClose={createHandlers.close} />
      <ManageRolesModal user={rolesUser} onClose={() => setRolesUser(null)} />
    </>
  );
}
