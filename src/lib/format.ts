// Formatting helpers.
// Author: Hasif Ahmed (www.hasif.info)

import dayjs from "dayjs";

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "-";
  const d = dayjs(value);
  return d.isValid() ? d.format("DD MMM YYYY, HH:mm") : "-";
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
