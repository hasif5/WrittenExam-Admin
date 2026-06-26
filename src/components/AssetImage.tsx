// Renders a permissioned asset: GET /assets/{id} requires the Authorization
// header, so the bytes are fetched via the typed client and shown as an object URL.
// Author: Hasif Ahmed (www.hasif.info)

import { useEffect, useState } from "react";
import { Center, Image, Loader, Stack, Text } from "@mantine/core";
import { IconPhotoOff } from "@tabler/icons-react";
import { fetchAssetBlob } from "@/api/client";
import { errorMessage } from "@/lib/errors";

interface AssetImageProps {
  assetId: string | null | undefined;
  alt?: string;
  height?: number | string;
  width?: number | string;
  radius?: string;
  fit?: "contain" | "cover";
}

export function AssetImage({
  assetId,
  alt = "asset",
  height = 200,
  width,
  radius = "sm",
  fit = "contain",
}: AssetImageProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!assetId) {
      setUrl(null);
      setError(null);
      return;
    }
    let revoked: string | null = null;
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetchAssetBlob(assetId, controller.signal)
      .then((blob) => {
        const objectUrl = URL.createObjectURL(blob);
        revoked = objectUrl;
        setUrl(objectUrl);
      })
      .catch((err) => {
        if (!controller.signal.aborted) setError(errorMessage(err));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => {
      controller.abort();
      if (revoked) URL.revokeObjectURL(revoked);
    };
  }, [assetId]);

  if (!assetId) {
    return (
      <Center h={height} bg="var(--mantine-color-default-hover)" style={{ borderRadius: 8 }}>
        <Stack align="center" gap={4}>
          <IconPhotoOff size={28} color="var(--mantine-color-dimmed)" />
          <Text size="xs" c="dimmed">
            No image
          </Text>
        </Stack>
      </Center>
    );
  }

  if (loading) {
    return (
      <Center h={height}>
        <Loader size="sm" />
      </Center>
    );
  }

  if (error) {
    return (
      <Center h={height} bg="var(--mantine-color-red-light)" style={{ borderRadius: 8 }}>
        <Text size="xs" c="var(--mantine-color-red-light-color)">
          {error}
        </Text>
      </Center>
    );
  }

  return (
    <Image
      src={url ?? undefined}
      alt={alt}
      h={height}
      w={width}
      radius={radius}
      fit={fit}
    />
  );
}
