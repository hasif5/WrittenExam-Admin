// Reusable donut card for a composition breakdown (questions by type, roster by
// status, and any future report breakdown). Takes labelled count buckets, renders
// a Mantine DonutChart with a center total and a colour-keyed legend, and shows a
// graceful empty state when every slice is zero.
// File: src/features/dashboard/BreakdownDonutCard.tsx
// Author: Hasif Ahmed <xmart@live.com> (www.hasif.info)
// Created: 2026-06-28

import { Box, Card, Group, Stack, Text } from "@mantine/core";
import { DonutChart } from "@mantine/charts";
import type { CountBucket } from "@/api/queries/dashboard";

interface BreakdownDonutCardProps {
  title: string;
  hint?: string;
  buckets: CountBucket[];
  // Optional key -> display label override (e.g. shared admin constants) so labels
  // stay consistent with the rest of the UI; falls back to the bucket's own label.
  labelMap?: Record<string, string>;
}

// Stable base colour names; each maps to its Mantine `<name>.6` shade.
const PALETTE = ["indigo", "teal", "grape", "orange", "blue", "pink"] as const;

export function BreakdownDonutCard({
  title,
  hint,
  buckets,
  labelMap,
}: BreakdownDonutCardProps) {
  const labelFor = (b: CountBucket) => labelMap?.[b.key] ?? b.label;
  const total = buckets.reduce((sum, b) => sum + b.count, 0);

  const data = buckets.map((bucket, index) => ({
    name: labelFor(bucket),
    value: bucket.count,
    color: `${PALETTE[index % PALETTE.length]}.6`,
  }));

  return (
    <Card withBorder radius="md" padding="lg">
      <Text fw={600}>{title}</Text>
      {hint ? (
        <Text size="xs" c="dimmed" mt={2}>
          {hint}
        </Text>
      ) : null}

      {total === 0 ? (
        <Text size="sm" c="dimmed" mt="lg">
          No data yet.
        </Text>
      ) : (
        <Group justify="space-between" align="center" mt="md" wrap="nowrap">
          <DonutChart
            data={data}
            size={150}
            thickness={26}
            withTooltip
            chartLabel={total.toLocaleString()}
          />
          <Stack gap={6} style={{ flex: 1 }}>
            {data.map((slice) => (
              <Group key={slice.name} gap="xs" wrap="nowrap" justify="space-between">
                <Group gap={8} wrap="nowrap">
                  <Box
                    w={10}
                    h={10}
                    style={{
                      borderRadius: 2,
                      backgroundColor: `var(--mantine-color-${slice.color.replace(".", "-")})`,
                    }}
                  />
                  <Text size="sm">{slice.name}</Text>
                </Group>
                <Text size="sm" fw={600}>
                  {slice.value.toLocaleString()}
                </Text>
              </Group>
            ))}
          </Stack>
        </Group>
      )}
    </Card>
  );
}
