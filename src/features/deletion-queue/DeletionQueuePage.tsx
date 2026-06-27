// Account-deletion queue: review pending/grace deletions; restore or force hard-delete.
// Author: Hasif Ahmed (www.hasif.info)

import { Badge, Button, Card, Code, Group, Loader, Center, Table, Text } from "@mantine/core";
import { IconRestore, IconTrash } from "@tabler/icons-react";
import { PageHero } from "@/components/PageHero";
import { HEROES } from "@/assets/heroes";
import { ErrorState } from "@/components/ErrorState";
import {
  useDeletionQueue,
  useHardDeleteAccount,
  useRestoreAccount,
} from "@/api/queries/users";
import { confirmAction } from "@/lib/confirm";
import { notifyError, notifySuccess } from "@/lib/notify";
import { formatDateTime, relativeDaysFrom } from "@/lib/format";
import type { AccountDeletionRequestOut } from "@/api/types";

function statusColor(status: string): string {
  switch (status) {
    case "pending":
      return "yellow";
    case "grace":
      return "orange";
    default:
      return "gray";
  }
}

export function DeletionQueuePage() {
  const query = useDeletionQueue();
  const restore = useRestoreAccount();
  const hardDelete = useHardDeleteAccount();

  const onRestore = (req: AccountDeletionRequestOut) =>
    confirmAction({
      title: "Restore account",
      children: (
        <Text size="sm">
          Restore this account within its grace window? Login is re-enabled and the deletion is
          cancelled.
        </Text>
      ),
      confirmLabel: "Restore",
      onConfirm: async () => {
        try {
          await restore.mutateAsync(req.id);
          notifySuccess("Account restored.");
        } catch (err) {
          notifyError(err, "Restore failed");
        }
      },
    });

  const onHardDelete = (req: AccountDeletionRequestOut) =>
    confirmAction({
      title: "Force hard-delete",
      danger: true,
      children: (
        <Text size="sm">
          This permanently anonymises and purges the account now, before the grace window ends.
          This cannot be undone.
        </Text>
      ),
      confirmLabel: "Hard-delete",
      onConfirm: async () => {
        try {
          await hardDelete.mutateAsync(req.id);
          notifySuccess("Account hard-deleted.");
        } catch (err) {
          notifyError(err, "Hard-delete failed");
        }
      },
    });

  return (
    <>
      <PageHero
        image={HEROES.deletion}
        title="Account Deletion Queue"
        description="Soft-deleted accounts within their 30-day grace window. Restore or force an immediate purge."
      />

      {query.isLoading ? (
        <Center h={200}>
          <Loader />
        </Center>
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : (query.data?.length ?? 0) === 0 ? (
        <Card withBorder padding="xl" radius="md">
          <Text c="dimmed" ta="center">
            No pending account deletions.
          </Text>
        </Card>
      ) : (
        <Card withBorder padding={0} radius="md">
          <Table.ScrollContainer minWidth={760}>
            <Table verticalSpacing="sm" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>User</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Reason</Table.Th>
                  <Table.Th>Requested</Table.Th>
                  <Table.Th>Purge after</Table.Th>
                  <Table.Th ta="right">Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {query.data?.map((req) => (
                  <Table.Tr key={req.id}>
                    <Table.Td>
                      <Code>{req.user_id.slice(0, 8)}</Code>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={statusColor(req.status)} variant="light">
                        {req.status}
                      </Badge>
                    </Table.Td>
                    <Table.Td maw={240}>
                      <Text size="sm" lineClamp={2}>
                        {req.reason || "-"}
                      </Text>
                    </Table.Td>
                    <Table.Td>{formatDateTime(req.requested_at)}</Table.Td>
                    <Table.Td>
                      <Text size="sm">{formatDateTime(req.purge_after)}</Text>
                      <Text size="xs" c="dimmed">
                        {relativeDaysFrom(req.purge_after)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs" justify="flex-end" wrap="nowrap">
                        <Button
                          size="xs"
                          variant="light"
                          leftSection={<IconRestore size={14} />}
                          onClick={() => onRestore(req)}
                        >
                          Restore
                        </Button>
                        <Button
                          size="xs"
                          variant="light"
                          color="red"
                          leftSection={<IconTrash size={14} />}
                          onClick={() => onHardDelete(req)}
                        >
                          Hard-delete
                        </Button>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Card>
      )}
    </>
  );
}
