// Sidebar navigation. Renders grouped, labelled sections from the shared nav
// model with route-driven active states; later phases are shown disabled with
// their phase inline. Scrolling/padding is owned by the AppShell.Navbar section.
// Author: Hasif Ahmed (www.hasif.info)

import type { ReactNode } from "react";
import { Badge, Divider, NavLink, Stack, Text } from "@mantine/core";
import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { useDeletionQueue } from "@/api/queries/users";
import { useAuth } from "@/auth/useAuth";
import { FUTURE_NAV, NAV_SECTIONS, isNavItemActive, type NavItem } from "./navigation";

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <Text size="xs" fw={600} c="dimmed" tt="uppercase" px="xs" mb={6} style={{ letterSpacing: 0.4 }}>
      {children}
    </Text>
  );
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation();
  const { can } = useAuth();
  const deletionCount = useDeletionQueue(can("deletion_queue.review")).data?.length ?? 0;

  const visibleSections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => !item.permission || can(item.permission)),
  })).filter((section) => section.items.length > 0);

  const badgeFor = (item: NavItem): ReactNode => {
    if (item.badge === "deletion-queue" && deletionCount > 0) {
      return (
        <Badge size="sm" circle variant="filled" color="orange">
          {deletionCount}
        </Badge>
      );
    }
    return undefined;
  };

  return (
    <Stack gap="lg">
      {visibleSections.map((section) => (
        <div key={section.title}>
          {section.topDivider && <Divider mb="md" />}
          <SectionLabel>{section.title}</SectionLabel>
          <Stack gap={2}>
            {section.items.map((item) => {
              const active = isNavItemActive(pathname, item.to);
              return (
                <NavLink
                  key={item.to}
                  component={RouterNavLink}
                  to={item.to}
                  end={item.to === "/"}
                  label={item.label}
                  leftSection={<item.icon size={18} stroke={1.6} />}
                  rightSection={badgeFor(item)}
                  active={active}
                  color={active ? "brand" : "gray"}
                  variant={active ? "light" : "subtle"}
                  onClick={onNavigate}
                />
              );
            })}
          </Stack>
        </div>
      ))}

      <div>
        <SectionLabel>Coming later</SectionLabel>
        <Stack gap={2}>
          {FUTURE_NAV.map((item) => (
            <NavLink
              key={item.label}
              label={item.label}
              description={item.phase}
              leftSection={<item.icon size={18} stroke={1.6} />}
              disabled
            />
          ))}
        </Stack>
      </div>
    </Stack>
  );
}
