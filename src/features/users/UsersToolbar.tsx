// Friendly filter controls for the Users tables: a Status select (Active /
// Inactive / Pending deletion) and a Joined preset select. Passed to DataTable's
// `filters` slot, replacing MRT's free-text column filter inputs with explicit,
// server-wired choices.
// File: src/features/users/UsersToolbar.tsx
// Author: Hasif Ahmed <xmart@live.com> (www.hasif.info)
// Created: 2026-06-29

import { Group, Select } from "@mantine/core";
import { IconCalendarEvent, IconFilter } from "@tabler/icons-react";
import dayjs from "dayjs";

export type UserStatusFilter = "active" | "inactive" | "pending_deletion";
export type JoinedPreset = "any" | "7d" | "30d" | "90d" | "year";

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "pending_deletion", label: "Pending deletion" },
];

const JOINED_OPTIONS: { value: JoinedPreset; label: string }[] = [
  { value: "any", label: "Any time" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "year", label: "Last 12 months" },
];

// Maps a joined preset to the ISO instant passed to the API (undefined = no bound).
export function joinedAfterFromPreset(preset: JoinedPreset): string | undefined {
  switch (preset) {
    case "7d":
      return dayjs().subtract(7, "day").toISOString();
    case "30d":
      return dayjs().subtract(30, "day").toISOString();
    case "90d":
      return dayjs().subtract(90, "day").toISOString();
    case "year":
      return dayjs().subtract(12, "month").toISOString();
    default:
      return undefined;
  }
}

interface UsersToolbarProps {
  status: UserStatusFilter | null;
  onStatusChange: (value: UserStatusFilter | null) => void;
  joined: JoinedPreset;
  onJoinedChange: (value: JoinedPreset) => void;
}

export function UsersToolbar({
  status,
  onStatusChange,
  joined,
  onJoinedChange,
}: UsersToolbarProps) {
  return (
    <Group gap="sm" wrap="wrap" align="center">
      <Select
        aria-label="Filter by status"
        placeholder="All statuses"
        leftSection={<IconFilter size={16} />}
        data={STATUS_OPTIONS}
        value={status}
        onChange={(value) => onStatusChange((value as UserStatusFilter | null) ?? null)}
        clearable
        w={150}
        comboboxProps={{ withinPortal: true }}
      />
      <Select
        aria-label="Filter by joined date"
        leftSection={<IconCalendarEvent size={16} />}
        data={JOINED_OPTIONS}
        value={joined}
        onChange={(value) => onJoinedChange((value as JoinedPreset) ?? "any")}
        allowDeselect={false}
        w={145}
        comboboxProps={{ withinPortal: true }}
      />
    </Group>
  );
}
