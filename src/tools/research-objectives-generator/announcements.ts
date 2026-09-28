/**
 * Everything the Research Objectives Generator announces to screen readers. Pure
 * functions, so they are tested; announcements never give scores or counts of
 * passed checks.
 */

import { CHECK_STATUS_LABELS, type CheckStatus } from "../../knowledge/research";

export const announcements = {
  categoryChosen: (name: string) => `${name} category chosen.`,
  draftUsed: "Draft copied into your general objective. Edit it in your own words.",
  outlineAdded: "Starting point added as a specific objective.",
  objectiveAdded: "Specific objective added.",
  objectiveRemoved: (position: number) => `Objective ${position} removed.`,
  objectiveDuplicated: (position: number) => `Objective ${position} duplicated.`,
  objectiveMoved: (position: number, total: number) => `Objective moved to position ${position} of ${total}.`,
  copied: (subject: string) => `${subject.charAt(0).toUpperCase()}${subject.slice(1)} copied.`,
  copyFailed: (subject: string) => `The ${subject} couldn't be copied automatically. Select the text and press Control+C, or Command+C on a Mac.`,
} as const;

/** The new position of an item moved one step, or null if it can't move that way. */
export function stepPosition(index: number, total: number, direction: -1 | 1): number | null {
  const next = index + direction;
  return next < 0 || next >= total ? null : next;
}

/** Statuses that ask the researcher to look again, in the order they should be read. */
const NEEDS_LOOK: readonly CheckStatus[] = ["missing", "clarify", "worth-checking"];

/**
 * A summary of an evaluation for screen readers. It names which labels to look for,
 * never how many checks passed.
 */
export function evaluationAnnouncement(statuses: readonly CheckStatus[]): string {
  const present = NEEDS_LOOK.filter((status) => statuses.includes(status));
  if (statuses.length === 0) return "";
  if (present.length === 0) return "Checks updated. Every check looks aligned or is for you to review.";
  const labels = present.map((status) => `“${CHECK_STATUS_LABELS[status]}”`);
  const list = labels.length === 1 ? labels[0] : `${labels.slice(0, -1).join(", ")} or ${labels[labels.length - 1]}`;
  return `Checks updated. Look for items marked ${list}.`;
}
