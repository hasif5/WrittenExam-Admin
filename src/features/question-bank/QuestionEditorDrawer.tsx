// Create / edit a Question Bank entry: taxonomy + type + rich stem content +
// mandatory solution, plus (for passage_with_children) an ordered, reorderable
// list of child sub-questions saved atomically (D5). Images are inserted inline
// in each rich-text field; the backend reconciles them into the asset junction.
// Thin composition root over the extracted sub-editors.
// File: src/features/question-bank/QuestionEditorDrawer.tsx
// Author: Hasif Ahmed <xmart@live.com> (www.hasif.info)
// Created: 2026-06-27

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Center,
  Divider,
  Group,
  Loader,
  Stack,
  Text,
} from "@mantine/core";
import { EditorDrawer } from "@/components/EditorDrawer";
import { HEROES } from "@/assets/heroes";
import { QuestionRichText } from "./QuestionRichText";
import { QuestionTaxonomyFields } from "./QuestionTaxonomyFields";
import { ChildQuestionList } from "./ChildQuestionList";
import {
  childrenToDrafts,
  makeEmptyChild,
  moveChild,
  type ChildDraft,
} from "./childDoc";
import { EMPTY_DOC, isDocEmpty, type TiptapDoc } from "./tiptapDoc";
import { useSections, useSubjects, useChapters } from "@/api/queries/taxonomy";
import { useCreateQuestion, useQuestion, useUpdateQuestion } from "@/api/queries/questions";
import { PASSAGE_WITH_CHILDREN, type QuestionType } from "@/lib/constants";
import { notifyError, notifySuccess } from "@/lib/notify";
import type { Schemas } from "@/api/client";

interface QuestionEditorDrawerProps {
  opened: boolean;
  questionId: string | null;
  onClose: () => void;
}

