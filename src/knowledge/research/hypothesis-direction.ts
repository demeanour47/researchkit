/**
 * The direction of a hypothesis: what each choice means, and what direction a
 * hypothesis's wording actually states, so the two can be compared.
 */

import type { Direction, HypothesisForm } from "./hypothesis-types";

export const DIRECTION_LABELS: Readonly<Record<Direction, string>> = {
  "non-directional": "Non-directional",
  positive: "Directional: higher or positive",
  negative: "Directional: lower or negative",
};

/** What each direction means for each form, in plain words. */
export function describeDirection(form: HypothesisForm, direction: Direction): string {
  if (direction === "non-directional") return "The hypothesis states that an effect exists, without saying which way it goes.";
  const up = direction === "positive";
  switch (form) {
    case "difference":
      return `The hypothesis states that the outcome is ${up ? "higher" : "lower"} in one named group than in the other.`;
    case "relationship":
      return `The hypothesis states that as one variable increases, the other ${up ? "increases" : "decreases"}.`;
    case "prediction":
      return `The hypothesis states that higher values of the predictor go with ${up ? "higher" : "lower"} values of the outcome.`;
  }
}

/** What the wording of a hypothesis says about direction. "mixed" means it uses words for both directions. */
export type DirectionReading = Direction | "mixed";

const POSITIVE = /\b(positive(ly)?|increas(e|es|ed|ing)|higher|greater|more|improv(e|es|ed|ing))\b/i;
const NEGATIVE = /\b(negative(ly)?|decreas(e|es|ed|ing)|lower|less|fewer|reduc(e|es|ed|ing)|declin(e|es|ed|ing)|worse)\b/i;

/**
 * The direction the wording states. "Higher" and "lower" can appear together in a
 * directional hypothesis ("higher X predicts lower Y"), so a hypothesis that pairs
 * "higher" with one opposite word is read by its outcome word.
 */
export function readDirection(text: string): DirectionReading {
  const pairing = /\bhigher\b.+?\b(higher|lower)\b/i.exec(text);
  if (pairing) return pairing[1].toLowerCase() === "higher" ? "positive" : "negative";
  const positive = POSITIVE.test(text);
  const negative = NEGATIVE.test(text);
  if (positive && negative) return "mixed";
  if (positive) return "positive";
  if (negative) return "negative";
  return "non-directional";
}
