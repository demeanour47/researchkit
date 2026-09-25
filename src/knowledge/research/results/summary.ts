/** An interpretation as text, for pasting into a results chapter draft, and what the assistant can't do. */

import { HYPOTHESIS_STATUS_LABELS, type ResultInterpretation } from "./context";
import { statisticText } from "./format";

export function interpretationText(interpretation: ResultInterpretation): string {
  const lines = [interpretation.name, "", "What the statistic means", interpretation.meaning, ""];
  lines.push("The numbers", ...interpretation.statistics.map((line) => `- ${statisticText(line.symbol, line.value)}: ${line.meaning}`), "");
  lines.push("Statistical significance", interpretation.significance.statement, interpretation.significance.meaning, "");
  if (interpretation.magnitude) lines.push("Size of the effect", `${interpretation.magnitude.label.charAt(0).toUpperCase()}${interpretation.magnitude.label.slice(1)} (${interpretation.magnitude.convention})`, "");
  lines.push("In plain language", interpretation.plain, "", "Academic interpretation", interpretation.academic, "", "Possible implication", interpretation.implication, "");
  lines.push("Connection with the hypothesis", `${HYPOTHESIS_STATUS_LABELS[interpretation.hypothesis.status]}. ${interpretation.hypothesis.explanation}`, "");
  lines.push("Connection with the objectives", ...interpretation.objectives, "", "Connection with the research question", interpretation.researchQuestion, "", "In your analysis plan", interpretation.plan, "");
  if (interpretation.warnings.length > 0) lines.push("Check these", ...interpretation.warnings.map((warning) => `- ${warning}`), "");
  lines.push("Limitations", ...interpretation.limitations.map((limitation) => `- ${limitation}`), "", "Common mistakes to avoid", ...interpretation.mistakes.map((mistake) => `- ${mistake}`));
  return `${lines.join("\n")}\n`;
}

/** Everything the Results Interpretation Assistant can't do, stated on the page. */
export const RESULTS_LIMITATIONS: readonly string[] = [
  "The assistant doesn't calculate statistics or read data. It explains numbers you enter from your statistics software, and can only be as right as those numbers.",
  "Effect size labels and cut-offs, such as Cohen's conventions and fit-index thresholds, are rules of thumb; what counts as large depends on your field.",
  "Significance is judged as p below your chosen level. It doesn't account for multiple testing: if you run many tests, adjust the level or the p-values first.",
  "Links to hypotheses, objectives and the research question are made by matching variable names; check each one.",
  "Wording is a starting point for your results chapter, not text to submit unchanged. Check it against your institution's style guide.",
];

/** Reviews still to come before the tool's guidance is final. */
export const RESULTS_REVIEW_ITEMS: readonly string[] = [
  "Statistical review: every interpretation, threshold and warning, by a statistician.",
  "Reporting style review: the academic sentences against APA and other common styles.",
  "References: sources for the effect size conventions and fit-index cut-offs, after academic review.",
  "Worked examples: published results checked against the interpretations.",
];
