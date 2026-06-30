// User table filter preset helpers.
// File: src/features/users/userFilterPresets.ts
// Author: Hasif Ahmed <xmart@live.com> (www.hasif.info)
// Created: 2026-06-30

import dayjs from "dayjs";
import type { JoinedPreset } from "./UsersToolbar";

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
