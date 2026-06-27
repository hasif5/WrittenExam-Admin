// Repeatable, reorderable list of child sub-questions for a passage-with-children.
// Rendered only for that type; keyed by localId so reorder/remove never scrambles
// editor instances. Removing a saved child is confirmed; an unsaved draft drops.
// File: src/features/question-bank/ChildQuestionList.tsx
// Author: Hasif Ahmed <xmart@live.com> (www.hasif.info)
// Created: 2026-06-27

import { Button, Stack, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { ChildQuestionEditor } from "./ChildQuestionEditor";
import type { ChildDraft } from "./childDoc";
import type { TiptapDoc } from "./tiptapDoc";
import { confirmAction } from "@/lib/confirm";

interface ChildQuestionListProps {
  childDrafts: ChildDraft[];
  onChange: (localId: string, patch: Partial<ChildDraft>) => void;
  onMove: (index: number, dir: -1 | 1) => void;
  onRemove: (localId: string) => void;
  onAdd: () => void;
}

export function ChildQuestionList({
  childDrafts,
  onChange,
  onMove,
  onRemove,
  onAdd,
}: ChildQuestionListProps) {
  const requestRemove = (child: ChildDraft) => {
    if (child.questionId) {
      confirmAction({
        title: "Remove child question",
        danger: true,
        children: "This child question will be removed when you save.",
        confirmLabel: "Remove",
        onConfirm: () => onRemove(child.localId),
      });
    } else {
      onRemove(child.localId);
    }
  };

  return (
    <Stack gap="sm">
      <Text size="sm" fw={600}>
        Child questions{" "}
        <Text span c="red">
          *
        </Text>
      </Text>
      {childDrafts.length === 0 && (
        <Text size="xs" c="dimmed">
          Add at least one child question for a passage with child questions.
        </Text>
      )}
      {childDrafts.map((child, index) => (
        <ChildQuestionEditor
          key={child.localId}
          index={index}
          total={childDrafts.length}
          child={child}
          onContentChange={(doc: TiptapDoc) => onChange(child.localId, { content: doc })}
          onSolutionChange={(doc: TiptapDoc) =>
            onChange(child.localId, { solution: doc, solutionError: null })
          }
          onMove={(dir) => onMove(index, dir)}
          onRemove={() => requestRemove(child)}
        />
      ))}
      <Button
        variant="light"
        leftSection={<IconPlus size={16} />}
        onClick={onAdd}
        style={{ alignSelf: "flex-start" }}
      >
        Add child question
      </Button>
    </Stack>
  );
}
