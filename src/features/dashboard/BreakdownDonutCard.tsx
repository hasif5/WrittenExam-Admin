// Reusable donut card for a composition breakdown (questions by type, roster by
// status, and any future report breakdown). Takes labelled count buckets, renders
// a Mantine DonutChart inside a soft tinted well with separated slices and a
// two-line center total, plus a colour-keyed legend listing each slice's share
// and count; shows a graceful empty state when every slice is zero.
// File: src/features/dashboard/BreakdownDonutCard.tsx
// Author: Hasif Ahmed <xmart@live.com> (www.hasif.info)
// Created: 2026-06-28

import { Badge, Box, Card, Group, Stack, Text } from "@mantine/core";
import { DonutChart } from "@mantine/charts";
import type { CountBucket } from "@/api/queries/dashboard";
import classes from "./BreakdownDonutCard.module.css";

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
    <Card withBorder radius="lg" padding="lg">
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <div>
          <Text fw={650} fz="md">
            {title}
          </Text>
          {hint ? (
            <Text size="xs" c="dimmed" mt={2}>
              {hint}
            </Text>
          ) : null}
        </div>
        {total > 0 ? (
          <Badge variant="light" color="gray" radius="sm">
            {data.length} {data.length === 1 ? "category" : "categories"}
          </Badge>
        ) : null}
      </Group>

      {total === 0 ? (
        <Text size="sm" c="dimmed" mt="xl">
          No data yet.
        </Text>
      ) : (
        <Group justify="space-between" align="center" mt="lg" wrap="nowrap" gap="xl">
          <Box className={classes.chartWell}>
            <DonutChart
              data={data}
              size={172}
              thickness={26}
              paddingAngle={3}
              withTooltip
              tooltipDataSource="segment"
              strokeWidth={0}
            />
            <div className={classes.center}>
              <Text className={classes.centerValue} fz={28} fw={800}>
                {total.toLocaleString()}
              </Text>
              <Text size="xs" c="dimmed" fw={600} tt="uppercase" lh={1}>
                Total
              </Text>
            </div>
          </Box>

          <Stack gap={2} style={{ flex: 1 }}>
            {data.map((slice) => {
              const pct = total > 0 ? Math.round((slice.value / total) * 100) : 0;
              return (
                <Group
                  key={slice.name}
                  className={classes.row}
                  gap="xs"
                  wrap="nowrap"
                  justify="space-between"
                >
                  <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
                    <Box
                      className={classes.dot}
                      style={{
                        backgroundColor: `var(--mantine-color-${slice.color.replace(".", "-")})`,
                      }}
                    />
                    <Text size="sm" truncate>
                      {slice.name}
                    </Text>
                  </Group>
                  <Group gap={8} wrap="nowrap">
                    <Text size="sm" fw={700}>
                      {slice.value.toLocaleString()}
                    </Text>
                    <Badge size="sm" variant="light" color="gray" radius="sm" w={46}>
                      {pct}%
                    </Badge>
                  </Group>
                </Group>
              );
            })}
          </Stack>
        </Group>
      )}
    </Card>
  );
}
