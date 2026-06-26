// Set examiner fee override -> PUT /admin/examiners/{id}/fee-override.
// The backend stores admin_override as a free-form object; this editor accepts JSON
// so any agreed fee structure can be entered without hardcoding a shape.
// Author: Hasif Ahmed (www.hasif.info)

import { useEffect, useState } from "react";
import { Button, Group, JsonInput, Modal, Stack, Text } from "@mantine/core";
import { useFeeOverride } from "@/api/queries/examiners";
import { notifyError, notifySuccess } from "@/lib/notify";
import type { ExaminerRosterOut } from "@/api/types";

export function FeeOverrideModal({
  examiner,
  onClose,
}: {
  examiner: ExaminerRosterOut | null;
  onClose: () => void;
}) {
  const mutation = useFeeOverride();
  const [value, setValue] = useState("{\n  \n}");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValue('{\n  "amount": 0\n}');
    setError(null);
  }, [examiner]);

  if (!examiner) return null;

  const submit = async () => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(value);
    } catch {
      setError("Enter valid JSON.");
      return;
    }
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      setError("Override must be a JSON object.");
      return;
    }
    try {
      await mutation.mutateAsync({
        userId: examiner.user_id,
        adminOverride: parsed as object,
      });
      notifySuccess("Fee override applied.");
      onClose();
    } catch (err) {
      notifyError(err, "Update failed");
    }
  };

  return (
    <Modal opened={Boolean(examiner)} onClose={onClose} title="Fee override" centered>
      <Stack>
        <Text size="sm" c="dimmed">
          Provide the admin fee override as a JSON object.
        </Text>
        <JsonInput
          autosize
          minRows={5}
          formatOnBlur
          value={value}
          onChange={(v) => {
            setValue(v);
            if (error) setError(null);
          }}
          error={error}
        />
        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={mutation.isPending} onClick={submit}>
            Apply
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
