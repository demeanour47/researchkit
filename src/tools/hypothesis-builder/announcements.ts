/**
 * Everything the Hypothesis Builder announces to screen readers. Pure functions, so
 * they are tested; announcements never give scores or counts of passed checks.
 */

import { CHECK_STATUS_LABELS, DIRECTION_LABELS, type CheckStatus, type Direction, type HypothesisForm } from "../../knowledge/research";

const FORM_NAMES: Readonly<Record<HypothesisForm, string>> = {
  difference: "Difference",
  relationship: "Relationship",
  prediction: "Prediction",
};

export const announcements = {
  drafted: (form: HypothesisForm, direction: Direction, pairs: number) =>
    `${FORM_NAMES[form]} hypotheses, ${DIRECTION_LABELS[direction].toLowerCase()}. ${pairs} ${pairs === 1 ? "pair" : "pairs"} drafted.`,
  restored: (label: string) => `Generated drafts restored for ${label}.`,
  copied: (subject: string) => `${subject.charAt(0).toUpperCase()}${subject.slice(1)} copied.`,
  copyFailed: (subject: string) => `The ${subject} couldn't be copied automatically. Select the text and press Control+C, or Command+C on a Mac.`,
} as const;

/** Statuses that ask the researcher to look again, in the order they should be read. */
const NEEDS_LOOK: readonly CheckStatus[] = ["missing", "clarify", "worth-checking"];

/**
 * A summary of an evaluation for screen readers. It names which labels to look for,
 * never how many checks passed.
 */
export function evaluationAnnouncement(statuses: readonly CheckStatus[]): string {
  const present = NEEDS_LOOK.filter((status) => statuses.includes(status));
  if (statuses.length === 0) return "";
  if (present.length === 0) return "Evaluation updated. Every check looks aligned or is for you to review.";
  const labels = present.map((status) => `“${CHECK_STATUS_LABELS[status]}”`);
  const list = labels.length === 1 ? labels[0] : `${labels.slice(0, -1).join(", ")} or ${labels[labels.length - 1]}`;
  return `Evaluation updated. Look for items marked ${list}.`;
}
