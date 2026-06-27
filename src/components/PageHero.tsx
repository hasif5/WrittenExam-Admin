// Standard page hero: a wide illustrated banner that swaps art + scrim + text
// colour per appearance, so the title/description/actions stay readable in
// light, dark, and colorful modes alike.
// The standard page header across admin; pass an image from the heroes registry.
// Author: Hasif Ahmed (www.hasif.info)

import type { ReactNode } from "react";
import { Box, Flex, Group, Stack, Text, Title } from "@mantine/core";
import { useAppearance } from "@/app/appearance";
import { APP_THEMES } from "@/app/theme";
import type { HeroVariants } from "@/assets/heroes";

interface PageHeroProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  /** Banner image variants (import from "@/assets/heroes"). */
  image: HeroVariants;
}

export function PageHero({ title, description, actions, image }: PageHeroProps) {
  const { appearance } = useAppearance();
  const isDark = APP_THEMES[appearance].colorScheme === "dark";

  const src = isDark ? image.dark : image.light;
  // Scrim fades from the text edge so the artwork stays visible on the right,
  // while the left stays opaque enough to carry the heading.
  const scrim = isDark
    ? "linear-gradient(90deg, rgba(13,18,30,.94) 0%, rgba(16,22,38,.82) 42%, rgba(16,22,38,.42) 72%, rgba(16,22,38,.18) 100%)"
    : "linear-gradient(90deg, rgba(255,255,255,.94) 0%, rgba(255,255,255,.8) 42%, rgba(255,255,255,.4) 72%, rgba(255,255,255,.12) 100%)";
  const titleColor = isDark ? "#ffffff" : "#15192b";
  const descColor = isDark ? "rgba(255,255,255,0.82)" : "rgba(21,25,43,0.74)";

  return (
    <Box
      mb="lg"
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "var(--mantine-radius-md)",
        border: "1px solid var(--mantine-color-default-border)",
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
          objectPosition: "center",
        }}
      />
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: scrim }} />
      <Flex
        pos="relative"
        p="lg"
        gap="md"
        align="center"
        justify="space-between"
        wrap="wrap"
        style={{ minHeight: 132 }}
      >
        <Stack gap={6} style={{ flex: 1, minWidth: 220 }}>
          <Title order={2} style={{ color: titleColor, letterSpacing: "-0.3px" }}>
            {title}
          </Title>
          {description && (
            <Text size="sm" style={{ color: descColor, maxWidth: 640 }}>
              {description}
            </Text>
          )}
        </Stack>
        {actions && <Group gap="sm">{actions}</Group>}
      </Flex>
    </Box>
  );
}
