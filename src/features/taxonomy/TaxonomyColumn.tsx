// A single taxonomy column (Sections / Subjects / Chapters) with inline create,
// selection, per-row menu (edit, activate/deactivate, usage, delete).
// Author: Hasif Ahmed (www.hasif.info)

import { useState } from "react";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Group,
  Loader,
  Menu,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import {
  IconChevronRight,
  IconDotsVertical,
  IconEdit,
  IconEye,
  IconPlus,
  IconToggleLeft,
  IconToggleRight,
  IconTrash,
} from "@tabler/icons-react";
import { ErrorState } from "@/components/ErrorState";

export interface TaxonomyNode {
  id: string;
  name: string;
  is_active: boolean;
  display_order: number;
  code?: string;
}

interface TaxonomyColumnProps {
  title: string;
  nodes: TaxonomyNode[];
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  onRetry?: () => void;
  selectable?: boolean;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  disabled?: boolean;
  disabledHint?: string;
  withCode?: boolean;
  creating?: boolean;
  onCreate: (data: { name: string; code?: string }) => Promise<void>;
  onEdit: (node: TaxonomyNode) => void;
  onToggleActive: (node: TaxonomyNode) => void;
  onDelete: (node: TaxonomyNode) => void;
  onUsage?: (node: TaxonomyNode) => void;
}

export function TaxonomyColumn({
  title,
  nodes,
  isLoading,
  isError,
  error,
  onRetry,
  selectable,
  selectedId,
  onSelect,
  disabled,
  disabledHint,
  withCode,
  creating,
  onCreate,
  onEdit,
  onToggleActive,
  onDelete,
  onUsage,
}: TaxonomyColumnProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const submitCreate = async () => {
    if (name.trim().length === 0) return;
    if (withCode && code.trim().length === 0) return;
    await onCreate({ name: name.trim(), code: withCode ? code.trim() : undefined });
    setName("");
    setCode("");
  };

  return (
    <Card withBorder radius="md" padding="sm" h="100%">
      <Text fw={600} mb="xs">
        {title}
      </Text>

      {disabled ? (
        <Center h={160}>
          <Text c="dimmed" size="sm" ta="center">
            {disabledHint}
          </Text>
        </Center>
      ) : (
        <>
          <Stack gap="xs" mb="sm">
            {withCode && (
              <TextInput
                size="xs"
                placeholder="Code (e.g. BCS)"
                value={code}
                onChange={(e) => setCode(e.currentTarget.value)}
              />
            )}
            <Group gap="xs" wrap="nowrap">
              <TextInput
                size="xs"
                placeholder={`New ${title.toLowerCase().replace(/s$/, "")}`}
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void submitCreate();
                }}
                style={{ flex: 1 }}
              />
              <ActionIcon
                variant="filled"
                size="md"
                loading={creating}
                onClick={() => void submitCreate()}
                aria-label="Add"
              >
                <IconPlus size={16} />
              </ActionIcon>
            </Group>
          </Stack>

          {isLoading ? (
            <Center h={120}>
              <Loader size="sm" />
            </Center>
          ) : isError ? (
            <ErrorState error={error} onRetry={onRetry} />
          ) : nodes.length === 0 ? (
            <Text c="dimmed" size="sm" ta="center" py="md">
              No items yet.
            </Text>
          ) : (
            <ScrollArea.Autosize mah={460}>
              <Stack gap={4}>
                {nodes.map((node) => {
                  const selected = selectable && selectedId === node.id;
                  return (
                    <Group
                      key={node.id}
                      gap={4}
                      wrap="nowrap"
                      px="xs"
                      py={6}
                      style={{
                        borderRadius: 8,
                        // Theme-driven, scheme-aware brand tint (same token as
                        // variant="light"); legible in both light and dark.
                        backgroundColor: selected
                          ? "var(--mantine-primary-color-light)"
                          : undefined,
                      }}
                    >
                      <UnstyledButton
                        style={{ flex: 1, minWidth: 0 }}
                        onClick={() => selectable && onSelect?.(node.id)}
                      >
                        <Group gap={6} wrap="nowrap">
                          <Box style={{ flex: 1, minWidth: 0 }}>
                            <Group gap={6} wrap="nowrap">
                              <Text size="sm" truncate>
                                {node.name}
                              </Text>
                              {node.code && (
                                <Badge size="xs" variant="outline" color="gray">
                                  {node.code}
                                </Badge>
                              )}
                              {!node.is_active && (
                                <Badge size="xs" color="gray" variant="light">
                                  inactive
                                </Badge>
                              )}
                            </Group>
                          </Box>
                          {selectable && <IconChevronRight size={14} opacity={0.5} />}
                        </Group>
                      </UnstyledButton>

                      <Menu shadow="md" position="bottom-end" withinPortal>
                        <Menu.Target>
                          <ActionIcon variant="subtle" size="sm">
                            <IconDotsVertical size={16} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item leftSection={<IconEdit size={14} />} onClick={() => onEdit(node)}>
                            Edit
                          </Menu.Item>
                          <Menu.Item
                            leftSection={
                              node.is_active ? (
                                <IconToggleLeft size={14} />
                              ) : (
                                <IconToggleRight size={14} />
                              )
                            }
                            onClick={() => onToggleActive(node)}
                          >
                            {node.is_active ? "Deactivate" : "Activate"}
                          </Menu.Item>
                          {onUsage && (
                            <Menu.Item
                              leftSection={<IconEye size={14} />}
                              onClick={() => onUsage(node)}
                            >
                              View usage
                            </Menu.Item>
                          )}
                          <Menu.Divider />
                          <Menu.Item
                            color="red"
                            leftSection={<IconTrash size={14} />}
                            onClick={() => onDelete(node)}
                          >
                            Delete
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Group>
                  );
                })}
              </Stack>
            </ScrollArea.Autosize>
          )}
        </>
      )}
      {/* Reserved area keeps column heights aligned when empty */}
      <Box mt="auto">
        {!disabled && nodes.length > 0 && (
          <Button variant="subtle" size="xs" disabled style={{ visibility: "hidden" }}>
            spacer
          </Button>
        )}
      </Box>
    </Card>
  );
}
