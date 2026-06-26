// Product brand mark (gradient icon + wordmark) used in the navbar and the
// mobile header so branding is defined once and reused.
// Author: Hasif Ahmed (www.hasif.info)

import { Group, Text, ThemeIcon } from "@mantine/core";
import { IconChecks } from "@tabler/icons-react";

export function BrandMark() {
  return (
    <Group gap="xs" wrap="nowrap">
      <ThemeIcon
        size={34}
        radius="md"
        variant="gradient"
        gradient={{ from: "brand.6", to: "brand.8", deg: 135 }}
      >
        <IconChecks size={20} stroke={1.8} />
      </ThemeIcon>
      <div>
        <Text fw={700} size="sm" lh={1.15}>
          Written Evaluation
        </Text>
        <Text size="xs" c="dimmed" lh={1.15}>
          Admin Console
        </Text>
      </div>
    </Group>
  );
}
