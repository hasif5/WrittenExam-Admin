// Appearance state contract: the selected app theme (light / dark / colorful),
// layered on top of Mantine's binary colour scheme so a third mode can exist.
// Context + hook live here (no component) to keep fast-refresh happy.
// Author: Hasif Ahmed (www.hasif.info)

import { createContext, useContext } from "react";
import type { Appearance } from "./theme";
import { DEFAULT_APPEARANCE, APPEARANCE_ORDER } from "./theme";

export const APPEARANCE_STORAGE_KEY = "wep_admin_appearance";

export interface AppearanceState {
  appearance: Appearance;
  setAppearance: (next: Appearance) => void;
}

export const AppearanceContext = createContext<AppearanceState | null>(null);

export function useAppearance(): AppearanceState {
  const ctx = useContext(AppearanceContext);
  if (!ctx) {
    throw new Error("useAppearance must be used within an AppearanceProvider");
  }
  return ctx;
}

export function readStoredAppearance(): Appearance {
  if (typeof window === "undefined") return DEFAULT_APPEARANCE;
  const stored = window.localStorage.getItem(APPEARANCE_STORAGE_KEY);
  return stored && (APPEARANCE_ORDER as string[]).includes(stored)
    ? (stored as Appearance)
    : DEFAULT_APPEARANCE;
}
