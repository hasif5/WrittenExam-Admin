// Navigation model shared by the sidebar and the app-shell header, so the shell
// always reflects the active route from a single source of truth.
// Author: Hasif Ahmed (www.hasif.info)

import {
  IconGauge,
  IconUsers,
  IconTrash,
  IconClipboardList,
  IconUserCheck,
  IconCategory2,
  IconBook2,
  IconBuildingStore,
  IconChecklist,
  IconWallet,
  IconReportAnalytics,
  type Icon,
} from "@tabler/icons-react";

export type NavBadge = "deletion-queue";

export interface NavItem {
  label: string;
  to: string;
  icon: Icon;
  // Optional live count badge (resolved by the sidebar from query data).
  badge?: NavBadge;
}

export interface NavSection {
  title: string;
  items: NavItem[];
  // Render a divider above the section to set a lower-tier group apart.
  topDivider?: boolean;
}

// Active Phase 1 surfaces, grouped for scannability.
export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", to: "/", icon: IconGauge }],
  },
  {
    title: "People",
    items: [
      { label: "Users & Roles", to: "/users", icon: IconUsers },
      { label: "Examiner Applications", to: "/examiner-applications", icon: IconClipboardList },
      { label: "Examiner Roster", to: "/examiners", icon: IconUserCheck },
    ],
  },
  {
    title: "Content",
    items: [
      { label: "Taxonomy", to: "/taxonomy", icon: IconCategory2 },
      { label: "Question Bank", to: "/questions", icon: IconBook2 },
    ],
  },
  {
    // Low-frequency maintenance/governance surfaces, de-emphasized at the bottom.
    title: "Administration",
    topDivider: true,
    items: [
      {
        label: "Deletion Queue",
        to: "/users/deletion-queue",
        icon: IconTrash,
        badge: "deletion-queue",
      },
    ],
  },
];

export interface FutureNavItem {
  label: string;
  phase: string;
  icon: Icon;
}

// Later-phase domains shown disabled for navigation context (no screens yet).
export const FUTURE_NAV: FutureNavItem[] = [
  { label: "Courses & Quizzes", phase: "Phase 2", icon: IconBuildingStore },
  { label: "Evaluation", phase: "Phase 3", icon: IconChecklist },
  { label: "Wallet & Payouts", phase: "Phase 4", icon: IconWallet },
  { label: "Reports", phase: "Phase 6", icon: IconReportAnalytics },
];

const ALL_ITEMS = NAV_SECTIONS.flatMap((section) => section.items);

/**
 * True when `pathname` resolves to the given nav route. Uses longest-prefix
 * matching so a parent route (e.g. /users) does not stay highlighted when a
 * more specific sibling (e.g. /users/deletion-queue) is active.
 */
export function isNavItemActive(pathname: string, to: string): boolean {
  if (to === "/") return pathname === "/";
  if (pathname === to) return true;
  if (!pathname.startsWith(`${to}/`)) return false;
  return !ALL_ITEMS.some(
    (item) =>
      item.to !== to &&
      item.to.startsWith(`${to}/`) &&
      (pathname === item.to || pathname.startsWith(`${item.to}/`)),
  );
}

/** Label of the active nav item for the current path (drives the header title). */
export function activeNavLabel(pathname: string): string {
  return ALL_ITEMS.find((item) => isNavItemActive(pathname, item.to))?.label ?? "Admin";
}
