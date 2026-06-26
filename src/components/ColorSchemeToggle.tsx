// Light/dark colour-scheme toggle button.
// Author: Hasif Ahmed (www.hasif.info)

import { ActionIcon, Tooltip, useComputedColorScheme, useMantineColorScheme } from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";

export function ColorSchemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const computed = useComputedColorScheme("light", { getInitialValueInEffect: true });
  const isDark = computed === "dark";

  return (
    <Tooltip label={isDark ? "Switch to light mode" : "Switch to dark mode"} position="bottom">
      <ActionIcon
        variant="default"
        size="lg"
        radius="md"
        aria-label="Toggle colour scheme"
        onClick={() => setColorScheme(isDark ? "light" : "dark")}
      >
        {isDark ? <IconSun size={18} stroke={1.6} /> : <IconMoon size={18} stroke={1.6} />}
      </ActionIcon>
    </Tooltip>
  );
}
