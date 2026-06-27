// Shared constants: roles, statuses, base URLs.
// Author: Hasif Ahmed (www.hasif.info)

export const API_ORIGIN = (
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000"
).replace(/\/$/, "");

export const API_BASE = `${API_ORIGIN}/api/v1`;

export const REFRESH_TOKEN_STORAGE_KEY = "wep_admin_refresh_token";

export const ALL_ROLES = ["student", "examiner", "pool", "admin", "finance"] as const;
export type RoleCode = (typeof ALL_ROLES)[number];

export const ROLE_LABELS: Record<RoleCode, string> = {
  student: "Student",
  examiner: "Examiner",
  pool: "Internal Evaluator",
  admin: "Admin",
  finance: "Finance",
};

export const QUESTION_TYPES = [
  { value: "broad_written", label: "Broad / Written" },
  { value: "passage", label: "Passage" },
  { value: "passage_with_children", label: "Passage with child questions" },
] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number]["value"];

export const APPLICATION_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "changes_requested", label: "Changes requested" },
] as const;

export const ROSTER_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
] as const;

export const POOL_TYPES = [
  { value: "verified_pool", label: "Verified pool" },
  { value: "certified_senior", label: "Certified / senior" },
] as const;

export const DEFAULT_PAGE_SIZE = 25;
