/**
 * Results a researcher accepts from tools that work them out from the project, such
 * as the analysis plan. Only which methods were accepted is kept; comparing that with
 * what the project leads to now shows whether the saved result is still current.
 */

import type { AssumptionChecklist } from "../research/assumptions/checklist";
import { allRecommendations, type AnalysisPlan } from "../research/data-analysis";
import type { AcceptedMethods } from "../research/research-project";

const sortedUnique = (items: readonly string[]) => [...new Set(items)].sort();

/** The analyses a plan recommends, sorted and without repeats. */
export const planMethods = (plan: AnalysisPlan): string[] => sortedUnique(allRecommendations(plan).map((entry) => entry.recommendation.method));

/** The analyses a checklist covers, sorted and without repeats. */
export const checklistMethods = (checklist: AssumptionChecklist): string[] => sortedUnique(checklist.methods.map((entry) => entry.method));

export type Acceptance = "unsaved" | "saved" | "changed";

/** Whether the project holds these methods: not at all, exactly, or a different set. */
export function acceptance(record: AcceptedMethods | undefined, current: readonly string[]): Acceptance {
  if (!record) return "unsaved";
  return record.methods.length === current.length && record.methods.every((method, index) => method === current[index]) ? "saved" : "changed";
}
