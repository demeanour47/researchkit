/**
 * Null hypotheses: their wording for each form, and how a null hypothesis should
 * mirror its alternative. A null states the absence of the effect the alternative
 * states, about exactly the same variables, population and context.
 */

import type { HypothesisForm } from "./hypothesis-types";
import { capitalise, containsPhrase } from "./question-text";

/** The parts of a sentence a null hypothesis needs, already worded. */
export interface NullParts {
  independent: string;
  dependent: string;
  /** Population, context and controls, such as " among nurses in Kenya, after controlling for age". */
  scope: string;
}

export function nullWording(form: HypothesisForm, { independent, dependent, scope }: NullParts): string {
  switch (form) {
    case "difference":
      return `There is no difference in ${dependent} between groups defined by ${independent}${scope}.`;
    case "relationship":
      return `There is no relationship between ${independent} and ${dependent}${scope}.`;
    case "prediction":
      return `${capitalise(independent)} does not predict ${dependent}${scope}.`;
  }
}

export function moderationNullWording(moderator: string, parts: NullParts): string {
  return `${capitalise(moderator)} does not moderate the relationship between ${parts.independent} and ${parts.dependent}${parts.scope}.`;
}

export function mediationNullWording(mediator: string, parts: NullParts): string {
  return `The relationship between ${parts.independent} and ${parts.dependent} is not mediated by ${mediator}${parts.scope}.`;
}

const NEGATION = /\b(no|not|does not|do not|doesn't|don't|none|neither|nor|unrelated)\b/i;

/** Whether the wording states the absence of an effect. */
export const statesAbsence = (text: string) => NEGATION.test(text);

export interface PairIssue {
  /** Which rule the pair breaks, for tests and future tools. */
  issue: "null-not-negative" | "alternative-negative" | "variables-differ";
  explanation: string;
}

/**
 * How a null and an alternative hypothesis fit together. An empty result means the
 * wording mirrors correctly; each issue says what to check.
 */
export function checkNullAlternative(nullText: string, alternativeText: string, variables: readonly string[]): PairIssue[] {
  const issues: PairIssue[] = [];
  if (nullText.trim() && !statesAbsence(nullText)) {
    issues.push({
      issue: "null-not-negative",
      explanation: "The null hypothesis should state that there is no effect, difference or relationship, for example with “no” or “does not”.",
    });
  }
  if (alternativeText.trim() && statesAbsence(alternativeText)) {
    issues.push({
      issue: "alternative-negative",
      explanation: "The alternative hypothesis uses a word such as “no” or “not”. It should state that the effect, difference or relationship exists.",
    });
  }
  const differing = variables.filter((variable) => containsPhrase(nullText, variable) !== containsPhrase(alternativeText, variable));
  if (differing.length > 0) {
    issues.push({
      issue: "variables-differ",
      explanation: `The two hypotheses don't name the same variables (${differing.map((variable) => `“${variable}”`).join(", ")}). A null hypothesis should mirror its alternative exactly.`,
    });
  }
  return issues;
}
