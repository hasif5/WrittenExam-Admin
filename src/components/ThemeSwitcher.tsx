// Appearance switcher: pick Light / Dark / Colorful. Driven by the app theme
// registry, so adding a new appearance automatically adds a menu entry.
// Author: Hasif Ahmed (www.hasif.info)

import { ActionIcon, Menu, Tooltip } from "@mantine/core";
import { IconCheck, IconMoon, IconPalette, IconSun, type Icon } from "@tabler/icons-react";
import { useAppearance } from "@/app/appearance";
import { APPEARANCE_ORDER, APP_THEMES, type Appearance } from "@/app/theme";

const ICONS: Record<Appearance, Icon> = {
  light: IconSun,
  dark: IconMoon,
  colorful: IconPalette,
};

export function ThemeSwitcher() {
  const { appearance, setAppearance } = useAppearance();
  const CurrentIcon = ICONS[appearance];

  return (
    <Menu shadow="md" width={180} position="bottom-end" withinPortal>
      <Menu.Target>
        <Tooltip label="Theme" position="bottom">
          <ActionIcon variant="default" size="lg" radius="md" aria-label="Choose theme">
            <CurrentIcon size={18} stroke={1.6} />
          </ActionIcon>
        </Tooltip>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Appearance</Menu.Label>
        {APPEARANCE_ORDER.map((value) => {
          const ItemIcon = ICONS[value];
          const active = value === appearance;
          return (
            <Menu.Item
              key={value}
              leftSection={<ItemIcon size={16} stroke={1.6} />}
              rightSection={active ? <IconCheck size={14} /> : undefined}
              onClick={() => setAppearance(value)}
            >
              {APP_THEMES[value].label}
            </Menu.Item>
          );
        })}
      </Menu.Dropdown>
    </Menu>
  );
}
