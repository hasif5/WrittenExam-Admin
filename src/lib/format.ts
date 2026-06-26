// Formatting helpers.
// Author: Hasif Ahmed (www.hasif.info)

import dayjs from "dayjs";

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "-";
  const d = dayjs(value);
  return d.isValid() ? d.format("DD MMM YYYY, HH:mm") : "-";
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "-";
  const d = dayjs(value);
  return d.isValid() ? d.format("DD MMM YYYY") : "-";
}

export function relativeDaysFrom(value: string | null | undefined): string {
  if (!value) return "-";
  const target = dayjs(value);
  if (!target.isValid()) return "-";
  const days = target.diff(dayjs(), "day");
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "today";
  return `in ${days}d`;
}

export function formatBytes(bytes: number | null | undefined): string {
  if (bytes == null) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function shortId(id: string | null | undefined): string {
  if (!id) return "-";
  return id.slice(0, 8);
}
