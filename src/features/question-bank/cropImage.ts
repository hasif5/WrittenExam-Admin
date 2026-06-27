// Canvas helper that turns a crop rectangle (in source pixels, from
// react-easy-crop's onCropComplete) into a cropped image File ready to upload.
// Output mime is constrained to the backend's allowed image types.
// File: src/features/question-bank/cropImage.ts
// Author: Hasif Ahmed <xmart@live.com> (www.hasif.info)
// Created: 2026-06-27

export interface PixelArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

const ALLOWED_OUTPUT = new Set(["image/png", "image/webp", "image/jpeg"]);

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load the image for cropping."));
    img.src = src;
  });
}

export async function getCroppedFile(
  file: File,
  src: string,
  area: PixelArea,
): Promise<File> {
  const image = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(area.width));
  canvas.height = Math.max(1, Math.round(area.height));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");

  ctx.drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    canvas.width,
    canvas.height,
  );

  const type = ALLOWED_OUTPUT.has(file.type) ? file.type : "image/jpeg";
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, type, 0.92),
  );
  if (!blob) throw new Error("Could not produce the cropped image.");
  return new File([blob], file.name, { type });
}
