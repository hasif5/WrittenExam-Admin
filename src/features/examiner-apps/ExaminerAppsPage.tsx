// Examiner applications review queue (filter by status) + detail drawer.
// Author: Hasif Ahmed (www.hasif.info)

import { useMemo, useState } from "react";
import { ActionIcon, Badge, Button, Select, Tooltip } from "@mantine/core";
import { IconCheck, IconEye, IconPencilCog, IconX } from "@tabler/icons-react";
import type { MRT_ColumnDef } from "mantine-react-table";
import { PageHero } from "@/components/PageHero";
import { HEROES } from "@/assets/heroes";
import { DataTable } from "@/components/DataTable";
import { usePagination } from "@/lib/usePagination";
import { useApplicationDecision, useExaminerApps } from "@/api/queries/examiners";
import { APPLICATION_STATUSES } from "@/lib/constants";
import { runBulkWithToast } from "@/lib/bulk";
import { formatDateTime } from "@/lib/format";
import type { ApplicationStatus, ExaminerApplicationOut } from "@/api/types";
import { ApplicationDrawer } from "./ApplicationDrawer";
import { BulkDecisionModal, type BulkDecision } from "./BulkDecisionModal";

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
  const [bulk, setBulk] = useState<{
    decision: BulkDecision;
    apps: ExaminerApplicationOut[];
    clear: () => void;
  } | null>(null);

  const query = useExaminerApps({ status, limit, offset });
  const decision = useApplicationDecision();

  const runBulkDecision = async (remarks: string) => {
    if (!bulk) return;
    await runBulkWithToast(
      bulk.apps,
      (app) => decision.mutateAsync({ id: app.id, decision: bulk.decision, remarks }),
      { noun: "applications", verbPast: "updated" },
    );
    bulk.clear();
    setBulk(null);
  };

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
      <PageHero
        image={HEROES.examinerApps}
        title="Examiner Applications"
        description="Review public examiner applications and approve, reject, or request changes."
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
        filters={
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
        enableRowSelection
        getRowId={(row) => row.id}
        renderBulkActions={(selected, clear) => (
          <>
            <Button
              size="xs"
              color="green"
              variant="light"
              leftSection={<IconCheck size={14} />}
              onClick={() => setBulk({ decision: "approve", apps: selected, clear })}
            >
              Approve
            </Button>
            <Button
              size="xs"
              color="orange"
              variant="light"
              leftSection={<IconPencilCog size={14} />}
              onClick={() => setBulk({ decision: "request-changes", apps: selected, clear })}
            >
              Request changes
            </Button>
            <Button
              size="xs"
              color="red"
              variant="light"
              leftSection={<IconX size={14} />}
              onClick={() => setBulk({ decision: "reject", apps: selected, clear })}
            >
              Reject
            </Button>
          </>
        )}
        enableRowActions
        renderRowActions={({ row }) => (
          <Tooltip label="Review">
            <ActionIcon variant="subtle" onClick={() => setSelectedId(row.original.id)}>
              <IconEye size={18} />
            </ActionIcon>
          </Tooltip>
        )}
      />

      <BulkDecisionModal
        decision={bulk?.decision ?? null}
        count={bulk?.apps.length ?? 0}
        busy={decision.isPending}
        onClose={() => setBulk(null)}
        onConfirm={runBulkDecision}
      />

      <ApplicationDrawer applicationId={selectedId} onClose={() => setSelectedId(null)} />
    </>
  );
}
