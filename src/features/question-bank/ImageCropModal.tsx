// Optional crop step before an image is uploaded/inserted. Wraps react-easy-crop
// (drag/zoom, touch-friendly) with aspect presets; "Use original" skips cropping.
// Shared by all four rich-text fields via QuestionRichText.
// File: src/features/question-bank/ImageCropModal.tsx
// Author: Hasif Ahmed <xmart@live.com> (www.hasif.info)
// Created: 2026-06-27

import { useEffect, useState } from "react";
import Cropper from "react-easy-crop";
import type { Area, MediaSize } from "react-easy-crop";
import { Box, Button, Group, Modal, SegmentedControl, Slider, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { getCroppedFile, type PixelArea } from "./cropImage";
import { notifyError } from "@/lib/notify";

const ASPECTS: Record<string, number | null> = {
  Original: null,
  "1:1": 1,
  "4:3": 4 / 3,
  "3:4": 3 / 4,
  "16:9": 16 / 9,
};

interface ImageCropModalProps {
  file: File | null;
  onCancel: () => void;
  onConfirm: (file: File) => void;
}

export function ImageCropModal({ file, onCancel, onConfirm }: ImageCropModalProps) {
  const isMobile = useMediaQuery("(max-width: 48em)");
  const [src, setSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [preset, setPreset] = useState("Original");
  const [naturalAspect, setNaturalAspect] = useState<number | undefined>(undefined);
  const [pixels, setPixels] = useState<PixelArea | null>(null);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    if (!file) {
      setSrc(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setSrc(url);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setPreset("Original");
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const aspect = ASPECTS[preset] ?? naturalAspect;

  const onMediaLoaded = (media: MediaSize) =>
    setNaturalAspect(media.naturalWidth / media.naturalHeight);

  const confirmCrop = async () => {
    if (!file || !src || !pixels) return;
    setWorking(true);
    try {
      onConfirm(await getCroppedFile(file, src, pixels));
    } catch (err) {
      notifyError(err, "Crop failed");
    } finally {
      setWorking(false);
    }
  };

  return (
    <Modal
      opened={Boolean(file)}
      onClose={onCancel}
      title={
        <Text component="span" fw={600} fz="lg">
          Crop image
        </Text>
      }
      size="lg"
      fullScreen={isMobile}
      centered
    >
      <Box pos="relative" h={isMobile ? 300 : 360} bg="dark.6" style={{ borderRadius: 8 }}>
        {src && (
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_area: Area, areaPixels: Area) => setPixels(areaPixels)}
            onMediaLoaded={onMediaLoaded}
          />
        )}
      </Box>

      <Group justify="space-between" mt="md" gap="sm" wrap="wrap">
        <SegmentedControl
          size="xs"
          value={preset}
          onChange={setPreset}
          data={Object.keys(ASPECTS)}
        />
        <Box style={{ flex: 1, minWidth: 160 }}>
          <Text size="xs" c="dimmed" mb={2}>
            Zoom
          </Text>
          <Slider min={1} max={3} step={0.05} value={zoom} onChange={setZoom} label={null} />
        </Box>
      </Group>

      <Group justify="flex-end" mt="lg" gap="sm">
        <Button variant="default" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="light" onClick={() => file && onConfirm(file)}>
          Use original
        </Button>
        <Button onClick={confirmCrop} loading={working} disabled={!pixels}>
          Crop &amp; insert
        </Button>
      </Group>
    </Modal>
  );
}
