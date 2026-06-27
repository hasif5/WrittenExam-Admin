// Taxonomy management: Section -> Subject -> Chapter columns with CRUD, activate/
// deactivate, display order, section usage, and reference-guarded deletes.
// Author: Hasif Ahmed (www.hasif.info)

import { useState } from "react";
import { Grid } from "@mantine/core";
import { PageHero } from "@/components/PageHero";
import { HEROES } from "@/assets/heroes";
import { confirmAction } from "@/lib/confirm";
import { notifyError, notifySuccess } from "@/lib/notify";
import {
  useChapters,
  useCreateChapter,
  useCreateSection,
  useCreateSubject,
  useDeleteChapter,
  useDeleteSection,
  useDeleteSubject,
  useReorderChapters,
  useReorderSections,
  useReorderSubjects,
  useSections,
  useSubjects,
  useUpdateChapter,
  useUpdateSection,
  useUpdateSubject,
} from "@/api/queries/taxonomy";
import { TaxonomyColumn, type TaxonomyNode } from "./TaxonomyColumn";
import { EditTaxonomyModal, type EditableNode } from "./EditTaxonomyModal";
import { SectionUsageModal } from "./SectionUsageModal";

type Kind = "section" | "subject" | "chapter";

export function TaxonomyPage() {
  const [sectionId, setSectionId] = useState<string | null>(null);
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ kind: Kind; node: EditableNode } | null>(null);
  const [usageSectionId, setUsageSectionId] = useState<string | null>(null);

  const sections = useSections(true);
  const subjects = useSubjects(sectionId ?? undefined);
  const chapters = useChapters(subjectId ?? undefined);

  const createSection = useCreateSection();
  const updateSection = useUpdateSection();
  const deleteSection = useDeleteSection();
  const createSubject = useCreateSubject();
  const updateSubject = useUpdateSubject();
  const deleteSubject = useDeleteSubject();
  const createChapter = useCreateChapter();
  const updateChapter = useUpdateChapter();
  const deleteChapter = useDeleteChapter();
  const reorderSections = useReorderSections();
  const reorderSubjects = useReorderSubjects();
  const reorderChapters = useReorderChapters();

  const toNodes = (items: TaxonomyNode[] | undefined) => items ?? [];

  const persistReorder = async (run: () => Promise<unknown>) => {
    try {
      await run();
      notifySuccess("Order updated.");
    } catch (err) {
      notifyError(err, "Reorder failed");
    }
  };

  const confirmDelete = (kind: Kind, node: TaxonomyNode, run: () => Promise<unknown>) =>
    confirmAction({
      title: `Delete ${kind}`,
      danger: true,
      children: `Delete "${node.name}"? This is a soft delete and is blocked if the ${kind} is still referenced.`,
      confirmLabel: "Delete",
      onConfirm: async () => {
        try {
          await run();
          notifySuccess(`${kind[0].toUpperCase()}${kind.slice(1)} deleted.`);
        } catch (err) {
          notifyError(err, "Delete blocked");
        }
      },
    });

  const saveEdit = async (data: { name: string; is_active: boolean }) => {
    if (!editing) return;
    try {
      if (editing.kind === "section") {
        await updateSection.mutateAsync({ id: editing.node.id, body: data });
      } else if (editing.kind === "subject") {
        await updateSubject.mutateAsync({ id: editing.node.id, body: data });
      } else {
        await updateChapter.mutateAsync({ id: editing.node.id, body: data });
      }
      notifySuccess("Saved.");
      setEditing(null);
    } catch (err) {
      notifyError(err, "Save failed");
    }
  };

  const toggleActive = async (kind: Kind, node: TaxonomyNode) => {
    const body = { is_active: !node.is_active };
    try {
      if (kind === "section") await updateSection.mutateAsync({ id: node.id, body });
      else if (kind === "subject") await updateSubject.mutateAsync({ id: node.id, body });
      else await updateChapter.mutateAsync({ id: node.id, body });
      notifySuccess(node.is_active ? "Deactivated." : "Activated.");
    } catch (err) {
      notifyError(err, "Update failed");
    }
  };

  return (
    <>
      <PageHero
        image={HEROES.taxonomy}
        title="Taxonomy"
        description="Shared Section -> Subject -> Chapter hierarchy used by the Question Bank (and future courses)."
      />

      <Grid>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <TaxonomyColumn
            title="Sections"
            withCode
            nodes={toNodes(sections.data)}
            isLoading={sections.isLoading}
            isError={sections.isError}
            error={sections.error}
            onRetry={() => sections.refetch()}
            selectable
            selectedId={sectionId}
            onSelect={(id) => {
              setSectionId(id);
              setSubjectId(null);
            }}
            creating={createSection.isPending}
            onCreate={async ({ name, code }) => {
              try {
                await createSection.mutateAsync({ code: code ?? "", name, display_order: 0 });
                notifySuccess("Section created.");
              } catch (err) {
                notifyError(err, "Create failed");
              }
            }}
            onEdit={(node) => setEditing({ kind: "section", node })}
            onToggleActive={(node) => toggleActive("section", node)}
            onDelete={(node) =>
              confirmDelete("section", node, () => deleteSection.mutateAsync(node.id))
            }
            onUsage={(node) => setUsageSectionId(node.id)}
            onReorder={(orderedIds) =>
              persistReorder(() => reorderSections.mutateAsync(orderedIds))
            }
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <TaxonomyColumn
            title="Subjects"
            nodes={toNodes(subjects.data)}
            isLoading={subjects.isLoading}
            isError={subjects.isError}
            error={subjects.error}
            onRetry={() => subjects.refetch()}
            selectable
            selectedId={subjectId}
            onSelect={(id) => setSubjectId(id)}
            disabled={!sectionId}
            disabledHint="Select a section to manage its subjects."
            creating={createSubject.isPending}
            onCreate={async ({ name }) => {
              if (!sectionId) return;
              try {
                await createSubject.mutateAsync({
                  section_id: sectionId,
                  name,
                  display_order: 0,
                });
                notifySuccess("Subject created.");
              } catch (err) {
                notifyError(err, "Create failed");
              }
            }}
            onEdit={(node) => setEditing({ kind: "subject", node })}
            onToggleActive={(node) => toggleActive("subject", node)}
            onDelete={(node) =>
              confirmDelete("subject", node, () => deleteSubject.mutateAsync(node.id))
            }
            onReorder={(orderedIds) =>
              sectionId &&
              persistReorder(() => reorderSubjects.mutateAsync({ sectionId, orderedIds }))
            }
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <TaxonomyColumn
            title="Chapters"
            nodes={toNodes(chapters.data)}
            isLoading={chapters.isLoading}
            isError={chapters.isError}
            error={chapters.error}
            onRetry={() => chapters.refetch()}
            disabled={!subjectId}
            disabledHint="Select a subject to manage its chapters."
            creating={createChapter.isPending}
            onCreate={async ({ name }) => {
              if (!subjectId) return;
              try {
                await createChapter.mutateAsync({
                  subject_id: subjectId,
                  name,
                  display_order: 0,
                });
                notifySuccess("Chapter created.");
              } catch (err) {
                notifyError(err, "Create failed");
              }
            }}
            onEdit={(node) => setEditing({ kind: "chapter", node })}
            onToggleActive={(node) => toggleActive("chapter", node)}
            onDelete={(node) =>
              confirmDelete("chapter", node, () => deleteChapter.mutateAsync(node.id))
            }
            onReorder={(orderedIds) =>
              subjectId &&
              persistReorder(() => reorderChapters.mutateAsync({ subjectId, orderedIds }))
            }
          />
        </Grid.Col>
      </Grid>

      <EditTaxonomyModal
        node={editing?.node ?? null}
        title={editing ? `Edit ${editing.kind}` : "Edit"}
        saving={updateSection.isPending || updateSubject.isPending || updateChapter.isPending}
        onClose={() => setEditing(null)}
        onSave={saveEdit}
      />
      <SectionUsageModal sectionId={usageSectionId} onClose={() => setUsageSectionId(null)} />
    </>
  );
}
