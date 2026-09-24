/**
 * Explanations in two levels: a summary shown straight away, and "learn more"
 * detail for readers who want it.
 */

import { findOption } from "./research-onion";
import { getReference } from "./references";
import type { AlternativeView, Judgement, Reference } from "./types";

export interface OptionExplanation {
  summary: string;
  whyUsed: string;
  strengths: readonly string[];
  limitations: readonly string[];
  learnMore: {
    examples: readonly string[];
    mistakes: readonly string[];
    furtherReading: Reference[];
  };
}

export interface JudgementExplanation {
  summary: string;
  justify: string | null;
  learnMore: {
    alternativeView: (AlternativeView & { references: Reference[] }) | null;
    evidence: Reference[];
  };
}

/** The explanation of an option. Throws for an unknown id. */
export function explainOption(id: string): OptionExplanation {
  const option = findOption(id);
  if (!option) throw new RangeError(`Unknown option: ${id}`);
  return {
    summary: option.definition,
    whyUsed: option.whyUsed,
    strengths: option.strengths,
    limitations: option.limitations,
    learnMore: {
      examples: option.examples,
      mistakes: option.mistakes,
      furtherReading: option.references.map(getReference),
    },
  };
}

/** The explanation of a fit judgement, with its sources resolved. */
export function explainJudgement(judgement: Judgement): JudgementExplanation {
  const view = judgement.alternativeView;
  return {
    summary: judgement.reason,
    justify: judgement.justify,
    learnMore: {
      alternativeView: view ? { ...view, references: view.sources.map(getReference) } : null,
      evidence: judgement.evidence.sources.map(getReference),
    },
  };
}
