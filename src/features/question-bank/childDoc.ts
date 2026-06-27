// Child-question draft model + immutable helpers for the passage editor.
// A ChildDraft carries a stable localId (React key / editor remount), an
// optional questionId once the child is persisted (enables image attach, D7),
// and its own content / solution TipTap docs. Children inherit the parent's
// taxonomy server-side (D6), so no section/subject/chapter lives here.
// File: src/features/question-bank/childDoc.ts
// Author: Hasif Ahmed <xmart@live.com> (www.hasif.info)
// Created: 2026-06-27

import { EMPTY_DOC, type TiptapDoc } from "./tiptapDoc";
import type { QuestionOut } from "@/api/types";

export interface ChildDraft {
  localId: string;
  questionId?: string;
  content: TiptapDoc;
  solution: TiptapDoc;
  solutionError: string | null;
  display_order: number;
}

export function makeEmptyChild(displayOrder: number): ChildDraft {
  return {
    localId: crypto.randomUUID(),
    content: EMPTY_DOC,
    solution: EMPTY_DOC,
    solutionError: null,
    display_order: displayOrder,
  };
}

/** Build drafts from a loaded passage's children (ordered by the server). */
export function childrenToDrafts(children: QuestionOut[] | undefined): ChildDraft[] {
  return (children ?? []).map((c, index) => ({
    localId: crypto.randomUUID(),
    questionId: c.id,
    content: (c.content as TiptapDoc) ?? EMPTY_DOC,
    solution: (c.solution as TiptapDoc) ?? EMPTY_DOC,
    solutionError: null,
    display_order: c.display_order ?? index,
  }));
}

/** Move a child up (-1) or down (+1), carrying the whole object (and localId). */
export function moveChild(list: ChildDraft[], index: number, dir: -1 | 1): ChildDraft[] {
  const target = index + dir;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
