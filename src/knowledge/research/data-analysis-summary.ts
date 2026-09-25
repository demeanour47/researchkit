/**
 * The analysis plan as text, for a thesis proposal's analysis section, and what the
 * recommender can't do.
 */

import type { AnalysisPlan } from "./data-analysis";
import { MEASURE_LABELS } from "./data-analysis-profile";
import { STRENGTH_LABELS, getAnalysisMethod } from "./data-analysis-types";

/** The plan as plain text: what the project says, then each stage's recommendations with their reasons. */
export function analysisPlanText(plan: AnalysisPlan): string {
  const lines = ["Data analysis plan", ""];
  const { profile } = plan;
  lines.push("What the plan is based on");
  lines.push(`- Methodological choice: ${profile.choice === "unknown" ? "not recorded" : profile.choice}`);
  lines.push(`- Research design: ${profile.design?.name ?? "not chosen"}`);
  lines.push(`- Repeated measurements: ${profile.repeated ? `yes (${profile.repeatedSource})` : "no"}`);
  lines.push(`- Planned sample: ${profile.sampleSize ?? "not recorded"}`);
  for (const variable of profile.variables) lines.push(`- ${variable.name} (${variable.kind}): ${MEASURE_LABELS[variable.measure]} [${variable.source}]`);

  for (const stage of plan.stages) {
    lines.push("", stage.title);
    for (const note of stage.notes) lines.push(note);
    for (const question of stage.questions) {
      lines.push("", question.hypothesis ? `${question.title}: ${question.hypothesis}` : question.title);
      for (const note of question.notes) lines.push(`Note: ${note}`);
      for (const recommendation of question.recommendations) {
        lines.push(`- ${getAnalysisMethod(recommendation.method).name}: ${STRENGTH_LABELS[recommendation.strength]}`);
        for (const reason of recommendation.reasons) lines.push(`  Why: ${reason}`);
        if (recommendation.fallback) lines.push(`  If normality doesn't hold: ${getAnalysisMethod(recommendation.fallback).name}`);
        if (recommendation.justify) lines.push(`  To justify: ${recommendation.justify}`);
      }
    }
  }
  if (plan.notes.length > 0) lines.push("", "Notes", ...plan.notes.map((note) => `- ${note}`));
  lines.push("", "These recommendations follow from the project as recorded. Check each method's assumptions against your data before reporting results.");
  return `${lines.join("\n")}\n`;
}

/** Everything the Data Analysis Recommender can't do, stated on the page. */
export const DATA_ANALYSIS_LIMITATIONS: readonly string[] = [
  "Recommendations follow from the project as recorded: its variables, measurement levels, hypotheses, design, sample and approach. If those are missing or wrong, so are the recommendations.",
  "Normality and other assumptions can only be checked once data are collected, so every parametric test comes with its non-parametric alternative.",
  "Rules of thumb for sample size, such as for factor analysis and SEM, are common guidance rather than fixed requirements; the right size depends on the model.",
  "Qualitative analysis, such as thematic analysis, is outside this tool, as are methods it doesn't list, such as multilevel models, multinomial logistic regression and the Friedman test's follow-up comparisons.",
  "The tool doesn't run any analysis or look at data. Use statistical software, and seek statistical advice for complex designs.",
  "It never says a method is wrong: “Needs justification” means the project, as recorded, doesn't obviously support it.",
];

/** Reviews still to come before the tool's guidance is final. */
export const DATA_ANALYSIS_REVIEW_ITEMS: readonly string[] = [
  "Statistical review: every decision rule and the wording of each method's assumptions, by a statistician.",
  "Sample size guidance: the thresholds used for small samples, factor analysis and SEM.",
  "References: sources for each method, after academic review.",
  "Worked examples: complete projects checked against the recommendations.",
];
