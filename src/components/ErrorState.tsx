// Inline error panel with retry.
// Author: Hasif Ahmed (www.hasif.info)

import { Alert, Button, Group } from "@mantine/core";
import { IconAlertTriangle, IconRefresh } from "@tabler/icons-react";
import { errorMessage } from "@/lib/errors";

interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
  title?: string;
}

export function ErrorState({ error, onRetry, title = "Could not load data" }: ErrorStateProps) {
  return (
    <Alert color="red" variant="light" icon={<IconAlertTriangle size={18} />} title={title}>
      <Group justify="space-between" align="center" wrap="wrap">
        <span>{errorMessage(error)}</span>
        {onRetry && (
          <Button
            size="xs"
            variant="white"
            color="red"
            leftSection={<IconRefresh size={14} />}
            onClick={onRetry}
          >
            Retry
          </Button>
        )}
      </Group>
    </Alert>
  );
}
