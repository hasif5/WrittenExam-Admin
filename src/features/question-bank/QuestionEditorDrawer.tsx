// Create / edit a Question Bank entry: taxonomy + type + rich content + mandatory
// solution (TipTap JSON with inline KaTeX) + image assets (edit mode only).
// Author: Hasif Ahmed (www.hasif.info)

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Center,
  Divider,
  Drawer,
  Group,
  Loader,
  Select,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { QuestionRichText } from "./QuestionRichText";
import { QuestionAssets } from "./QuestionAssets";
import { EMPTY_DOC, isDocEmpty, type TiptapDoc } from "./tiptapDoc";
import { useSections, useSubjects, useChapters } from "@/api/queries/taxonomy";
import { useCreateQuestion, useQuestion, useUpdateQuestion } from "@/api/queries/questions";
import { QUESTION_TYPES, type QuestionType } from "@/lib/constants";
import { notifyError, notifySuccess } from "@/lib/notify";

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
  const [createdId, setCreatedId] = useState<string | null>(null);
  const effectiveId = questionId ?? createdId;

  const detail = useQuestion(effectiveId);
  const sections = useSections(true);

  const [sectionId, setSectionId] = useState<string | null>(null);
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [chapterId, setChapterId] = useState<string | null>(null);
  const [type, setType] = useState<QuestionType>("broad_written");
  const [content, setContent] = useState<TiptapDoc>(EMPTY_DOC);
  const [solution, setSolution] = useState<TiptapDoc>(EMPTY_DOC);
  const [solutionError, setSolutionError] = useState<string | null>(null);
  const [editorKey, setEditorKey] = useState(0);

  const subjects = useSubjects(sectionId ?? undefined);
  const chapters = useChapters(subjectId ?? undefined);

  const createQuestion = useCreateQuestion();
  const updateQuestion = useUpdateQuestion();

  // Reset on open / target change.
  useEffect(() => {
    if (!opened) return;
    setCreatedId(null);
    setSolutionError(null);
    if (!questionId) {
      setSectionId(null);
      setSubjectId(null);
      setChapterId(null);
      setType("broad_written");
      setContent(EMPTY_DOC);
      setSolution(EMPTY_DOC);
      setEditorKey((k) => k + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, questionId]);

  // Populate when an existing question loads.
  useEffect(() => {
    const q = detail.data;
    if (q && opened) {
      setSectionId(q.section_id);
      setSubjectId(q.subject_id);
      setChapterId(q.chapter_id);
      setType(q.type as QuestionType);
      setContent((q.content as TiptapDoc) ?? EMPTY_DOC);
      setSolution((q.solution as TiptapDoc) ?? EMPTY_DOC);
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

  const isEdit = Boolean(effectiveId);
  const loadingDetail = Boolean(effectiveId) && detail.isLoading;

  const save = async () => {
    if (!sectionId || !subjectId || !chapterId) {
      notifyError(new Error("Select section, subject and chapter."), "Missing fields");
      return;
    }
    if (isDocEmpty(solution)) {
      setSolutionError("A non-empty solution is mandatory.");
      return;
    }
    try {
      if (effectiveId) {
        await updateQuestion.mutateAsync({
          id: effectiveId,
          body: {
            section_id: sectionId,
            subject_id: subjectId,
            chapter_id: chapterId,
            type,
            content,
            solution,
          },
        });
        notifySuccess("Question saved.");
        onClose();
      } else {
        const created = await createQuestion.mutateAsync({
          section_id: sectionId,
          subject_id: subjectId,
          chapter_id: chapterId,
          type,
          content,
          solution,
        });
        setCreatedId(created.id);
        notifySuccess("Question created. You can now attach images.");
      }
    } catch (err) {
      notifyError(err, "Save failed");
    }
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="xl"
      title={<Title order={4}>{isEdit ? "Edit question" : "New question"}</Title>}
    >
      {loadingDetail ? (
        <Center h={200}>
          <Loader />
        </Center>
      ) : (
        <Stack>
          <Group grow align="flex-start">
            <Select
              label="Section"
              data={sectionOptions}
              value={sectionId}
              onChange={(v) => {
                setSectionId(v);
                setSubjectId(null);
                setChapterId(null);
              }}
              searchable
              placeholder="Select section"
            />
            <Select
              label="Subject"
              data={subjectOptions}
              value={subjectId}
              onChange={(v) => {
                setSubjectId(v);
                setChapterId(null);
              }}
              searchable
              disabled={!sectionId}
              placeholder="Select subject"
            />
          </Group>
          <Group grow align="flex-start">
            <Select
              label="Chapter"
              data={chapterOptions}
              value={chapterId}
              onChange={setChapterId}
              searchable
              disabled={!subjectId}
              placeholder="Select chapter"
            />
            <Select
              label="Type"
              data={QUESTION_TYPES as unknown as { value: string; label: string }[]}
              value={type}
              onChange={(v) => setType((v as QuestionType) ?? "broad_written")}
              allowDeselect={false}
            />
          </Group>

          <Box>
            <Text size="sm" fw={500} mb={4}>
              Content
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

          {effectiveId && detail.data ? (
            <>
              <Divider label="Attachments" labelPosition="left" />
              <QuestionAssets
                questionId={effectiveId}
                assets={detail.data.assets ?? []}
              />
            </>
          ) : (
            <Text size="xs" c="dimmed">
              Save the question first to attach images.
            </Text>
          )}

          <Group justify="flex-end" mt="sm">
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
        </Stack>
      )}
    </Drawer>
  );
}
