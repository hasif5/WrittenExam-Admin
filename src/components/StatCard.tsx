// Reusable dashboard metric tile: icon, live count (with loading/error fallbacks)
// and an optional link target so a stat doubles as a shortcut into its surface.
// File: src/components/StatCard.tsx
// Author: Hasif Ahmed <xmart@live.com> (www.hasif.info)
// Created: 2026-06-27

import { Card, Group, Skeleton, Text, ThemeIcon } from "@mantine/core";
import type { Icon } from "@tabler/icons-react";
import { Link } from "react-router-dom";

interface StatCardProps {
  label: string;
  value: number | undefined;
  icon: Icon;
  to: string;
  color?: string;
  hint?: string;
  isLoading?: boolean;
  isError?: boolean;
}

export function StatCard({
  label,
  value,
  icon: IconCmp,
  to,
  color,
  hint,
  isLoading,
  isError,
}: StatCardProps) {
  return (
    <Card component={Link} to={to} withBorder shadow="xs" padding="lg" radius="md">
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <div>
          <Text size="sm" c="dimmed" fw={500}>
            {label}
          </Text>
          {isLoading ? (
            <Skeleton height={32} width={64} mt={6} radius="sm" />
          ) : (
            <Text fz={30} fw={700} lh={1.2} mt={4} c={isError ? "red" : undefined}>
              {isError ? "-" : (value ?? 0).toLocaleString()}
            </Text>
          )}
          {hint ? (
            <Text size="xs" c="dimmed" mt={4}>
              {hint}
            </Text>
          ) : null}
        </div>
        <ThemeIcon variant="light" color={color} size={44} radius="md">
          <IconCmp size={24} stroke={1.6} />
        </ThemeIcon>
      </Group>
    </Card>
  );
}
