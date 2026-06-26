// Authenticated app shell: header + sidebar + routed content. The navbar owns
// the brand and a footer; the header reflects the active route so the shell and
// navigation stay in sync from one shared model.
// Author: Hasif Ahmed (www.hasif.info)

import {
  AppShell as MantineAppShell,
  Avatar,
  Badge,
  Box,
  Burger,
  Group,
  Menu,
  ScrollArea,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconChevronDown, IconLogout } from "@tabler/icons-react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { activeNavLabel } from "./navigation";
import { BrandMark } from "@/components/BrandMark";
import { ColorSchemeToggle } from "@/components/ColorSchemeToggle";
import { useAuth } from "@/auth/useAuth";
import { ROLE_LABELS, type RoleCode } from "@/lib/constants";

function roleLabel(code: string): string {
  return ROLE_LABELS[code as RoleCode] ?? code;
}

const SECTION_BORDER = "1px solid var(--mantine-color-default-border)";

export function AppShell() {
  const [opened, { toggle, close }] = useDisclosure();
  const { me, roles, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const displayName = me?.full_name || me?.user.email || "Staff user";
  const initial = (displayName[0] ?? "S").toUpperCase();
  const pageTitle = activeNavLabel(pathname);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <MantineAppShell
      header={{ height: 56 }}
      navbar={{ width: 264, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding="lg"
    >
      <MantineAppShell.Header>
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Box hiddenFrom="sm">
              <BrandMark />
            </Box>
            <Text visibleFrom="sm" fw={600}>
              {pageTitle}
            </Text>
          </Group>

          <Group gap="xs" wrap="nowrap">
            <ColorSchemeToggle />
            <Menu shadow="md" width={220} position="bottom-end">
              <Menu.Target>
                <UnstyledButton>
                  <Group gap="xs" wrap="nowrap">
                    <Avatar color="brand" radius="xl" size={32}>
                      {initial}
                    </Avatar>
                    <Box visibleFrom="xs">
                      <Text size="sm" fw={500} lineClamp={1} maw={180}>
                        {displayName}
                      </Text>
                      <Group gap={4}>
                        {roles.map((r) => (
                          <Badge key={r} size="xs" variant="light" color="brand">
                            {roleLabel(r)}
                          </Badge>
                        ))}
                      </Group>
                    </Box>
                    <IconChevronDown size={16} />
                  </Group>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>{me?.user.email}</Menu.Label>
                <Menu.Divider />
                <Menu.Item
                  color="red"
                  leftSection={<IconLogout size={16} />}
                  onClick={handleLogout}
                >
                  Sign out
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </MantineAppShell.Header>

      <MantineAppShell.Navbar>
        <MantineAppShell.Section px="md" py="sm" style={{ borderBottom: SECTION_BORDER }}>
          <BrandMark />
        </MantineAppShell.Section>
        <MantineAppShell.Section grow component={ScrollArea} type="scroll" px="sm" py="md">
          <Sidebar onNavigate={close} />
        </MantineAppShell.Section>
        <MantineAppShell.Section px="md" py="sm" style={{ borderTop: SECTION_BORDER }}>
          <Group justify="space-between" wrap="nowrap">
            <Text size="xs" c="dimmed" lineClamp={1}>
              Engineer&apos;s Written Evaluation
            </Text>
            <Badge size="xs" variant="light" color="gray">
              v0.1
            </Badge>
          </Group>
        </MantineAppShell.Section>
      </MantineAppShell.Navbar>

      <MantineAppShell.Main>
        <Outlet />
      </MantineAppShell.Main>
    </MantineAppShell>
  );
}
