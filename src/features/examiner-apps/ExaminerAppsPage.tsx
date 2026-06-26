// Examiner applications review queue (filter by status) + detail drawer.
// Author: Hasif Ahmed (www.hasif.info)

import { useMemo, useState } from "react";
import { ActionIcon, Badge, Select, Tooltip } from "@mantine/core";
import { IconEye } from "@tabler/icons-react";
import type { MRT_ColumnDef } from "mantine-react-table";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { usePagination } from "@/lib/usePagination";
import { useExaminerApps } from "@/api/queries/examiners";
import { APPLICATION_STATUSES } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import type { ApplicationStatus, ExaminerApplicationOut } from "@/api/types";
import { ApplicationDrawer } from "./ApplicationDrawer";

function statusColor(status: string): string {
  switch (status) {
    case "approved":
      return "green";
    case "rejected":
      return "red";
    case "changes_requested":
      return "orange";
    default:
      return "yellow";
  }
}

export function ExaminerAppsPage() {
  const { pagination, setPagination, limit, offset } = usePagination();
  const [status, setStatus] = useState<ApplicationStatus | undefined>("pending");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const query = useExaminerApps({ status, limit, offset });

  const columns = useMemo<MRT_ColumnDef<ExaminerApplicationOut>[]>(
    () => [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "email", header: "Email" },
      { accessorKey: "phone", header: "Phone", size: 140 },
      {
        accessorKey: "status",
        header: "Status",
        size: 150,
        Cell: ({ row }) => (
          <Badge color={statusColor(row.original.status)} variant="light">
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: "created_at",
        header: "Applied",
        size: 170,
        Cell: ({ row }) => formatDateTime(row.original.created_at),
      },
    ],
    [],
  );

  return (
    <>
      <PageHeader
        title="Examiner Applications"
        description="Review public examiner applications and approve, reject, or request changes."
        actions={
          <Select
            data={[{ value: "", label: "All statuses" }, ...APPLICATION_STATUSES]}
            value={status ?? ""}
            onChange={(v) => {
              setStatus((v || undefined) as ApplicationStatus | undefined);
              setPagination((p) => ({ ...p, pageIndex: 0 }));
            }}
            w={200}
            allowDeselect={false}
          />
        }
      />

      <DataTable<ExaminerApplicationOut>
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
        renderRowActions={({ row }) => (
          <Tooltip label="Review">
            <ActionIcon variant="subtle" onClick={() => setSelectedId(row.original.id)}>
              <IconEye size={18} />
            </ActionIcon>
          </Tooltip>
        )}
      />

      <ApplicationDrawer applicationId={selectedId} onClose={() => setSelectedId(null)} />
    </>
  );
}
