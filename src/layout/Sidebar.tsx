// Sidebar navigation. Active Phase 1 surfaces are links; later phases are shown
// disabled for navigation context (no data screens, no invented endpoints).
// Author: Hasif Ahmed (www.hasif.info)

import { NavLink, ScrollArea, Stack, Text, Tooltip } from "@mantine/core";
import {
  IconBook2,
  IconCategory2,
  IconClipboardList,
  IconGauge,
  IconTrash,
  IconUsers,
  IconUserCheck,
  IconBuildingStore,
  IconWallet,
  IconReportAnalytics,
  type Icon,
} from "@tabler/icons-react";
import { NavLink as RouterNavLink } from "react-router-dom";

interface NavItem {
  label: string;
  to: string;
  icon: Icon;
}

const PRIMARY: NavItem[] = [
  { label: "Dashboard", to: "/", icon: IconGauge },
  { label: "Users & Roles", to: "/users", icon: IconUsers },
  { label: "Deletion Queue", to: "/users/deletion-queue", icon: IconTrash },
  { label: "Examiner Applications", to: "/examiner-applications", icon: IconClipboardList },
  { label: "Examiner Roster", to: "/examiners", icon: IconUserCheck },
  { label: "Taxonomy", to: "/taxonomy", icon: IconCategory2 },
  { label: "Question Bank", to: "/questions", icon: IconBook2 },
];

interface FutureItem {
  label: string;
  phase: string;
  icon: Icon;
}

const FUTURE: FutureItem[] = [
  { label: "Courses & Quizzes", phase: "Phase 2", icon: IconBuildingStore },
  { label: "Evaluation", phase: "Phase 3", icon: IconClipboardList },
  { label: "Wallet & Payouts", phase: "Phase 4", icon: IconWallet },
  { label: "Reports", phase: "Phase 6", icon: IconReportAnalytics },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <ScrollArea h="100%" type="scroll">
      <Stack gap={4} p="xs">
        {PRIMARY.map((item) => (
          <NavLink
            key={item.to}
            component={RouterNavLink}
            to={item.to}
            end={item.to === "/"}
            label={item.label}
            leftSection={<item.icon size={18} stroke={1.6} />}
            onClick={onNavigate}
          />
        ))}

        <Text size="xs" c="dimmed" fw={600} tt="uppercase" mt="md" mb={4} px="sm">
          Coming later
        </Text>
        {FUTURE.map((item) => (
          <Tooltip key={item.label} label={`Available in ${item.phase}`} position="right">
            <NavLink
              label={item.label}
              description={item.phase}
              leftSection={<item.icon size={18} stroke={1.6} />}
              disabled
            />
          </Tooltip>
        ))}
      </Stack>
    </ScrollArea>
  );
}
