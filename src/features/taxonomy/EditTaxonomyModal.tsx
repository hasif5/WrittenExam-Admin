// Edit a taxonomy node: rename, set display order, toggle active.
// Author: Hasif Ahmed (www.hasif.info)

import { useEffect, useState } from "react";
import { Button, Group, Modal, NumberInput, Stack, Switch, TextInput } from "@mantine/core";

export interface EditableNode {
  id: string;
  name: string;
  is_active: boolean;
  display_order: number;
}

export function EditTaxonomyModal({
  node,
  title,
  saving,
  onClose,
  onSave,
}: {
  node: EditableNode | null;
  title: string;
  saving: boolean;
  onClose: () => void;
  onSave: (data: { name: string; is_active: boolean; display_order: number }) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [active, setActive] = useState(true);
  const [order, setOrder] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (node) {
      setName(node.name);
      setActive(node.is_active);
      setOrder(node.display_order);
      setError(null);
    }
  }, [node]);

  if (!node) return null;

  const submit = async () => {
    if (name.trim().length === 0) {
      setError("Name is required.");
      return;
    }
    await onSave({ name: name.trim(), is_active: active, display_order: order });
  };

  return (
    <Modal opened={Boolean(node)} onClose={onClose} title={title} centered>
      <Stack>
        <TextInput
          label="Name"
          value={name}
          onChange={(e) => {
            setName(e.currentTarget.value);
            if (error) setError(null);
          }}
          error={error}
        />
        <NumberInput
          label="Display order"
          value={order}
          onChange={(v) => setOrder(typeof v === "number" ? v : 0)}
          min={0}
        />
        <Switch
          label="Active"
          checked={active}
          onChange={(e) => setActive(e.currentTarget.checked)}
        />
        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={saving} onClick={submit}>
            Save
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
