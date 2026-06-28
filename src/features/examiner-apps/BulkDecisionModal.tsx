// Collects a single shared remark for a bulk examiner-application decision
// (approve / reject / request changes) applied to every selected application.
// File: src/features/examiner-apps/BulkDecisionModal.tsx
// Author: Hasif Ahmed <xmart@live.com> (www.hasif.info)
// Created: 2026-06-28

import { useState } from "react";
import { Button, Group, Modal, Stack, Text, Textarea } from "@mantine/core";

export type BulkDecision = "approve" | "reject" | "request-changes";

const TITLES: Record<BulkDecision, string> = {
  approve: "Approve applications",
  reject: "Reject applications",
  "request-changes": "Request changes",
};

const CONFIRM_LABELS: Record<BulkDecision, string> = {
  approve: "Approve",
  reject: "Reject",
  "request-changes": "Request changes",
};

interface BulkDecisionModalProps {
  decision: BulkDecision | null;
  count: number;
  busy?: boolean;
  onClose: () => void;
  onConfirm: (remarks: string) => void;
}

export function BulkDecisionModal({
  decision,
  count,
  busy,
  onClose,
  onConfirm,
}: BulkDecisionModalProps) {
  const [remarks, setRemarks] = useState("");
  const trimmed = remarks.trim();

  const close = () => {
    setRemarks("");
    onClose();
  };

  return (
    <Modal
      opened={decision !== null}
      onClose={close}
      centered
      title={
        <Text component="span" fw={600} fz="lg">
          {decision ? TITLES[decision] : ""}
        </Text>
      }
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          This decision and remark will be applied to all {count} selected application(s).
        </Text>
        <Textarea
          label="Remarks"
          placeholder="Shared remark recorded on every selected application"
          required
          minRows={3}
          autosize
          value={remarks}
          onChange={(e) => setRemarks(e.currentTarget.value)}
        />
        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={close} disabled={busy}>
            Cancel
          </Button>
          <Button
            color={decision === "reject" ? "red" : undefined}
            disabled={trimmed.length === 0}
            loading={busy}
            onClick={() => onConfirm(trimmed)}
          >
            {decision ? CONFIRM_LABELS[decision] : "Confirm"}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