export function QuestionEditorDrawer({
  opened,
  questionId,
  onClose,
}: QuestionEditorDrawerProps) {
  const detail = useQuestion(questionId);
  const sections = useSections(true);

  const [sectionId, setSectionId] = useState<string | null>(null);
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [chapterId, setChapterId] = useState<string | null>(null);
  const [type, setType] = useState<QuestionType>("broad_written");
  const [content, setContent] = useState<TiptapDoc>(EMPTY_DOC);
  const [solution, setSolution] = useState<TiptapDoc>(EMPTY_DOC);
  const [solutionError, setSolutionError] = useState<string | null>(null);
  const [childDrafts, setChildDrafts] = useState<ChildDraft[]>([]);
  const [editorKey, setEditorKey] = useState(0);

  const subjects = useSubjects(sectionId ?? undefined);
  const chapters = useChapters(subjectId ?? undefined);

  const createQuestion = useCreateQuestion();
  const updateQuestion = useUpdateQuestion();

  // Reset on open / target change.
  useEffect(() => {
    if (!opened) return;
    setSolutionError(null);
    if (!questionId) {
      setSectionId(null);
      setSubjectId(null);
      setChapterId(null);
      setType("broad_written");
      setContent(EMPTY_DOC);
      setSolution(EMPTY_DOC);
      setChildDrafts([]);
      setEditorKey((k) => k + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, questionId]);

  // Populate when an existing (or freshly created) question loads.
  useEffect(() => {
    const q = detail.data;
    if (q && opened) {
      setSectionId(q.section_id);
      setSubjectId(q.subject_id);
      setChapterId(q.chapter_id);
      setType(q.type as QuestionType);
      setContent((q.content as TiptapDoc) ?? EMPTY_DOC);
      setSolution((q.solution as TiptapDoc) ?? EMPTY_DOC);
      setChildDrafts(childrenToDrafts(q.children));
      setEditorKey((k) => k + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail.data?.id]);

  const sectionOptions = useMemo(
    () => (sections.data ?? []).map((s) => ({ value: s.id, label: s.name })),
    [sections.data],
  );
  const subjectOptions = useMemo(
    () => (subjects.data ?? []).map((s) => ({ value: s.id, label: s.name })),
    [subjects.data],
  );
  const chapterOptions = useMemo(
    () => (chapters.data ?? []).map((c) => ({ value: c.id, label: c.name })),
    [chapters.data],
  );

  const isEdit = Boolean(questionId);
  const isPassageParent = type === PASSAGE_WITH_CHILDREN;
  const loadingDetail = Boolean(questionId) && detail.isLoading;

  const patchChild = (localId: string, patch: Partial<ChildDraft>) =>
    setChildDrafts((prev) =>
      prev.map((c) => (c.localId === localId ? { ...c, ...patch } : c)),
    );

  const buildChildrenPayload = (): Schemas["QuestionChildIn"][] =>
    childDrafts.map((c, index) => ({
      id: c.questionId,
      type: "broad_written",
      content: c.content,
      solution: c.solution,
      display_order: index,
    }));

  const validateChildren = (): boolean => {
    if (childDrafts.length === 0) {
      notifyError(new Error("Add at least one child question."), "Missing children");
      return false;
    }
    let hasError = false;
    const validated = childDrafts.map((c) => {
      const solErr = isDocEmpty(c.solution)
        ? "A non-empty solution is mandatory."
        : null;
      if (solErr || isDocEmpty(c.content)) hasError = true;
      return { ...c, solutionError: solErr };
    });
    if (hasError) {
      setChildDrafts(validated);
      notifyError(
        new Error("Each child question needs content and a solution."),
        "Incomplete child question",
      );
    }
    return !hasError;
  };

  const save = async () => {
    if (!sectionId || !subjectId || !chapterId) {
      notifyError(new Error("Select section, subject and chapter."), "Missing fields");
      return;
    }
    if (isDocEmpty(solution)) {
      setSolutionError("A non-empty solution is mandatory.");
      return;
    }
    if (isPassageParent && !validateChildren()) return;

    const base = {
      section_id: sectionId,
      subject_id: subjectId,
      chapter_id: chapterId,
      type,
      content,
      solution,
    };
    const children = isPassageParent ? buildChildrenPayload() : undefined;

    try {
      if (questionId) {
        await updateQuestion.mutateAsync({
          id: questionId,
          body: { ...base, ...(children ? { children } : {}) },
        });
        notifySuccess("Question saved.");
      } else {
        await createQuestion.mutateAsync({ ...base, children: children ?? [] });
        notifySuccess("Question created.");
      }
      onClose();
    } catch (err) {
      notifyError(err, "Save failed");
    }
  };

  return (
    <EditorDrawer
      opened={opened}
      onClose={onClose}
      title={isEdit ? "Edit question" : "New question"}
      caption="Author the question, solution and any sub-questions"
      image={HEROES.questionsEditor}
      size="xl"
      footer={
        loadingDetail ? undefined : (
          <Group justify="flex-end">
            <Button variant="default" onClick={onClose}>
              Close
            </Button>
            <Button
              loading={createQuestion.isPending || updateQuestion.isPending}
              onClick={save}
            >
              {isEdit ? "Save changes" : "Create question"}
            </Button>
          </Group>
        )
      }
    >
      {loadingDetail ? (
        <Center h={200}>
          <Loader />
        </Center>
      ) : (
        <Stack>
          <QuestionTaxonomyFields
            sectionId={sectionId}
            subjectId={subjectId}
            chapterId={chapterId}
            type={type}
            sectionOptions={sectionOptions}
            subjectOptions={subjectOptions}
            chapterOptions={chapterOptions}
            onSectionChange={(v) => {
              setSectionId(v);
              setSubjectId(null);
              setChapterId(null);
            }}
            onSubjectChange={(v) => {
              setSubjectId(v);
              setChapterId(null);
            }}
            onChapterChange={setChapterId}
            onTypeChange={setType}
          />

          <Box>
            <Text size="sm" fw={500} mb={4}>
              {isPassageParent || type === "passage" ? "Passage stem" : "Content"}
            </Text>
            <QuestionRichText
              key={`content-${editorKey}`}
              value={content}
              onChange={setContent}
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
              key={`solution-${editorKey}`}
              value={solution}
              onChange={(doc) => {
                setSolution(doc);
                if (solutionError) setSolutionError(null);
              }}
            />
            {solutionError && (
              <Text size="xs" c="red" mt={4}>
                {solutionError}
              </Text>
            )}
          </Box>

          {isPassageParent && (
            <>
              <Divider label="Child questions" labelPosition="left" />
              <ChildQuestionList
                childDrafts={childDrafts}
                onChange={patchChild}
                onMove={(index, dir) =>
                  setChildDrafts((prev) => moveChild(prev, index, dir))
                }
                onRemove={(localId) =>
                  setChildDrafts((prev) => prev.filter((c) => c.localId !== localId))
                }
                onAdd={() =>
                  setChildDrafts((prev) => [...prev, makeEmptyChild(prev.length)])
                }
              />
            </>
          )}
        </Stack>
      )}
    </EditorDrawer>
  );
}
