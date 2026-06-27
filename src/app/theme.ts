// Brand theme tokens + the app theme registry (light / dark / colorful).
// `baseTheme` is the single inheritable root theme shared by every page; new
// appearances slot in by adding one entry to APP_THEMES (theme + colour scheme).
// Author: Hasif Ahmed (www.hasif.info)

import {
  createTheme,
  mergeThemeOverrides,
  type MantineColorsTuple,
  type MantineThemeOverride,
} from "@mantine/core";

// Brand indigo/violet scale used as the primary colour across both schemes.
const brand: MantineColorsTuple = [
  "#eef2ff",
  "#dfe5fb",
  "#bcc7f1",
  "#96a7e9",
  "#768ce1",
  "#637bde",
  "#5872dd",
  "#4862c4",
  "#3e57b0",
  "#314a9c",
];

// Neutral near-black dark scale tuned to match the Cursor dashboard dark theme.
// Index map (Mantine dark semantics): 0 = text, 2 = dimmed text, 4 = default
// border, 5 = hover/active surface, 6 = default elevated surface, 7 = body bg.
const dark: MantineColorsTuple = [
  "#ededed",
  "#c9c9c9",
  "#8b8b8b",
  "#5c5c5c",
  "#242424",
  "#1c1c1c",
  "#161616",
  "#0d0d0d",
  "#0a0a0a",
  "#060606",
];

// Vivid magenta/violet scale that drives the playful "colorful" mode primary.
const rainbow: MantineColorsTuple = [
  "#fdf0ff",
  "#f6ddff",
  "#ecb8ff",
  "#e290ff",
  "#d96dff",
  "#d456ff",
  "#d147ff",
  "#b934e3",
  "#a52ccb",
  "#9021b3",
];

// The single inheritable root theme. Every page renders under this via the one
// MantineProvider; do not create per-page themes - extend here instead.
export const baseTheme = createTheme({
  primaryColor: "brand",
  primaryShade: { light: 6, dark: 8 },
  autoContrast: true,
  defaultRadius: "md",
  colors: { brand, dark, rainbow },
  fontFamily:
    "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  headings: {
    fontWeight: "650",
  },
  components: {
    AppShell: {
      styles: {
        // Recessed app surface (set in global.css) so bordered cards lift off it
        // consistently in every mode, instead of each page picking a background.
        main: { backgroundColor: "var(--app-shell-bg)" },
      },
    },
    Card: {
      defaultProps: {
        withBorder: true,
        radius: "md",
        // Scheme-aware: white in light, slightly elevated near-black in dark.
        bg: "var(--mantine-color-default)",
      },
    },
    Paper: {
      defaultProps: {
        radius: "md",
      },
    },
    Button: {
      defaultProps: {
        radius: "md",
      },
    },
    NavLink: {
      defaultProps: {
        // Neutral grey hover (Cursor-style); active items opt into the brand tint.
        color: "gray",
      },
      styles: {
        // Rounded "pill" rows for a modern sidebar, applied app-wide.
        root: { borderRadius: "var(--mantine-radius-md)" },
      },
    },
  },
});

// Colorful mode: inherits the root theme, swaps in the vivid primary + a rainbow
// default gradient. It rides on the light colour scheme; the playful surfaces
// (gradient header/sidebar/background) live in global.css under data-app-theme.
export const colorfulTheme: MantineThemeOverride = mergeThemeOverrides(
  baseTheme,
  createTheme({
    primaryColor: "rainbow",
    primaryShade: { light: 6, dark: 6 },
    defaultGradient: { from: "grape", to: "indigo", deg: 60 },
  }),
);

export type Appearance = "light" | "dark" | "colorful";

export interface AppThemeEntry {
  label: string;
  theme: MantineThemeOverride;
  // The Mantine colour scheme this appearance forces (forceColorScheme).
  colorScheme: "light" | "dark";
}

// Theme registry: add a new appearance here and it is instantly selectable.
export const APP_THEMES: Record<Appearance, AppThemeEntry> = {
  light: { label: "Light", theme: baseTheme, colorScheme: "light" },
  dark: { label: "Dark", theme: baseTheme, colorScheme: "dark" },
  colorful: { label: "Colorful", theme: colorfulTheme, colorScheme: "light" },
};

export const APPEARANCE_ORDER: Appearance[] = ["light", "dark", "colorful"];

export const DEFAULT_APPEARANCE: Appearance = "dark";
