// Confirmation dialog helper around @mantine/modals.
// Author: Hasif Ahmed (www.hasif.info)

import type { ReactNode } from "react";
import { modals } from "@mantine/modals";

interface ConfirmOptions {
  title: string;
  children: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void | Promise<void>;
}

export function confirmAction({
  title,
  children,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  onConfirm,
}: ConfirmOptions): void {
  modals.openConfirmModal({
    title,
    children,
    centered: true,
    labels: { confirm: confirmLabel, cancel: cancelLabel },
    confirmProps: danger ? { color: "red" } : undefined,
    onConfirm: () => {
      void onConfirm();
    },
  });
}
