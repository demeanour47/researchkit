/** The checklist and method guides as text, and what the assumption checker can't do. */

import { STRENGTH_LABELS, getAnalysisMethod } from "../data-analysis-types";
import { CHECK_STATUS_LABELS } from "../hypothesis-checks";
import { ASSUMPTIONS } from "./catalogue";
import type { AssumptionChecklist } from "./checklist";
import { METHOD_GUIDES, type AssumptionMethod } from "./methods";

/** The project's checklist as plain text, method by method. */
export function checklistText(checklist: AssumptionChecklist): string {
  const lines = ["Assumptions to check before analysis", ""];
  if (checklist.methods.length === 0) lines.push("No analyses to check yet.");
  for (const method of checklist.methods) {
    lines.push(`${getAnalysisMethod(method.method).name} (${STRENGTH_LABELS[method.strength]}; for ${method.questions.join(", ")})`);
    for (const item of method.items) lines.push(`- ${ASSUMPTIONS[item.assumption].name}: ${CHECK_STATUS_LABELS[item.status]}. ${item.note}`);
    lines.push("");
  }
  if (checklist.notes.length > 0) lines.push("Notes", ...checklist.notes.map((note) => `- ${note}`));
  return `${lines.join("\n").trimEnd()}\n`;
}

/** One method's assumptions in full, as plain text. */
export function methodGuideText(method: AssumptionMethod): string {
  const guide = METHOD_GUIDES[method];
  const lines = [getAnalysisMethod(method).name, ""];
  for (const id of guide.assumptions) {
    const assumption = ASSUMPTIONS[id];
    lines.push(assumption.name, assumption.statement, `Why it matters: ${assumption.why}`, "How to check:", ...assumption.howToCheck.map((item) => `- ${item}`), "Thresholds:", ...assumption.thresholds.map((item) => `- ${item}`), `If violated: ${assumption.ifViolated}`, "What to do instead:", ...assumption.remedies.map((item) => `- ${item}`), "");
  }
  if (guide.alternatives.length > 0) lines.push("Alternatives", ...guide.alternatives.map((alternative) => `- ${alternative.name}: ${alternative.when}`), "");
  if (guide.nonParametric.length > 0) lines.push("Non-parametric alternatives", ...guide.nonParametric.map((alternative) => `- ${alternative.name}: ${alternative.when}`), "");
  lines.push("Reporting", guide.reporting, "", "Common mistakes", ...guide.mistakes.map((mistake) => `- ${mistake}`));
  return `${lines.join("\n")}\n`;
}

/** Everything the Statistical Assumption Checker can't do, stated on the page. */
export const ASSUMPTION_LIMITATIONS: readonly string[] = [
  "The checker doesn't test assumptions or look at data. It explains what to check, and judges only what your project draft already shows, such as measurement levels, repeated measurement, clustering and planned sample size.",
  "Thresholds are conventions that differ between textbooks and fields; the ones given are commonly used, not fixed rules.",
  "Formal tests such as Shapiro–Wilk and Levene's depend on sample size: large samples flag trivial departures and small samples miss real ones. Use plots alongside them.",
  "Analyses come from the plan the Data Analysis Recommender makes from your project; if the project is incomplete, so is the checklist.",
  "Reporting examples use illustrative numbers; replace them with your own results.",
];

/** Reviews still to come before the tool's guidance is final. */
export const ASSUMPTION_REVIEW_ITEMS: readonly string[] = [
  "Statistical review: every assumption, threshold, remedy and alternative, by a statistician.",
  "Threshold review: the conventions cited, which vary between textbooks.",
  "References: sources for each assumption and threshold, after academic review.",
  "Reporting style review: the reporting examples against APA and other common styles.",
];
