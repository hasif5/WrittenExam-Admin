// Dashboard: one permission-aware GraphQL round trip (useDashboardStats) powers
// the live stat tiles plus two composition donut charts. Each tile/chart is gated
// on the operator's permission so it doubles as a shortcut into a surface they can
// actually reach. Counts come from the scoped /graphql reporting endpoint.
// File: src/features/dashboard/DashboardPage.tsx
// Author: Hasif Ahmed <xmart@live.com> (www.hasif.info)
// Created: 2026-06-26

import { Card, SimpleGrid, Skeleton, Text } from "@mantine/core";
import {
  IconBook2,
  IconClipboardList,
  IconDeviceMobile,
  IconShieldCog,
  IconTrash,
  IconUserCheck,
  type Icon,
} from "@tabler/icons-react";
import { useAuth } from "@/auth/useAuth";
import { PageHero } from "@/components/PageHero";
import { StatCard } from "@/components/StatCard";
import { ErrorState } from "@/components/ErrorState";
import { HEROES } from "@/assets/heroes";
import { QUESTION_TYPES, ROSTER_STATUSES } from "@/lib/constants";
import { useDashboardStats, type DashboardStats } from "@/api/queries/dashboard";
import { BreakdownDonutCard } from "./BreakdownDonutCard";

type ScalarField = Extract<
  keyof DashboardStats,
  | "pendingApplications"
  | "activeExaminers"
  | "frontendUsers"
  | "staffUsers"
  | "questions"
  | "deletionQueue"
>;

interface StatMeta {
  key: string;
  permission: string;
  label: string;
  to: string;
  icon: Icon;
  color: string;
  hint: string;
  field: ScalarField;
}

const STAT_META: StatMeta[] = [
  {
    key: "pending-apps",
    permission: "examiner_apps.review",
    label: "Pending applications",
    to: "/examiner-applications",
    icon: IconClipboardList,
    color: "yellow",
    hint: "Awaiting review",
    field: "pendingApplications",
  },
  {
    key: "roster",
    permission: "examiners.manage",
    label: "Active examiners",
    to: "/examiners",
    icon: IconUserCheck,
    color: "teal",
    hint: "On the roster",
    field: "activeExaminers",
  },
  {
    key: "frontend-users",
    permission: "users.read",
    label: "Frontend users",
    to: "/users",
    icon: IconDeviceMobile,
    color: "blue",
    hint: "Students, examiners, pool",
    field: "frontendUsers",
  },
  {
    key: "staff-users",
    permission: "users.read",
    label: "Staff & admins",
    to: "/users",
    icon: IconShieldCog,
    color: "grape",
    hint: "Admin-panel accounts",
    field: "staffUsers",
  },
  {
    key: "questions",
    permission: "question_bank.read",
    label: "Questions",
    to: "/questions",
    icon: IconBook2,
    color: "indigo",
    hint: "In the question bank",
    field: "questions",
  },
  {
    key: "deletions",
    permission: "deletion_queue.review",
    label: "Deletion queue",
    to: "/users/deletion-queue",
    icon: IconTrash,
    color: "red",
    hint: "Within grace window",
    field: "deletionQueue",
  },
];

const QUESTION_TYPE_LABELS = Object.fromEntries(
  QUESTION_TYPES.map((t) => [t.value, t.label]),
);
const ROSTER_STATUS_LABELS = Object.fromEntries(
  ROSTER_STATUSES.map((s) => [s.value, s.label]),
);

export function DashboardPage() {
  const { me, can } = useAuth();
  const name = me?.full_name || me?.user.email || "there";

  const visibleStats = STAT_META.filter((s) => can(s.permission));
  // No network call for an operator who manages nothing (preserves prior behavior).
  const stats = useDashboardStats(visibleStats.length > 0);
  const data = stats.data;

  const showQuestionsChart = can("question_bank.read");
  const showRosterChart = can("examiners.manage");

  return (
    <>
      <PageHero
        image={HEROES.dashboard}
        title={`Welcome, ${name}`}
        description="A live snapshot of the surfaces you manage. Select any tile to jump straight in. Later domains (courses, evaluation, finance, reports) are coming soon."
      />

      {visibleStats.length === 0 ? (
        <Card withBorder radius="md" padding="lg">
          <Text fw={600} mb={4}>
            Welcome aboard
          </Text>
          <Text size="sm" c="dimmed">
            Your account does not yet have access to any managed surfaces. An administrator
            can grant permissions from Roles &amp; Permissions.
          </Text>
        </Card>
      ) : stats.isError ? (
        <ErrorState error={stats.error} onRetry={() => stats.refetch()} />
      ) : (
        <>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
            {visibleStats.map((s) => (
              <StatCard
                key={s.key}
                label={s.label}
                value={data ? (data[s.field] ?? 0) : undefined}
                icon={s.icon}
                to={s.to}
                color={s.color}
                hint={s.hint}
                isLoading={stats.isLoading}
              />
            ))}
          </SimpleGrid>

          {(showQuestionsChart || showRosterChart) && (
            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg" mt="xl">
              {showQuestionsChart &&
                (stats.isLoading || !data ? (
                  <Skeleton height={252} radius="lg" />
                ) : (
                  <BreakdownDonutCard
                    title="Questions by type"
                    hint="Top-level questions in the bank"
                    buckets={data.questionsByType ?? []}
                    labelMap={QUESTION_TYPE_LABELS}
                  />
                ))}
              {showRosterChart &&
                (stats.isLoading || !data ? (
                  <Skeleton height={252} radius="lg" />
                ) : (
                  <BreakdownDonutCard
                    title="Examiner roster by status"
                    hint="Accounts across the roster"
                    buckets={data.rosterByStatus ?? []}
                    labelMap={ROSTER_STATUS_LABELS}
                  />
                ))}
            </SimpleGrid>
          )}
        </>
      )}

      <Card withBorder radius="md" padding="lg" mt="xl">
        <Text fw={600} mb={4}>
          About this console
        </Text>
        <Text size="sm" c="dimmed">
          Every screen here is wired to a live backend endpoint. Sidebar items marked
          &quot;coming later&quot; are placeholders for navigation context and are intentionally
          disabled until those domains ship.
        </Text>
      </Card>
    </>
  );
}
