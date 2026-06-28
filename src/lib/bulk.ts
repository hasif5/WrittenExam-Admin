// Shared helper to apply a per-item async action across a bulk selection,
// tallying successes/failures and surfacing one consolidated toast. Runs
// sequentially so a multi-row operation does not stampede the backend.
// File: src/lib/bulk.ts
// Author: Hasif Ahmed <xmart@live.com> (www.hasif.info)
// Created: 2026-06-27

import { notifyError, notifySuccess } from "./notify";

export async function runBulk<T>(
  items: T[],
  action: (item: T) => Promise<unknown>,
): Promise<{ ok: number; failed: number }> {
  let ok = 0;
  let failed = 0;
  for (const item of items) {
    try {
      await action(item);
      ok += 1;
    } catch {
      failed += 1;
    }
  }
  return { ok, failed };
}

// Run a bulk action and report the outcome with a single notification.
export async function runBulkWithToast<T>(
  items: T[],
  action: (item: T) => Promise<unknown>,
  labels: { noun: string; verbPast: string },
): Promise<{ ok: number; failed: number }> {
  const result = await runBulk(items, action);
  const { ok, failed } = result;
  if (failed === 0) {
    notifySuccess(`${ok} ${labels.noun} ${labels.verbPast}.`);
  } else if (ok === 0) {
    notifyError(new Error(`Could not ${labels.verbPast} any ${labels.noun}.`), "Bulk action failed");
  } else {
    notifyError(
      new Error(`${ok} ${labels.noun} ${labels.verbPast}, ${failed} failed.`),
      "Partly applied",
    );
  }
  return result;
}
