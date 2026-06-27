// One child sub-question of a passage: content + mandatory solution editors
// (each supporting inline images) plus reorder (up/down) and remove controls.
// File: src/features/question-bank/ChildQuestionEditor.tsx
// Author: Hasif Ahmed <xmart@live.com> (www.hasif.info)
// Created: 2026-06-27

import { ActionIcon, Box, Card, Group, Text } from "@mantine/core";
import { IconArrowDown, IconArrowUp, IconTrash } from "@tabler/icons-react";
import { QuestionRichText } from "./QuestionRichText";
import type { ChildDraft } from "./childDoc";
import type { TiptapDoc } from "./tiptapDoc";

interface ChildQuestionEditorProps {
  index: number;
  total: number;
  child: ChildDraft;
  onContentChange: (doc: TiptapDoc) => void;
  onSolutionChange: (doc: TiptapDoc) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}

export function ChildQuestionEditor({
  index,
  total,
  child,
  onContentChange,
  onSolutionChange,
  onMove,
  onRemove,
}: ChildQuestionEditorProps) {
  return (
    <Card withBorder radius="md" padding="md">
      <Group justify="space-between" mb="xs">
        <Text size="sm" fw={600}>
          Child {index + 1}
        </Text>
        <Group gap={4}>
          <ActionIcon
            variant="subtle"
            aria-label="Move up"
            disabled={index === 0}
            onClick={() => onMove(-1)}
          >
            <IconArrowUp size={16} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            aria-label="Move down"
            disabled={index === total - 1}
            onClick={() => onMove(1)}
          >
            <IconArrowDown size={16} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="red"
            aria-label="Remove child"
            onClick={onRemove}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </Group>

      <Box mb="sm">
        <Text size="sm" fw={500} mb={4}>
          Content
        </Text>
        <QuestionRichText
          key={`child-content-${child.localId}`}
          value={child.content}
          onChange={onContentChange}
          minHeight={120}
        />
      </Box>

      <Box>
        <Text size="sm" fw={500} mb={4}>
          Solution{" "}
          <Text span c="red">
            *
          </Text>
        </Text>
        <QuestionRichText
          key={`child-solution-${child.localId}`}
          value={child.solution}
          onChange={onSolutionChange}
          minHeight={120}
        />
        {child.solutionError && (
          <Text size="xs" c="red" mt={4}>
            {child.solutionError}
          </Text>
        )}
      </Box>
    </Card>
  );
}
