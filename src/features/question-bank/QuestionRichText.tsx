// Rich text editor for question content / solution: TipTap (StarterKit + Link +
// inline KaTeX math + permissioned inline images) wrapped by @mantine/tiptap.
// Emits TipTap JSON on change; image uploads insert an assetImage node by id.
// Author: Hasif Ahmed (www.hasif.info)

import { useState } from "react";
import { RichTextEditor } from "@mantine/tiptap";
import { Button, FileButton, Group, Modal, Text, TextInput } from "@mantine/core";
import { IconMathFunction, IconPhotoPlus } from "@tabler/icons-react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { InlineMath } from "./mathExtension";
import { AssetImageNode } from "./assetImageExtension";
import { EMPTY_DOC, type TiptapDoc } from "./tiptapDoc";
import { useUploadAsset } from "@/api/queries/assets";
import { notifyError } from "@/lib/notify";

interface QuestionRichTextProps {
  value: TiptapDoc | null;
  onChange: (doc: TiptapDoc) => void;
  placeholder?: string;
  minHeight?: number;
}

export function QuestionRichText({ value, onChange, minHeight = 160 }: QuestionRichTextProps) {
  const [mathOpen, setMathOpen] = useState(false);
  const [latex, setLatex] = useState("");
  const upload = useUploadAsset();

  const editor = useEditor({
    extensions: [StarterKit, Link, InlineMath, AssetImageNode],
    content: value ?? EMPTY_DOC,
    onUpdate: ({ editor }) => onChange(editor.getJSON() as TiptapDoc),
  });

  const insertMath = () => {
    if (editor && latex.trim()) {
      editor.chain().focus().insertMath(latex.trim()).run();
    }
    setLatex("");
    setMathOpen(false);
  };

  const handleImage = async (file: File | null) => {
    if (!file || !editor) return;
    try {
      const asset = await upload.mutateAsync(file);
      editor.chain().focus().insertAssetImage(asset.id).run();
    } catch (err) {
      notifyError(err, "Image upload failed");
    }
  };

  return (
    <>
      <RichTextEditor editor={editor}>
        <RichTextEditor.Toolbar sticky stickyOffset={56}>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Bold />
            <RichTextEditor.Italic />
            <RichTextEditor.Underline />
            <RichTextEditor.Strikethrough />
            <RichTextEditor.Code />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.H2 />
            <RichTextEditor.H3 />
            <RichTextEditor.BulletList />
            <RichTextEditor.OrderedList />
            <RichTextEditor.Blockquote />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Link />
            <RichTextEditor.Unlink />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Control
              onClick={() => setMathOpen(true)}
              aria-label="Insert math"
              title="Insert LaTeX math"
            >
              <IconMathFunction size={16} />
            </RichTextEditor.Control>
            <FileButton onChange={handleImage} accept="image/png,image/jpeg,image/webp">
              {(props) => (
                <RichTextEditor.Control
                  {...props}
                  aria-label="Insert image"
                  title="Insert image"
                  disabled={upload.isPending}
                >
                  <IconPhotoPlus size={16} />
                </RichTextEditor.Control>
              )}
            </FileButton>
          </RichTextEditor.ControlsGroup>
        </RichTextEditor.Toolbar>

        <RichTextEditor.Content style={{ minHeight }} />
      </RichTextEditor>

      <Modal opened={mathOpen} onClose={() => setMathOpen(false)} title="Insert LaTeX" centered>
        <Text size="sm" c="dimmed" mb="xs">
          Enter LaTeX source (rendered with KaTeX). Example: <code>x^2 + y^2 = z^2</code>
        </Text>
        <TextInput
          value={latex}
          onChange={(e) => setLatex(e.currentTarget.value)}
          placeholder="\\frac{a}{b}"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              insertMath();
            }
          }}
          data-autofocus
        />
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={() => setMathOpen(false)}>
            Cancel
          </Button>
          <Button onClick={insertMath}>Insert</Button>
        </Group>
      </Modal>
    </>
  );
}
