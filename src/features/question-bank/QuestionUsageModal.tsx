// Question usage (which quizzes reference it) -> GET /admin/questions/{id}/usage.
// Returns a stub note until Phase 2 quizzes exist.
// Author: Hasif Ahmed (www.hasif.info)

import { Center, List, Loader, Modal, Text } from "@mantine/core";
import { ErrorState } from "@/components/ErrorState";
import { useQuestionUsage } from "@/api/queries/questions";

export function QuestionUsageModal({
  questionId,
  onClose,
}: {
  questionId: string | null;
  onClose: () => void;
}) {
  const query = useQuestionUsage(questionId);

  return (
    <Modal opened={Boolean(questionId)} onClose={onClose} title="Question usage" centered>
      {query.isLoading ? (
        <Center h={120}>
          <Loader size="sm" />
        </Center>
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : (
        <>
          {query.data?.note && (
            <Text size="sm" c="dimmed" mb="sm">
              {query.data.note}
            </Text>
          )}
          {(query.data?.usages?.length ?? 0) === 0 ? (
            <Text size="sm">Not referenced by any quiz.</Text>
          ) : (
            <List>
              {query.data?.usages.map((u, i) => (
                <List.Item key={i}>
                  <Text size="sm">{JSON.stringify(u)}</Text>
                </List.Item>
              ))}
            </List>
          )}
        </>
      )}
    </Modal>
  );
}
