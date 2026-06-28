// Standard right-side editor drawer used across the admin panel. An illustrated
// banner runs from the very top edge with the title, optional caption, and close
// button floating over it (scrim keeps them legible in light / dark / colorful).
// The banner stays pinned at the top and the optional footer stays pinned at the
// bottom (both position: sticky) while the body content scrolls between them.
// File: src/components/EditorDrawer.tsx
// Author: Hasif Ahmed <xmart@live.com> (www.hasif.info)
// Created: 2026-06-28

import type { ReactNode } from "react";
import { Box, CloseButton, Drawer, Flex, Group, Text, Title } from "@mantine/core";
import type { DrawerProps } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useAppearance } from "@/app/appearance";
import { APP_THEMES } from "@/app/theme";
import type { HeroVariants } from "@/assets/heroes";

interface EditorDrawerProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  /** Short line shown over the banner under the title; omit for title only. */
  caption?: string;
  /** Banner image variants (import from "@/assets/heroes"). */
  image: HeroVariants;
  size?: DrawerProps["size"];
  /** Pinned footer content (usually the action buttons); omit for none. */
  footer?: ReactNode;
  children: ReactNode;
}

const BANNER_HEIGHT = 148;

export function EditorDrawer({
  opened,
  onClose,
  title,
  caption,
  image,
  size = "lg",
  footer,
  children,
}: EditorDrawerProps) {
  const { appearance } = useAppearance();
  const isDark = APP_THEMES[appearance].colorScheme === "dark";
  // Responsive by default: every drawer goes full-width on small screens so it is
  // usable on phones/tablets; the caller's `size` applies from the breakpoint up.
  const isMobile = useMediaQuery("(max-width: 48em)");
  const effectiveSize = isMobile ? "100%" : size;

  const src = isDark ? image.dark : image.light;
  // Horizontal scrim (left-heavy, carries the title/caption) layered with a soft
  // top fade so the close button stays legible over the lighter right-side art.
  const scrim = isDark
    ? "linear-gradient(90deg, rgba(13,18,30,.92) 0%, rgba(16,22,38,.55) 50%, rgba(16,22,38,.12) 100%), linear-gradient(180deg, rgba(16,22,38,.45) 0%, rgba(16,22,38,0) 42%)"
    : "linear-gradient(90deg, rgba(255,255,255,.94) 0%, rgba(255,255,255,.58) 50%, rgba(255,255,255,.12) 100%), linear-gradient(180deg, rgba(255,255,255,.5) 0%, rgba(255,255,255,0) 42%)";
  const titleColor = isDark ? "#ffffff" : "#15192b";
  const captionColor = isDark ? "rgba(255,255,255,0.82)" : "rgba(21,25,43,0.72)";

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size={effectiveSize}
      padding={0}
      withCloseButton={false}
    >
      {/* Pinned banner header (sticky top) so the title + close stay in view. */}
      <Box
        style={{
          position: "sticky",
          top: 0,
          zIndex: 2,
          height: BANNER_HEIGHT,
          overflow: "hidden",
          borderBottom: "1px solid var(--mantine-color-default-border)",
        }}
      >
        <img
          src={src}
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "right center",
          }}
        />
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: scrim }} />
        <Flex pos="relative" direction="column" justify="space-between" p="md" h="100%">
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <Title order={3} style={{ color: titleColor, letterSpacing: "-0.3px" }}>
              {title}
            </Title>
            <CloseButton
              onClick={onClose}
              aria-label="Close"
              size="lg"
              style={{ color: titleColor }}
            />
          </Group>
          {caption ? (
            <Text
              size="xs"
              fw={600}
              tt="uppercase"
              style={{ color: captionColor, letterSpacing: "0.06em", maxWidth: "62%" }}
            >
              {caption}
            </Text>
          ) : null}
        </Flex>
      </Box>

      <Box p="md">{children}</Box>

      {footer ? (
        <Box
          style={{
            position: "sticky",
            bottom: 0,
            zIndex: 2,
            padding: "var(--mantine-spacing-sm) var(--mantine-spacing-md)",
            background: "var(--mantine-color-body)",
            borderTop: "1px solid var(--mantine-color-default-border)",
          }}
        >
          {footer}
        </Box>
      ) : null}
    </Drawer>
  );
}
