// Brand theme tokens (light + dark aware).
// Author: Hasif Ahmed (www.hasif.info)

import { createTheme, type MantineColorsTuple } from "@mantine/core";

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

export const theme = createTheme({
  primaryColor: "brand",
  primaryShade: { light: 6, dark: 8 },
  autoContrast: true,
  defaultRadius: "md",
  colors: { brand, dark },
  fontFamily:
    "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  headings: {
    fontWeight: "650",
  },
  components: {
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
        // Neutral grey active/hover (Cursor-style) instead of an indigo tint.
        color: "gray",
      },
    },
  },
});
