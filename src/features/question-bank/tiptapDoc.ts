// Helpers for working with TipTap document JSON.
// Author: Hasif Ahmed (www.hasif.info)

export type TiptapDoc = Record<string, unknown>;

interface TiptapNode {
  type?: string;
  text?: string;
  attrs?: { latex?: string; assetId?: string };
  content?: TiptapNode[];
}

/** Flatten a TipTap doc to plain text (math nodes contribute their LaTeX source). */
export function docToPlainText(doc: unknown): string {
  if (!doc || typeof doc !== "object") return "";
  const parts: string[] = [];
  const walk = (node: TiptapNode) => {
    if (node.type === "inlineMath" && node.attrs?.latex) {
      parts.push(node.attrs.latex);
    }
    if (typeof node.text === "string") parts.push(node.text);
    if (Array.isArray(node.content)) node.content.forEach(walk);
  };
  walk(doc as TiptapNode);
  return parts.join(" ").trim();
}

/** A doc is "empty" if it has no text, math, or image content. */
export function isDocEmpty(doc: unknown): boolean {
  if (!doc || typeof doc !== "object") return true;
  if (docToPlainText(doc).length > 0) return false;
  // Account for image-only documents (still meaningful content). `assetImage`
  // is the permissioned inline image node the editor emits.
  let hasImage = false;
  const walk = (node: TiptapNode) => {
    if (node.type === "image" || (node.type === "assetImage" && node.attrs?.assetId)) {
      hasImage = true;
    }
    if (Array.isArray(node.content)) node.content.forEach(walk);
  };
  walk(doc as TiptapNode);
  return !hasImage;
}

export const EMPTY_DOC: TiptapDoc = { type: "doc", content: [{ type: "paragraph" }] };
