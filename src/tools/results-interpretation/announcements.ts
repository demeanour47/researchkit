import { HYPOTHESIS_STATUS_LABELS, levelPercent, type ResultInterpretation } from "../../knowledge/research";

/** Everything the Results Interpretation Assistant announces to screen readers. Pure, so it is tested. */

export const announcements = {
  copied: "Interpretation copied.",
  copyFailed: "It couldn't be copied automatically. Select it and copy it with Control+C, or Command+C on a Mac.",
} as const;

/** What the interpretation found, in one sentence. */
export function interpretedAnnouncement(interpretation: ResultInterpretation, alpha: number): string {
  const significance =
    interpretation.significance.status === "significant"
      ? `statistically significant at the ${levelPercent(alpha)} level`
      : interpretation.significance.status === "not-significant"
        ? `not statistically significant at the ${levelPercent(alpha)} level`
        : "descriptive, with no significance test";
  const hypothesis = interpretation.hypothesis.label ? ` ${HYPOTHESIS_STATUS_LABELS[interpretation.hypothesis.status]}: ${interpretation.hypothesis.label}.` : "";
  return `${interpretation.name} interpreted: ${significance}.${hypothesis}`;
}

/** How many problems stop the interpretation, pointing to the first. */
export function problemsAnnouncement(messages: readonly string[]): string {
  if (messages.length === 0) return "";
  return `${messages.length} ${messages.length === 1 ? "problem stops" : "problems stop"} the interpretation. ${messages[0]}`;
}
