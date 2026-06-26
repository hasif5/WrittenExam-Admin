// Authenticated app shell: header + sidebar + routed content.
// Author: Hasif Ahmed (www.hasif.info)

import {
  AppShell as MantineAppShell,
  Badge,
  Burger,
  Group,
  Menu,
  Text,
  UnstyledButton,
  Avatar,
  Box,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconChevronDown, IconLogout } from "@tabler/icons-react";
import { Outlet, useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { ColorSchemeToggle } from "@/components/ColorSchemeToggle";
import { useAuth } from "@/auth/useAuth";
import { ROLE_LABELS, type RoleCode } from "@/lib/constants";

function roleLabel(code: string): string {
  return ROLE_LABELS[code as RoleCode] ?? code;
}

export function AppShell() {
  const [opened, { toggle, close }] = useDisclosure();
  const { me, roles, logout } = useAuth();
  const navigate = useNavigate();

  const displayName = me?.full_name || me?.user.email || "Staff user";
  const initial = (displayName[0] ?? "S").toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <MantineAppShell
      header={{ height: 56 }}
      navbar={{ width: 260, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding="md"
    >
      <MantineAppShell.Header>
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Text fw={700} size="sm">
              Written Evaluation
              <Text span c="dimmed" fw={400} ml={6}>
                Admin
              </Text>
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
        <Sidebar onNavigate={close} />
      </MantineAppShell.Navbar>

      <MantineAppShell.Main>
        <Outlet />
      </MantineAppShell.Main>
    </MantineAppShell>
  );
}
