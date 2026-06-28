// Minimal GraphQL request helper for the scoped read-only reporting/dashboard
// endpoint. Rides the existing typed REST client (Bearer auth + single-flight
// refresh-on-401), so there is no second auth path and no extra GraphQL client
// library. Reusable by any future reporting query hook.
// File: src/api/graphql.ts
// Author: Hasif Ahmed <xmart@live.com> (www.hasif.info)
// Created: 2026-06-28

import { api } from "@/api/client";
import { ApiError } from "@/lib/errors";

interface GraphQLError {
  message: string;
}

interface GraphQLResponse<T> {
  data?: T | null;
  errors?: GraphQLError[];
}

/**
 * Execute a GraphQL query against `/graphql`. Unwraps `{ data, errors }`,
 * surfacing GraphQL-level errors and an empty/missing payload as `ApiError` so
 * callers handle failures the same way they handle REST errors.
 */
export async function graphqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const body: { query: string; variables?: Record<string, unknown> } = { query };
  if (variables) body.variables = variables;

  const res = await api.post<GraphQLResponse<T>>("/graphql", { body });

  if (res.errors && res.errors.length > 0) {
    throw new ApiError(200, "graphql_error", res.errors[0].message, res.errors);
  }
  if (res.data === undefined || res.data === null) {
    throw new ApiError(200, "graphql_empty", "GraphQL response contained no data.", res);
  }
  return res.data;
}
