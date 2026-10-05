/**
 * The homepage's two-question introduction to choosing a test. It asks the
 * Statistical Test Finder's own decision logic, so it can't disagree with the
 * tool; it just fixes the questions the finder would ask next, and says so.
 */

import type { AnalysisMethodId } from "../research/data-analysis-types";
import { findTests } from "../research/test-finder/finder";
import type { FinderAnswers } from "../research/test-finder/questions";

export const DEMO_COMPARISONS = [
  { value: "two-independent", label: "Two separate groups" },
  { value: "three-independent", label: "Three or more separate groups" },
  { value: "paired", label: "The same people, measured twice" },
] as const;

export const DEMO_OUTCOMES = [
  { value: "numeric", label: "A number, such as a score" },
  { value: "categorical", label: "A category, such as pass or fail" },
] as const;

export type DemoComparison = (typeof DEMO_COMPARISONS)[number]["value"];
export type DemoOutcome = (typeof DEMO_OUTCOMES)[number]["value"];

/** What the demo assumes on the researcher's behalf; the real finder asks about each. */
export const DEMO_ASSUMPTIONS = "It assumes the data are roughly normally distributed, and that you have no covariate and no second grouping variable. The Statistical Test Finder asks about all of these.";

export function demoAnswers(comparison: DemoComparison, outcome: DemoOutcome): FinderAnswers {
  const outcomeLevel = outcome === "numeric" ? "interval" : "nominal";
  if (comparison === "paired") return { purpose: "compare", comparison: "paired", outcomeLevel, measurements: "two", normality: "yes" };
  return {
    purpose: "compare",
    comparison: "independent",
    outcomeLevel,
    groups: comparison === "two-independent" ? "two" : "three-plus",
    secondFactor: "no",
    covariate: "no",
    normality: "yes",
  };
}

export type DemoSuggestion = { status: "suggestion"; methods: AnalysisMethodId[] } | { status: "open-finder" };

/** The tests the finder marks as commonly used for the answers, or a pointer to the finder itself. */
export function demoSuggestion(comparison: DemoComparison, outcome: DemoOutcome): DemoSuggestion {
  // The finder has no common paired test for categories, so the demo hands over to it.
  if (comparison === "paired" && outcome === "categorical") return { status: "open-finder" };
  const result = findTests(demoAnswers(comparison, outcome));
  if (result.status !== "complete") return { status: "open-finder" };
  const methods = result.candidates.filter((candidate) => candidate.fit === "common").map((candidate) => candidate.method);
  return methods.length > 0 ? { status: "suggestion", methods } : { status: "open-finder" };
}
