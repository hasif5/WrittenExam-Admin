// Cascading Section / Subject / Chapter + question Type selects for the editor.
// Extracted from QuestionEditorDrawer so the drawer stays a thin composition
// root. Children never re-prompt taxonomy (D6), so this block is parent-only.
// File: src/features/question-bank/QuestionTaxonomyFields.tsx
// Author: Hasif Ahmed <xmart@live.com> (www.hasif.info)
// Created: 2026-06-27

import { Select, SimpleGrid } from "@mantine/core";
import { QUESTION_TYPES, type QuestionType } from "@/lib/constants";

interface Option {
  value: string;
  label: string;
}

interface QuestionTaxonomyFieldsProps {
  sectionId: string | null;
  subjectId: string | null;
  chapterId: string | null;
  type: QuestionType;
  sectionOptions: Option[];
  subjectOptions: Option[];
  chapterOptions: Option[];
  onSectionChange: (value: string | null) => void;
  onSubjectChange: (value: string | null) => void;
  onChapterChange: (value: string | null) => void;
  onTypeChange: (value: QuestionType) => void;
}

export function QuestionTaxonomyFields({
  sectionId,
  subjectId,
  chapterId,
  type,
  sectionOptions,
  subjectOptions,
  chapterOptions,
  onSectionChange,
  onSubjectChange,
  onChapterChange,
  onTypeChange,
}: QuestionTaxonomyFieldsProps) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm" verticalSpacing="sm">
      <Select
        label="Section"
        data={sectionOptions}
        value={sectionId}
        onChange={onSectionChange}
        searchable
        placeholder="Select section"
      />
      <Select
        label="Subject"
        data={subjectOptions}
        value={subjectId}
        onChange={onSubjectChange}
        searchable
        disabled={!sectionId}
        placeholder="Select subject"
      />
      <Select
        label="Chapter"
        data={chapterOptions}
        value={chapterId}
        onChange={onChapterChange}
        searchable
        disabled={!subjectId}
        placeholder="Select chapter"
      />
      <Select
        label="Type"
        data={QUESTION_TYPES as unknown as Option[]}
        value={type}
        onChange={(v) => onTypeChange((v as QuestionType) ?? "broad_written")}
        allowDeselect={false}
      />
    </SimpleGrid>
  );
}
