// Attach + preview image assets for a question. Assets can only be attached to a
// saved question (POST /admin/questions/{id}/assets), so this is shown in edit mode.
// Author: Hasif Ahmed (www.hasif.info)

import { useState } from "react";
import { Button, Card, FileButton, Group, SimpleGrid, Stack, Text, TextInput } from "@mantine/core";
import { IconUpload } from "@tabler/icons-react";
import { AssetImage } from "@/components/AssetImage";
import { useUploadAsset } from "@/api/queries/assets";
import { useAttachQuestionAsset } from "@/api/queries/questions";
import { notifyError, notifySuccess } from "@/lib/notify";
import type { QuestionAssetOut } from "@/api/types";

export function QuestionAssets({
  questionId,
  assets,
}: {
  questionId: string;
  assets: QuestionAssetOut[];
}) {
  const upload = useUploadAsset();
  const attach = useAttachQuestionAsset();
  const [caption, setCaption] = useState("");

  const handleFile = async (file: File | null) => {
    if (!file) return;
    try {
      const asset = await upload.mutateAsync(file);
      await attach.mutateAsync({
        questionId,
        body: { asset_id: asset.id, role: "figure", caption: caption || null },
      });
      setCaption("");
      notifySuccess("Image attached.");
    } catch (err) {
      notifyError(err, "Attach failed");
    }
  };

  return (
    <Card withBorder radius="md" padding="md">
      <Text fw={600} size="sm" mb="xs">
        Images
      </Text>
      <Stack gap="sm">
        <Group align="flex-end" wrap="nowrap">
          <TextInput
            label="Caption (optional)"
            value={caption}
            onChange={(e) => setCaption(e.currentTarget.value)}
            style={{ flex: 1 }}
          />
          <FileButton onChange={handleFile} accept="image/png,image/jpeg,image/webp">
            {(props) => (
              <Button
                {...props}
                leftSection={<IconUpload size={16} />}
                loading={upload.isPending || attach.isPending}
              >
                Upload image
              </Button>
            )}
          </FileButton>
        </Group>

        {assets.length === 0 ? (
          <Text size="sm" c="dimmed">
            No images attached.
          </Text>
        ) : (
          <SimpleGrid cols={{ base: 2, sm: 3 }}>
            {assets.map((a) => (
              <Stack key={a.id} gap={4}>
                <AssetImage assetId={a.asset_id} height={120} />
                {a.caption && (
                  <Text size="xs" c="dimmed" lineClamp={1}>
                    {a.caption}
                  </Text>
                )}
              </Stack>
            ))}
          </SimpleGrid>
        )}
      </Stack>
    </Card>
  );
}
