// Dashboard: live operational stats (permission-gated) that double as shortcuts
// into each surface, plus a short orientation note. Counts come from the existing
// list endpoints (limit=1, read total) so no dedicated analytics endpoint is needed.
// File: src/features/dashboard/DashboardPage.tsx
// Author: Hasif Ahmed <xmart@live.com> (www.hasif.info)
// Created: 2026-06-26

import { Card, SimpleGrid, Text } from "@mantine/core";
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
import { HEROES } from "@/assets/heroes";
import { useExaminerApps, useExaminerRoster } from "@/api/queries/examiners";
import { useDeletionQueue, useUsers } from "@/api/queries/users";
import { useQuestions } from "@/api/queries/questions";

interface StatView {
  key: string;
  permission: string;
  label: string;
  to: string;
  icon: Icon;
  color?: string;
  hint?: string;
  value: number | undefined;
  isLoading: boolean;
  isError: boolean;
}

const ONE = { limit: 1, offset: 0 };

export function DashboardPage() {
  const { me, can } = useAuth();
  const name = me?.full_name || me?.user.email || "there";

  // Each count is gated on the operator's permission so we never fire a request
  // they are not allowed to make; limit=1 keeps the payload to a single row.
  const pendingApps = useExaminerApps(
    { status: "pending", ...ONE },
    can("examiner_apps.review"),
  );
  const roster = useExaminerRoster({ status: "active", ...ONE }, can("examiners.manage"));
  const frontendUsers = useUsers({ ...ONE, userType: "frontend" }, can("users.read"));
  const staffUsers = useUsers({ ...ONE, userType: "staff" }, can("users.read"));
  const questions = useQuestions(ONE, can("question_bank.read"));
  const deletions = useDeletionQueue(can("deletion_queue.review"));

  const stats: StatView[] = [
    {
      key: "pending-apps",
      permission: "examiner_apps.review",
      label: "Pending applications",
      to: "/examiner-applications",
      icon: IconClipboardList,
      color: "yellow",
      hint: "Awaiting review",
      value: pendingApps.data?.total,
      isLoading: pendingApps.isLoading,
      isError: pendingApps.isError,
    },
    {
      key: "roster",
      permission: "examiners.manage",
      label: "Active examiners",
      to: "/examiners",
      icon: IconUserCheck,
      color: "teal",
      hint: "On the roster",
      value: roster.data?.total,
      isLoading: roster.isLoading,
      isError: roster.isError,
    },
    {
      key: "frontend-users",
      permission: "users.read",
      label: "Frontend users",
      to: "/users",
      icon: IconDeviceMobile,
      color: "blue",
      hint: "Students, examiners, pool",
      value: frontendUsers.data?.total,
      isLoading: frontendUsers.isLoading,
      isError: frontendUsers.isError,
    },
    {
      key: "staff-users",
      permission: "users.read",
      label: "Staff & admins",
      to: "/users",
      icon: IconShieldCog,
      color: "grape",
      hint: "Admin-panel accounts",
      value: staffUsers.data?.total,
      isLoading: staffUsers.isLoading,
      isError: staffUsers.isError,
    },
    {
      key: "questions",
      permission: "question_bank.read",
      label: "Questions",
      to: "/questions",
      icon: IconBook2,
      color: "indigo",
      hint: "In the question bank",
      value: questions.data?.total,
      isLoading: questions.isLoading,
      isError: questions.isError,
    },
    {
      key: "deletions",
      permission: "deletion_queue.review",
      label: "Deletion queue",
      to: "/users/deletion-queue",
      icon: IconTrash,
      color: "red",
      hint: "Within grace window",
      value: deletions.data?.length,
      isLoading: deletions.isLoading,
      isError: deletions.isError,
    },
  ];

  const visible = stats.filter((s) => can(s.permission));

  return (
    <>
      <PageHero
        image={HEROES.dashboard}
        title={`Welcome, ${name}`}
        description="A live snapshot of the surfaces you manage. Select any tile to jump straight in. Later domains (courses, evaluation, finance, reports) are coming soon."
      />

      {visible.length > 0 ? (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
          {visible.map((s) => (
            <StatCard
              key={s.key}
              label={s.label}
              value={s.value}
              icon={s.icon}
              to={s.to}
              color={s.color}
              hint={s.hint}
              isLoading={s.isLoading}
              isError={s.isError}
            />
          ))}
        </SimpleGrid>
      ) : (
        <Card withBorder radius="md" padding="lg">
          <Text fw={600} mb={4}>
            Welcome aboard
          </Text>
          <Text size="sm" c="dimmed">
            Your account does not yet have access to any managed surfaces. An administrator
            can grant permissions from Roles &amp; Permissions.
          </Text>
        </Card>
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
