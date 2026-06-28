// Inline LaTeX math node for TipTap. The raw LaTeX is stored verbatim in the node
// attribute (so it round-trips into the TipTap JSON saved as JSONB) and rendered
// with KaTeX in the editor and previews. Double-clicking a rendered equation calls
// the `onEdit` option so the host can reopen its editor pre-filled for in-place edit.
// Author: Hasif Ahmed (www.hasif.info)

import { Node, mergeAttributes } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import katex from "katex";

function renderLatex(latex: string): string {
  try {
    return katex.renderToString(latex, { throwOnError: false, displayMode: false });
  } catch {
    return latex;
  }
}

function MathNodeView({ node, getPos, extension }: NodeViewProps) {
  const latex = (node.attrs.latex as string) || "";
  const onEdit = (extension.options as InlineMathOptions).onEdit;

  const handleEdit = () => {
    if (!onEdit || typeof getPos !== "function") return;
    const pos = getPos();
    if (typeof pos === "number") onEdit(pos, latex);
  };

  return (
    <NodeViewWrapper
      as="span"
      className="inline-math"
      style={{ display: "inline-block", cursor: onEdit ? "pointer" : "default" }}
    >
      <span
        contentEditable={false}
        title={onEdit ? `${latex}  (double-click to edit)` : latex}
        onDoubleClick={handleEdit}
        dangerouslySetInnerHTML={{ __html: renderLatex(latex) }}
      />
    </NodeViewWrapper>
  );
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    inlineMath: {
      insertMath: (latex: string) => ReturnType;
      updateMath: (pos: number, latex: string) => ReturnType;
    };
  }
}

export interface InlineMathOptions {
  // Called when a rendered equation is double-clicked, with its document position
  // and current LaTeX so the host can reopen its editor in edit mode.
  onEdit?: (pos: number, latex: string) => void;
}

export const InlineMath = Node.create<InlineMathOptions>({
  name: "inlineMath",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,

  addOptions() {
    return { onEdit: undefined };
  },

  addAttributes() {
    return {
      latex: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-latex") ?? "",
        renderHTML: (attributes) => ({ "data-latex": attributes.latex as string }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-latex]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathNodeView);
  },

  addCommands() {
    return {
      insertMath:
        (latex: string) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: { latex } }),
      updateMath:
        (pos: number, latex: string) =>
        ({ tr, dispatch }) => {
          if (dispatch) tr.setNodeAttribute(pos, "latex", latex);
          return true;
        },
    };
  },
});
