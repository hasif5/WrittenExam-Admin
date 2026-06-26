// Dashboard welcome panel. No analytics endpoints exist in Phase 1, so this is a
// static orientation screen pointing to the live admin surfaces.
// Author: Hasif Ahmed (www.hasif.info)

import { Card, Grid, Group, SimpleGrid, Text, ThemeIcon } from "@mantine/core";
import {
  IconBook2,
  IconCategory2,
  IconClipboardList,
  IconUserCheck,
  IconUsers,
  type Icon,
} from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/auth/useAuth";

interface Tile {
  label: string;
  to: string;
  icon: Icon;
  description: string;
}

const TILES: Tile[] = [
  { label: "Users & Roles", to: "/users", icon: IconUsers, description: "Manage staff and role assignments" },
  {
    label: "Examiner Applications",
    to: "/examiner-applications",
    icon: IconClipboardList,
    description: "Review and decide on applications",
  },
  {
    label: "Examiner Roster",
    to: "/examiners",
    icon: IconUserCheck,
    description: "Curate the active examiner roster",
  },
  { label: "Taxonomy", to: "/taxonomy", icon: IconCategory2, description: "Sections, subjects and chapters" },
  { label: "Question Bank", to: "/questions", icon: IconBook2, description: "Author questions with LaTeX" },
];

export function DashboardPage() {
  const { me } = useAuth();
  const name = me?.full_name || me?.user.email || "there";

  return (
    <>
      <PageHeader
        title={`Welcome, ${name}`}
        description="Phase 1 admin console. Later domains (courses, evaluation, finance, reports) arrive in upcoming phases."
      />

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
        {TILES.map((tile) => (
          <Card
            key={tile.to}
            component={Link}
            to={tile.to}
            withBorder
            shadow="xs"
            padding="lg"
            radius="md"
          >
            <Group>
              <ThemeIcon variant="light" size={42} radius="md">
                <tile.icon size={24} stroke={1.6} />
              </ThemeIcon>
              <div>
                <Text fw={600}>{tile.label}</Text>
                <Text size="sm" c="dimmed">
                  {tile.description}
                </Text>
              </div>
            </Group>
          </Card>
        ))}
      </SimpleGrid>

      <Grid mt="xl">
        <Grid.Col span={12}>
          <Card withBorder radius="md" padding="lg">
            <Text fw={600} mb={4}>
              About this console
            </Text>
            <Text size="sm" c="dimmed">
              Every screen here is wired to a real Phase 1 backend endpoint. Sidebar items marked
              &quot;coming later&quot; are placeholders for navigation context and are intentionally
              disabled until their backend phase ships.
            </Text>
          </Card>
        </Grid.Col>
      </Grid>
    </>
  );
}
