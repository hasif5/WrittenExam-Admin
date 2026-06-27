// Permissioned inline image node for TipTap. Stores only the asset id in the node
// attribute (so it round-trips into the TipTap JSON saved as JSONB); the bytes are
// fetched authenticated and rendered via AssetImage. The backend reconciles these
// ids into the question_bank_assets junction, so content is the single source of
// truth for a question's images (no separate attachment grid).
// File: src/features/question-bank/assetImageExtension.tsx
// Author: Hasif Ahmed <xmart@live.com> (www.hasif.info)
// Created: 2026-06-27

import { Node, mergeAttributes } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { ActionIcon, Box } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { AssetImage } from "@/components/AssetImage";

function AssetImageNodeView({ node, deleteNode, editor }: NodeViewProps) {
  const assetId = (node.attrs.assetId as string) || null;
  return (
    <NodeViewWrapper className="asset-image" data-drag-handle>
      <Box
        contentEditable={false}
        style={{ position: "relative", display: "inline-block", maxWidth: "100%" }}
      >
        <AssetImage assetId={assetId} height={220} radius="sm" />
        {editor.isEditable && (
          <ActionIcon
            variant="filled"
            color="red"
            size="sm"
            aria-label="Remove image"
            onClick={() => deleteNode()}
            style={{ position: "absolute", top: 6, right: 6 }}
          >
            <IconTrash size={14} />
          </ActionIcon>
        )}
      </Box>
    </NodeViewWrapper>
  );
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    assetImage: {
      insertAssetImage: (assetId: string) => ReturnType;
    };
  }
}

export const AssetImageNode = Node.create({
  name: "assetImage",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      assetId: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-asset-id") ?? "",
        renderHTML: (attributes) => ({ "data-asset-id": attributes.assetId as string }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-asset-id]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { class: "asset-image" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(AssetImageNodeView);
  },

  addCommands() {
    return {
      insertAssetImage:
        (assetId: string) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: { assetId } }),
    };
  },
});
