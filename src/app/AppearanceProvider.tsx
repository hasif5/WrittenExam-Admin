// Owns the selected appearance, persists it, drives the single root MantineProvider
// from the theme registry, and exposes a `data-app-theme` hook for global.css.
// Author: Hasif Ahmed (www.hasif.info)

import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { MantineProvider } from "@mantine/core";
import {
  AppearanceContext,
  APPEARANCE_STORAGE_KEY,
  readStoredAppearance,
  type AppearanceState,
} from "./appearance";
import { APP_THEMES, type Appearance } from "./theme";

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [appearance, setAppearanceState] = useState<Appearance>(readStoredAppearance);

  useLayoutEffect(() => {
    document.documentElement.setAttribute("data-app-theme", appearance);
    window.localStorage.setItem(APPEARANCE_STORAGE_KEY, appearance);
  }, [appearance]);

  const setAppearance = useCallback((next: Appearance) => setAppearanceState(next), []);

  const value = useMemo<AppearanceState>(
    () => ({ appearance, setAppearance }),
    [appearance, setAppearance],
  );

  const entry = APP_THEMES[appearance];

  return (
    <AppearanceContext.Provider value={value}>
      <MantineProvider theme={entry.theme} forceColorScheme={entry.colorScheme}>
        {children}
      </MantineProvider>
    </AppearanceContext.Provider>
  );
}
