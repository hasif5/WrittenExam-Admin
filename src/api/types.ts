// Shared API types layered on the generated schema.
// Author: Hasif Ahmed (www.hasif.info)

import type { Schemas } from "./client";

export interface Page<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export type UserOut = Schemas["UserOut"];
export type MeOut = Schemas["MeOut"];
export type AccountDeletionRequestOut = Schemas["AccountDeletionRequestOut"];
export type ExaminerApplicationOut = Schemas["ExaminerApplicationOut"];
export type ExaminerRosterOut = Schemas["ExaminerRosterOut"];
export type SectionOut = Schemas["SectionOut"];
export type SubjectOut = Schemas["SubjectOut"];
export type ChapterOut = Schemas["ChapterOut"];
export type QuestionOut = Schemas["QuestionOut"];
export type QuestionAssetOut = Schemas["QuestionAssetOut"];
export type QuestionUsageOut = Schemas["QuestionUsageOut"];
export type AssetOut = Schemas["AssetOut"];
export type MessageResponse = Schemas["MessageResponse"];

export type ApplicationStatus = "pending" | "approved" | "rejected" | "changes_requested";
export type RosterStatus = "pending" | "active" | "suspended";
export type PoolType = "verified_pool" | "certified_senior";
