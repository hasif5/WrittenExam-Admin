// Section usage (reference counts) -> GET /admin/sections/{id}/usage.
// Author: Hasif Ahmed (www.hasif.info)

import { Center, List, Loader, Modal, Text } from "@mantine/core";
import { ErrorState } from "@/components/ErrorState";
import { useSectionUsage } from "@/api/queries/taxonomy";

export function SectionUsageModal({
  sectionId,
  onClose,
}: {
  sectionId: string | null;
  onClose: () => void;
}) {
  const query = useSectionUsage(sectionId);
  const usage = query.data?.usage ?? {};
  const entries = Object.entries(usage);

  return (
    <Modal opened={Boolean(sectionId)} onClose={onClose} title="Section usage" centered>
      {query.isLoading ? (
        <Center h={120}>
          <Loader size="sm" />
        </Center>
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : entries.length === 0 ? (
        <Text c="dimmed" size="sm">
          No references. This section can be safely deactivated or deleted.
        </Text>
      ) : (
        <List spacing="xs">
          {entries.map(([key, count]) => (
            <List.Item key={key}>
              <Text size="sm">
                <b>{count}</b> {key.replace(/_/g, " ")}
              </Text>
            </List.Item>
          ))}
        </List>
      )}
    </Modal>
  );
}
