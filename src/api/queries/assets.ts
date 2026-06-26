// Asset upload hook.
// Author: Hasif Ahmed (www.hasif.info)

import { useMutation } from "@tanstack/react-query";
import { api } from "@/api/client";
import type { AssetOut } from "@/api/types";

export function useUploadAsset() {
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return api.post<AssetOut>("/assets/upload", { formData });
    },
  });
}
