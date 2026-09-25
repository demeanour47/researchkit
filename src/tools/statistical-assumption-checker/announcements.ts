import type { AssumptionChecklist } from "../../knowledge/research";

/** Everything the Statistical Assumption Checker announces to screen readers. Pure, so it is tested. */

export const announcements = {
  copied: "Checklist copied.",
  copyFailed: "It couldn't be copied automatically. Select it and copy it with Control+C, or Command+C on a Mac.",
} as const;

/** The checklist after a change: how many analyses, and how many assumptions need attention now. Counts describe it; they never grade it. */
export function checklistAnnouncement(checklist: AssumptionChecklist): string {
  const items = checklist.methods.flatMap((method) => method.items);
  const attention = items.filter((item) => item.status === "worth-checking" || item.status === "clarify" || item.status === "missing").length;
  const analyses = `${checklist.methods.length} ${checklist.methods.length === 1 ? "analysis" : "analyses"}`;
  const assumptions = `${items.length} ${items.length === 1 ? "assumption" : "assumptions"}`;
  return `Checklist updated: ${analyses}, ${assumptions}. ${attention === 0 ? "None needs attention from your project yet." : `${attention} ${attention === 1 ? "needs" : "need"} attention now.`}`;
}
