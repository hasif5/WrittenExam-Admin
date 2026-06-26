// Tag examiner pool membership -> POST /admin/examiners/{id}/pool-membership.
// Author: Hasif Ahmed (www.hasif.info)

import { useEffect, useState } from "react";
import { Button, Group, Modal, Select, Stack, Switch } from "@mantine/core";
import { usePoolTag } from "@/api/queries/examiners";
import { POOL_TYPES } from "@/lib/constants";
import { notifyError, notifySuccess } from "@/lib/notify";
import type { ExaminerRosterOut, PoolType } from "@/api/types";

export function PoolMembershipModal({
  examiner,
  onClose,
}: {
  examiner: ExaminerRosterOut | null;
  onClose: () => void;
}) {
  const mutation = usePoolTag();
  const [poolType, setPoolType] = useState<PoolType>("verified_pool");
  const [active, setActive] = useState(true);

  useEffect(() => {
    setPoolType("verified_pool");
    setActive(true);
  }, [examiner]);

  if (!examiner) return null;

  const submit = async () => {
    try {
      await mutation.mutateAsync({ userId: examiner.user_id, poolType, active });
      notifySuccess("Pool membership updated.");
      onClose();
    } catch (err) {
      notifyError(err, "Update failed");
    }
  };

  return (
    <Modal opened={Boolean(examiner)} onClose={onClose} title="Pool membership" centered>
      <Stack>
        <Select
          label="Pool type"
          data={POOL_TYPES as unknown as { value: string; label: string }[]}
          value={poolType}
          onChange={(v) => setPoolType((v as PoolType) ?? "verified_pool")}
          allowDeselect={false}
        />
        <Switch
          label="Active membership"
          checked={active}
          onChange={(e) => setActive(e.currentTarget.checked)}
        />
        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={mutation.isPending} onClick={submit}>
            Save
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
