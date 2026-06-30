// Question Bank: filterable list (section/subject/chapter/type + keyword) with
// create/edit drawer, usage view, and soft-delete.
// Author: Hasif Ahmed (www.hasif.info)

import { useMemo, useState } from "react";
import { ActionIcon, Badge, Button, Menu, Select, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconDotsVertical,
  IconEdit,
  IconEye,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import type { MRT_ColumnDef } from "mantine-react-table";
import { PageHero } from "@/components/PageHero";
import { HEROES } from "@/assets/heroes";
import { DataTable } from "@/components/DataTable";
import { usePagination } from "@/lib/usePagination";
import { useSections, useSubjects, useChapters } from "@/api/queries/taxonomy";
import { useDeleteQuestion, useQuestions } from "@/api/queries/questions";
import { QUESTION_TYPES, type QuestionType } from "@/lib/constants";
import { useAuth } from "@/auth/useAuth";
import { confirmAction } from "@/lib/confirm";
import { notifyError, notifySuccess } from "@/lib/notify";
import type { QuestionOut } from "@/api/types";
import { docToPlainText } from "./tiptapDoc";
import { QuestionEditorDrawer } from "./QuestionEditorDrawer";
import { QuestionUsageModal } from "./QuestionUsageModal";

function typeLabel(type: string): string {
  return QUESTION_TYPES.find((t) => t.value === type)?.label ?? type;
}

export function QuestionBankPage() {
  const { can } = useAuth();
  const canWrite = can("question_bank.write");
  const { pagination, setPagination, limit, offset } = usePagination();
  const [sectionId, setSectionId] = useState<string | null>(null);
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [chapterId, setChapterId] = useState<string | null>(null);
  const [type, setType] = useState<QuestionType | undefined>(undefined);
  const [keyword, setKeyword] = useState("");

  const [drawerOpened, drawerHandlers] = useDisclosure(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [usageId, setUsageId] = useState<string | null>(null);

  const sections = useSections(true);
  const subjects = useSubjects(sectionId ?? undefined);
  const chapters = useChapters(subjectId ?? undefined);
  const deleteQuestion = useDeleteQuestion();

  const query = useQuestions({
    section_id: sectionId ?? undefined,
    subject_id: subjectId ?? undefined,
    chapter_id: chapterId ?? undefined,
    type,
    q: keyword || undefined,
    limit,
    offset,
  });

  const resetPage = () => setPagination((p) => ({ ...p, pageIndex: 0 }));

  const sectionNameById = useMemo(() => {
    const map = new Map<string, string>();
    (sections.data ?? []).forEach((s) => map.set(s.id, s.name));
    return map;
  }, [sections.data]);

  const openCreate = () => {
    setEditId(null);
    drawerHandlers.open();
  };
  const openEdit = (id: string) => {
    setEditId(id);
    drawerHandlers.open();
  };

  const onDelete = (q: QuestionOut) =>
    confirmAction({
      title: "Delete question",
      danger: true,
      children: "Soft-delete this question? It is blocked if referenced by a quiz.",
      confirmLabel: "Delete",
      onConfirm: async () => {
        try {
          await deleteQuestion.mutateAsync(q.id);
          notifySuccess("Question deleted.");
        } catch (err) {
          notifyError(err, "Delete blocked");
        }
      },
    });

  const columns = useMemo<MRT_ColumnDef<QuestionOut>[]>(
    () => [
      {
        id: "content",
        header: "Question",
        Cell: ({ row }) => (
          <Text size="sm" lineClamp={2} maw={420}>
            {docToPlainText(row.original.content) || <Text span c="dimmed">(no text)</Text>}
          </Text>
        ),
      },
      {
        accessorKey: "type",
        header: "Type",
        size: 170,
        Cell: ({ row }) => (
          <Badge variant="light" color="grape">
            {typeLabel(row.original.type)}
          </Badge>
        ),
      },
      {
        id: "section",
        header: "Section",
        size: 150,
        Cell: ({ row }) => sectionNameById.get(row.original.section_id) ?? "-",
      },
      {
        id: "children",
        header: "Children",
        size: 90,
        Cell: ({ row }) => row.original.children?.length ?? 0,
      },
      {
        id: "images",
        header: "Images",
        size: 90,
        Cell: ({ row }) => row.original.assets?.length ?? 0,
      },
    ],
    [sectionNameById],
  );

  return (
    <>
      <PageHero
        image={HEROES.questions}
        title="Question Bank"
        description="Author questions with rich text and LaTeX. A non-empty solution is mandatory."
        actions={
          canWrite ? (
            <Button leftSection={<IconPlus size={16} />} onClick={openCreate}>
              New question
            </Button>
          ) : undefined
        }
      />

      <DataTable<QuestionOut>
        columns={columns}
        data={query.data?.items ?? []}
        rowCount={query.data?.total ?? 0}
        pagination={pagination}
        onPaginationChange={setPagination}
        isLoading={query.isLoading}
        isFetching={query.isFetching}
        isError={query.isError}
        error={query.error}
        enableGlobalFilter
        globalFilter={keyword}
        onGlobalFilterChange={(v) => {
          setKeyword(v);
          resetPage();
        }}
        searchPlaceholder="Keyword (question + solution)"
        filters={
          <>
            <Select
              placeholder="All sections"
              data={(sections.data ?? []).map((s) => ({ value: s.id, label: s.name }))}
              value={sectionId}
              onChange={(v) => {
                setSectionId(v);
                setSubjectId(null);
                setChapterId(null);
                resetPage();
              }}
              clearable
              searchable
              w={180}
            />
            <Select
              placeholder="All subjects"
              data={(subjects.data ?? []).map((s) => ({ value: s.id, label: s.name }))}
              value={subjectId}
              onChange={(v) => {
                setSubjectId(v);
                setChapterId(null);
                resetPage();
              }}
              clearable
              searchable
              disabled={!sectionId}
              w={180}
            />
            <Select
              placeholder="All chapters"
              data={(chapters.data ?? []).map((c) => ({ value: c.id, label: c.name }))}
              value={chapterId}
              onChange={(v) => {
                setChapterId(v);
                resetPage();
              }}
              clearable
              searchable
              disabled={!subjectId}
              w={180}
            />
            <Select
              placeholder="All types"
              data={QUESTION_TYPES as unknown as { value: string; label: string }[]}
              value={type ?? null}
              onChange={(v) => {
                setType((v as QuestionType) || undefined);
                resetPage();
              }}
              clearable
              w={160}
            />
          </>
        }
        enableExpanding
        getSubRows={(row) => row.children}
        enableRowActions
        renderRowActions={({ row }) => (
          <Menu shadow="md" position="bottom-end" withinPortal>
            <Menu.Target>
              <ActionIcon variant="subtle">
                <IconDotsVertical size={18} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              {canWrite && (
                <Menu.Item leftSection={<IconEdit size={16} />} onClick={() => openEdit(row.original.id)}>
                  Edit
                </Menu.Item>
              )}
              <Menu.Item leftSection={<IconEye size={16} />} onClick={() => setUsageId(row.original.id)}>
                View usage
              </Menu.Item>
              {canWrite && (
                <>
                  <Menu.Divider />
                  <Menu.Item
                    color="red"
                    leftSection={<IconTrash size={16} />}
                    onClick={() => onDelete(row.original)}
                  >
                    Delete
                  </Menu.Item>
                </>
              )}
            </Menu.Dropdown>
          </Menu>
        )}
      />

      <QuestionEditorDrawer
        opened={drawerOpened}
        questionId={editId}
        onClose={drawerHandlers.close}
      />
      <QuestionUsageModal questionId={usageId} onClose={() => setUsageId(null)} />
    </>
  );
}
