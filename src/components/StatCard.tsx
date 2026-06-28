// Reusable dashboard metric tile: a gradient icon chip, a hero count (with
// loading/error fallbacks), an uppercase label, an optional hint, and a faded
// watermark glyph. The whole card is a link so a stat doubles as a shortcut into
// its surface; accent colour drives a coloured hover lift/glow (see CSS module).
// File: src/components/StatCard.tsx
// Author: Hasif Ahmed <xmart@live.com> (www.hasif.info)
// Created: 2026-06-27

import { Card, Group, Skeleton, Text, ThemeIcon } from "@mantine/core";
import type { Icon } from "@tabler/icons-react";
import { IconArrowUpRight } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import classes from "./StatCard.module.css";

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
  color = "brand",
  hint,
  isLoading,
  isError,
}: StatCardProps) {
  return (
    <Card
      component={Link}
      to={to}
      withBorder
      padding="lg"
      radius="lg"
      className={classes.card}
      style={{
        // Scheme-aware accent tokens consumed by the CSS module (border, bar,
        // watermark, glow) so the tile stays correct in light / dark / colorful.
        "--accent": `var(--mantine-color-${color}-filled)`,
        "--accent-soft": `var(--mantine-color-${color}-light)`,
      }}
    >
      <IconCmp className={classes.watermark} size={132} stroke={1.1} />

      <Group justify="space-between" align="center" wrap="nowrap" mb="lg">
        <ThemeIcon
          size={46}
          radius="md"
          variant="gradient"
          gradient={{ from: color, to: `${color}.7`, deg: 135 }}
        >
          <IconCmp size={24} stroke={1.7} />
        </ThemeIcon>
        <ThemeIcon size={26} radius="xl" variant="light" color={color}>
          <IconArrowUpRight size={15} stroke={2} />
        </ThemeIcon>
      </Group>

      {isLoading ? (
        <Skeleton height={38} width={88} radius="sm" />
      ) : (
        <Text
          className={classes.value}
          fz={38}
          fw={800}
          lh={1.1}
          c={isError ? "red" : undefined}
        >
          {isError ? "-" : (value ?? 0).toLocaleString()}
        </Text>
      )}

      <Text className={classes.label} size="xs" c="dimmed" fw={700} mt={6}>
        {label}
      </Text>
      {hint ? (
        <Text size="xs" c="dimmed" mt={2}>
          {hint}
        </Text>
      ) : null}
    </Card>
  );
}
