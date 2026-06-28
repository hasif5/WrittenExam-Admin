// Dashboard stats query hook: one permission-aware GraphQL round trip replacing
// the previous six REST count calls. The response is Zod-parsed so a backend
// shape change fails loudly instead of rendering undefined (the GraphQL endpoint
// is intentionally outside the OpenAPI -> schema.d.ts codegen guarantee).
// File: src/api/queries/dashboard.ts
// Author: Hasif Ahmed <xmart@live.com> (www.hasif.info)
// Created: 2026-06-28

import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { graphqlRequest } from "@/api/graphql";

const countBucketSchema = z.object({
  key: z.string(),
  label: z.string(),
  count: z.number(),
});

const dashboardStatsSchema = z.object({
  pendingApplications: z.number().nullable(),
  activeExaminers: z.number().nullable(),
  frontendUsers: z.number().nullable(),
  staffUsers: z.number().nullable(),
  questions: z.number().nullable(),
  deletionQueue: z.number().nullable(),
  questionsByType: z.array(countBucketSchema).nullable(),
  rosterByStatus: z.array(countBucketSchema).nullable(),
});

export type CountBucket = z.infer<typeof countBucketSchema>;
export type DashboardStats = z.infer<typeof dashboardStatsSchema>;

const DASHBOARD_QUERY = `
query Dashboard {
  dashboard {
    pendingApplications
    activeExaminers
    frontendUsers
    staffUsers
    questions
    deletionQueue
    questionsByType { key label count }
    rosterByStatus { key label count }
  }
}
`;

export const dashboardKeys = {
  stats: ["dashboard", "stats"] as const,
};

export function useDashboardStats(enabled = true) {
  return useQuery({
    queryKey: dashboardKeys.stats,
    queryFn: async () => {
      const res = await graphqlRequest<{ dashboard: unknown }>(DASHBOARD_QUERY);
      return dashboardStatsSchema.parse(res.dashboard);
    },
    enabled,
  });
}
