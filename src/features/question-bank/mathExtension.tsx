// Inline LaTeX math node for TipTap. The raw LaTeX is stored verbatim in the node
// attribute (so it round-trips into the TipTap JSON saved as JSONB) and rendered
// with KaTeX in the editor and previews.
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

function MathNodeView({ node }: NodeViewProps) {
  const latex = (node.attrs.latex as string) || "";
  return (
    <NodeViewWrapper as="span" className="inline-math" style={{ display: "inline-block" }}>
      <span
        contentEditable={false}
        title={latex}
        dangerouslySetInnerHTML={{ __html: renderLatex(latex) }}
      />
    </NodeViewWrapper>
  );
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    inlineMath: {
      insertMath: (latex: string) => ReturnType;
    };
  }
}

export const InlineMath = Node.create({
  name: "inlineMath",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,

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
    };
  },
});
