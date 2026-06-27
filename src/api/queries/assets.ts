// Asset upload hook (with real upload-progress reporting).
// Author: Hasif Ahmed (www.hasif.info)

import { useMutation } from "@tanstack/react-query";
import { uploadAssetWithProgress } from "@/api/client";
import type { AssetOut } from "@/api/types";

interface UploadArgs {
  file: File;
  onProgress?: (fraction: number) => void;
}

export function useUploadAsset() {
  return useMutation({
    mutationFn: ({ file, onProgress }: UploadArgs): Promise<AssetOut> =>
      uploadAssetWithProgress(file, onProgress),
  });
}
