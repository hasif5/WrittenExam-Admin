// Tag examiner pool membership -> POST /admin/examiners/{id}/pool-membership.
// Surfaces the examiner's current membership per pool first, and pre-fills the
// active toggle from the selected pool's existing state, so the admin edits with
// the starting state visible rather than a blank form.
// File: src/features/examiners/PoolMembershipModal.tsx
// Author: Hasif Ahmed (www.hasif.info)

import { useEffect, useState } from "react";
import { Badge, Button, Group, Modal, Select, Stack, Switch, Text } from "@mantine/core";
import { usePoolTag } from "@/api/queries/examiners";
import { POOL_TYPES } from "@/lib/constants";
import { notifyError, notifySuccess } from "@/lib/notify";
import type { ExaminerRosterOut, PoolType } from "@/api/types";

function membershipFor(examiner: ExaminerRosterOut | null, pool: PoolType) {
  return (examiner?.pool_memberships ?? []).find((m) => m.pool_type === pool);
}

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

  // When the editor opens (or the pool changes) reflect that pool's current state.
  useEffect(() => {
    if (!examiner) return;
    const current = membershipFor(examiner, poolType);
    setActive(current ? current.active : true);
  }, [examiner, poolType]);

  if (!examiner) return null;

  const current = membershipFor(examiner, poolType);

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
        <div>
          <Text size="sm" fw={500} mb={6}>
            Current membership
          </Text>
          <Group gap="xs">
            {POOL_TYPES.map((p) => {
              const m = membershipFor(examiner, p.value as PoolType);
              const color = !m ? "gray" : m.active ? "green" : "orange";
              const state = !m ? "Not a member" : m.active ? "Active" : "Inactive";
              return (
                <Badge key={p.value} color={color} variant="light">
                  {p.label}: {state}
                </Badge>
              );
            })}
          </Group>
        </div>

        <Select
          label="Pool type"
          data={POOL_TYPES as unknown as { value: string; label: string }[]}
          value={poolType}
          onChange={(v) => setPoolType((v as PoolType) ?? "verified_pool")}
          allowDeselect={false}
        />
        <Switch
          label="Active membership"
          description={
            current
              ? `Currently ${current.active ? "active" : "inactive"} in this pool.`
              : "Not currently a member of this pool."
          }
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
