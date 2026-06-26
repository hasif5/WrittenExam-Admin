// Examiner roster: list + display fields + fee override + pool tag + suspend/reactivate.
// Author: Hasif Ahmed (www.hasif.info)

import { useMemo, useState } from "react";
import { ActionIcon, Badge, Group, Menu, Select, Text } from "@mantine/core";
import {
  IconDotsVertical,
  IconCoin,
  IconEdit,
  IconPlayerPause,
  IconPlayerPlay,
  IconUsersGroup,
} from "@tabler/icons-react";
import type { MRT_ColumnDef } from "mantine-react-table";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { usePagination } from "@/lib/usePagination";
import { useExaminerRoster, useSetAccountStatus } from "@/api/queries/examiners";
import { ROSTER_STATUSES } from "@/lib/constants";
import { confirmAction } from "@/lib/confirm";
import { notifyError, notifySuccess } from "@/lib/notify";
import type { ExaminerRosterOut, RosterStatus } from "@/api/types";
import { DisplayFieldsModal } from "./DisplayFieldsModal";
import { FeeOverrideModal } from "./FeeOverrideModal";
import { PoolMembershipModal } from "./PoolMembershipModal";

function statusColor(status: string): string {
  switch (status) {
    case "active":
      return "green";
    case "suspended":
      return "red";
    default:
      return "yellow";
  }
}

export function ExaminersPage() {
  const { pagination, setPagination, limit, offset } = usePagination();
  const [status, setStatus] = useState<RosterStatus | undefined>(undefined);
  const [displayExaminer, setDisplayExaminer] = useState<ExaminerRosterOut | null>(null);
  const [feeExaminer, setFeeExaminer] = useState<ExaminerRosterOut | null>(null);
  const [poolExaminer, setPoolExaminer] = useState<ExaminerRosterOut | null>(null);

  const query = useExaminerRoster({ status, limit, offset });
  const setAccountStatus = useSetAccountStatus();

  const toggleStatus = (ex: ExaminerRosterOut) => {
    const suspend = ex.account_status !== "suspended";
    confirmAction({
      title: suspend ? "Suspend examiner" : "Reactivate examiner",
      danger: suspend,
      children: (
        <Text size="sm">
          {suspend
            ? "New routing stops immediately. In-flight evaluations are protected."
            : "This reverses the suspension and allows new routing again."}
        </Text>
      ),
      confirmLabel: suspend ? "Suspend" : "Reactivate",
      onConfirm: async () => {
        try {
          await setAccountStatus.mutateAsync({
            userId: ex.user_id,
            action: suspend ? "suspend" : "reactivate",
          });
          notifySuccess(suspend ? "Examiner suspended." : "Examiner reactivated.");
        } catch (err) {
          notifyError(err, "Status change failed");
        }
      },
    });
  };

  const columns = useMemo<MRT_ColumnDef<ExaminerRosterOut>[]>(
    () => [
      {
        accessorKey: "displayed_name",
        header: "Displayed name",
        Cell: ({ row }) => row.original.displayed_name || "-",
      },
      {
        accessorKey: "present_job",
        header: "Present job",
        Cell: ({ row }) => row.original.present_job || "-",
      },
      {
        accessorKey: "university",
        header: "University",
        Cell: ({ row }) => row.original.university || "-",
      },
      {
        id: "badges",
        header: "Badges",
        Cell: ({ row }) => {
          const badges = Array.isArray(row.original.verification_badges)
            ? (row.original.verification_badges as string[])
            : [];
          return badges.length ? (
            <Group gap={4}>
              {badges.map((b) => (
                <Badge key={b} size="xs" variant="outline">
                  {b}
                </Badge>
              ))}
            </Group>
          ) : (
            "-"
          );
        },
      },
      {
        accessorKey: "account_status",
        header: "Status",
        size: 120,
        Cell: ({ row }) => (
          <Badge color={statusColor(row.original.account_status)} variant="light">
            {row.original.account_status}
          </Badge>
        ),
      },
    ],
    [],
  );

  return (
    <>
      <PageHeader
        title="Examiner Roster"
        description="The admin-curated active roster. Edit display fields, fees, pool tags, and account status."
        actions={
          <Select
            data={[{ value: "", label: "All statuses" }, ...ROSTER_STATUSES]}
            value={status ?? ""}
            onChange={(v) => {
              setStatus((v || undefined) as RosterStatus | undefined);
              setPagination((p) => ({ ...p, pageIndex: 0 }));
            }}
            w={200}
            allowDeselect={false}
          />
        }
      />

      <DataTable<ExaminerRosterOut>
        columns={columns}
        data={query.data?.items ?? []}
        rowCount={query.data?.total ?? 0}
        pagination={pagination}
        onPaginationChange={setPagination}
        isLoading={query.isLoading}
        isFetching={query.isFetching}
        isError={query.isError}
        error={query.error}
        enableRowActions
        renderRowActions={({ row }) => {
          const ex = row.original;
          const suspended = ex.account_status === "suspended";
          return (
            <Menu shadow="md" position="bottom-end" withinPortal>
              <Menu.Target>
                <ActionIcon variant="subtle">
                  <IconDotsVertical size={18} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconEdit size={16} />}
                  onClick={() => setDisplayExaminer(ex)}
                >
                  Edit display fields
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconCoin size={16} />}
                  onClick={() => setFeeExaminer(ex)}
                >
                  Fee override
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconUsersGroup size={16} />}
                  onClick={() => setPoolExaminer(ex)}
                >
                  Pool membership
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  color={suspended ? "green" : "red"}
                  leftSection={
                    suspended ? <IconPlayerPlay size={16} /> : <IconPlayerPause size={16} />
                  }
                  onClick={() => toggleStatus(ex)}
                >
                  {suspended ? "Reactivate" : "Suspend"}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          );
        }}
      />

      <DisplayFieldsModal examiner={displayExaminer} onClose={() => setDisplayExaminer(null)} />
      <FeeOverrideModal examiner={feeExaminer} onClose={() => setFeeExaminer(null)} />
      <PoolMembershipModal examiner={poolExaminer} onClose={() => setPoolExaminer(null)} />
    </>
  );
}
