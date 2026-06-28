// Rich text editor for question content / solution: TipTap (StarterKit + Link +
// inline KaTeX math + permissioned inline images) wrapped by @mantine/tiptap.
// Emits TipTap JSON on change; image uploads insert an assetImage node by id.
// Author: Hasif Ahmed (www.hasif.info)

import { useState } from "react";
import { RichTextEditor } from "@mantine/tiptap";
import { Button, FileButton, Group, Modal, Progress, Text, TextInput } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconMathFunction, IconPhotoPlus } from "@tabler/icons-react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { InlineMath } from "./mathExtension";
import { AssetImageNode } from "./assetImageExtension";
import { ImageCropModal } from "./ImageCropModal";
import { EMPTY_DOC, type TiptapDoc } from "./tiptapDoc";
import { useUploadAsset } from "@/api/queries/assets";
import { notifyError } from "@/lib/notify";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

interface QuestionRichTextProps {
  value: TiptapDoc | null;
  onChange: (doc: TiptapDoc) => void;
  placeholder?: string;
  minHeight?: number;
}

export function QuestionRichText({ value, onChange, minHeight = 160 }: QuestionRichTextProps) {
  const [mathOpen, setMathOpen] = useState(false);
  const [latex, setLatex] = useState("");
  // null = inserting a new equation; a number = editing the node at that position.
  const [editPos, setEditPos] = useState<number | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const upload = useUploadAsset();
  const uploading = progress !== null;
  // Inline-code and heading (H2/H3) controls are hidden on mobile only (rarely
  // used there; keeps the wrapped toolbar compact on small screens). Desktop keeps them.
  const isMobile = useMediaQuery("(max-width: 48em)");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link,
      InlineMath.configure({
        onEdit: (pos, existing) => {
          setLatex(existing);
          setEditPos(pos);
          setMathOpen(true);
        },
      }),
      AssetImageNode,
    ],
    content: value ?? EMPTY_DOC,
    onUpdate: ({ editor }) => onChange(editor.getJSON() as TiptapDoc),
  });

  const openInsertMath = () => {
    setLatex("");
    setEditPos(null);
    setMathOpen(true);
  };

  const closeMath = () => {
    setLatex("");
    setEditPos(null);
    setMathOpen(false);
  };

  const submitMath = () => {
    const next = latex.trim();
    if (editor && next) {
      if (editPos !== null) {
        editor.chain().focus().updateMath(editPos, next).run();
      } else {
        editor.chain().focus().insertMath(next).run();
      }
    }
    closeMath();
  };

  const pickImage = (file: File | null) => {
    if (!file || !editor) return;
    if (file.size > MAX_IMAGE_BYTES) {
      notifyError(new Error("Image must be 10 MB or smaller."), "Image too large");
      return;
    }
    setCropFile(file); // open the optional crop step before uploading
  };

  const uploadAndInsert = async (file: File) => {
    if (!editor) return;
    setCropFile(null);
    setProgress(0);
    try {
      const asset = await upload.mutateAsync({
        file,
        onProgress: (fraction) => setProgress(Math.round(fraction * 100)),
      });
      editor.chain().focus().insertAssetImage(asset.id).run();
    } catch (err) {
      notifyError(err, "Image upload failed");
    } finally {
      setProgress(null);
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
            {!isMobile && <RichTextEditor.Code />}
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            {!isMobile && <RichTextEditor.H2 />}
            {!isMobile && <RichTextEditor.H3 />}
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
              onClick={openInsertMath}
              aria-label="Insert math"
              title="Insert LaTeX math (double-click an equation to edit it)"
            >
              <IconMathFunction size={16} />
            </RichTextEditor.Control>
            <FileButton onChange={pickImage} accept="image/png,image/jpeg,image/webp">
              {(props) => (
                <RichTextEditor.Control
                  {...props}
                  aria-label="Insert image"
                  title="Insert image"
                  disabled={uploading}
                >
                  <IconPhotoPlus size={16} />
                </RichTextEditor.Control>
              )}
            </FileButton>
          </RichTextEditor.ControlsGroup>
        </RichTextEditor.Toolbar>

        {uploading && (
          <Group gap="xs" px="sm" py={6} wrap="nowrap" align="center">
            <Text size="xs" c="dimmed" style={{ whiteSpace: "nowrap" }}>
              Uploading image {progress}%
            </Text>
            <Progress
              value={progress ?? 0}
              size="sm"
              striped
              animated
              style={{ flex: 1 }}
              transitionDuration={150}
            />
          </Group>
        )}

        <RichTextEditor.Content style={{ minHeight }} />
      </RichTextEditor>

      <Modal
        opened={mathOpen}
        onClose={closeMath}
        title={editPos !== null ? "Edit LaTeX" : "Insert LaTeX"}
        centered
      >
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
              submitMath();
            }
          }}
          data-autofocus
        />
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={closeMath}>
            Cancel
          </Button>
          <Button onClick={submitMath}>{editPos !== null ? "Update" : "Insert"}</Button>
        </Group>
      </Modal>

      <ImageCropModal
        file={cropFile}
        onCancel={() => setCropFile(null)}
        onConfirm={uploadAndInsert}
      />
    </>
  );
}
