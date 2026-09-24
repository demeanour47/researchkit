/**
 * Sensitivity scenarios, the thesis-ready report, and the project draft update,
 * which changes only the draft's `sampleSizePlan` section.
 */

import { updateProjectDraft, type ResearchProjectDraft } from "./research-project";
import { calculateSampleSize, formatNumber, type SampleSizePlan } from "./sample-size";
import { assumptionsFor } from "./sample-size-assumptions";
import { getSampleSizeMethod, type SampleSizeInputs } from "./sample-size-types";
import { inputProblems } from "./sample-size-validator";

export interface Scenario {
  group: "confidence-margin" | "response" | "proportion";
  label: string;
  inputs: SampleSizeInputs;
  required: number | null;
  adjusted: number | null;
  invite: number | null;
  /** True for the scenario that matches the current inputs. */
  current: boolean;
}

export const SCENARIO_GROUPS: Readonly<Record<Scenario["group"], string>> = {
  "confidence-margin": "Confidence level and margin of error",
  response: "Response rate",
  proportion: "Estimated proportion",
};

const same = (a: SampleSizeInputs, b: SampleSizeInputs) => JSON.stringify(a) === JSON.stringify(b);

/**
 * The same calculation under alternative assumptions, shown together. It describes
 * how the result changes; it never recommends a scenario.
 */
export function sensitivity(plan: SampleSizePlan): Scenario[] {
  if (inputProblems(plan).length > 0 || !getSampleSizeMethod(plan.method).available) return [];
  const scenario = (group: Scenario["group"], label: string, changes: Partial<SampleSizeInputs>): Scenario | null => {
    const inputs = { ...plan.inputs, ...changes };
    const candidate = { ...plan, inputs };
    if (inputProblems(candidate).length > 0) return null;
    const result = calculateSampleSize(candidate);
    return { group, label, inputs, required: result.required, adjusted: result.adjusted, invite: result.invite, current: same(inputs, plan.inputs) };
  };
  const scenarios: (Scenario | null)[] = [];
  for (const confidence of [95, 99] as const) {
    for (const margin of [5, 3]) scenarios.push(scenario("confidence-margin", `${confidence}% confidence, ±${margin}% margin`, { confidence, margin }));
  }
  const rates = [...new Set([...(plan.inputs.responseRate === null ? [] : [plan.inputs.responseRate]), 40, 60, 80, 100])].sort((a, b) => a - b);
  for (const rate of rates) scenarios.push(scenario("response", `${formatNumber(rate, 2)}% response rate`, { responseRate: rate }));
  const proportions = [...new Set([plan.inputs.proportion, 50, 30, 10])].sort((a, b) => b - a);
  for (const proportion of proportions) scenarios.push(scenario("proportion", `${formatNumber(proportion, 2)}% estimated proportion`, { proportion }));
  return scenarios.filter((entry): entry is Scenario => entry !== null);
}

/**
 * The sample size report, in plain text for a thesis or proposal: summary,
 * assumptions, calculation steps, method and limitations. Nothing is added that
 * the calculation or the researcher didn't provide.
 */
export function sampleSizeReport(plan: SampleSizePlan, project: ResearchProjectDraft): string {
  const method = getSampleSizeMethod(plan.method);
  const lines: string[] = ["Sample size", ""];
  const problems = inputProblems(plan);
  const result = problems.length === 0 ? calculateSampleSize(plan) : null;

  lines.push("Summary");
  if (problems.length > 0) lines.push(`The sample size can't be calculated yet: ${problems.map((problem) => problem.message).join(" ")}`);
  else if (!result?.available) lines.push(`${method.name} is not calculated by this tool. ${method.definition}`);
  else {
    const fixed = plan.method === "yamane" || plan.method === "slovin";
    const conditions = fixed
      ? `a ±${formatNumber(plan.inputs.margin, 2)}% margin of error, with the formula's fixed assumptions of 95% confidence and a 50% proportion`
      : `a ${plan.inputs.confidence}% confidence level, a ±${formatNumber(plan.inputs.margin, 2)}% margin of error and an estimated proportion of ${formatNumber(plan.inputs.proportion, 2)}%`;
    const population = plan.inputs.populationType === "finite" ? `a population of ${plan.inputs.populationSize}` : "a very large or unknown population";
    lines.push(`Using the ${method.name}, for ${population}, with ${conditions}, the required sample size is ${result.required}.`);
    if (plan.inputs.designEffect !== 1) lines.push(`Allowing for a design effect of ${formatNumber(plan.inputs.designEffect, 2)}, the adjusted sample size is ${result.adjusted}.`);
    if (result.invite !== null) lines.push(`With an expected response rate of ${formatNumber(plan.inputs.responseRate!, 2)}%, ${result.invite} people will be invited, which should give about ${result.expectedResponses} responses.`);
    if (result.samplingFraction !== null) lines.push(`The sample is ${formatNumber(result.samplingFraction, 1)}% of the population.`);
    lines.push("This figure follows from the assumptions below; different assumptions give different figures.");
  }

  lines.push("", "Assumptions");
  for (const assumption of assumptionsFor(plan, project)) lines.push(`- ${assumption.label}: ${assumption.value} (source: ${assumption.source})`);

  if (result?.available) {
    lines.push("", "Calculation steps");
    result.steps.forEach((step, index) => {
      lines.push(`${index + 1}. ${step.label}`, `   Formula: ${step.formula}`, `   Substitution: ${step.substitution}`);
      for (const value of step.intermediate) lines.push(`   ${value.label}: ${value.value}`);
      lines.push(`   Result: ${formatNumber(step.value)}, used as ${step.rounded}`, `   ${step.explanation}`);
    });
  }

  lines.push("", "Method", `${method.name}: ${method.definition}`, `Formula: ${method.formula}`, ...method.symbols.map((symbol) => `  ${symbol}`));
  if (plan.justification) lines.push("", "Justification", plan.justification);
  lines.push("", "Limitations", ...method.limitations.map((limitation) => `- ${limitation}`), "- The margin of error covers random sampling error only, not bias from non-response or measurement.");
  return lines.join("\n");
}

/** The project draft with its sample size plan replaced. No other field changes. */
export function applySampleSize(project: ResearchProjectDraft, plan: SampleSizePlan): ResearchProjectDraft {
  return updateProjectDraft(project, { sampleSizePlan: plan });
}

/** Everything the Sample Size Calculator can't do, stated on the page. */
export const SAMPLE_SIZE_LIMITATIONS: readonly string[] = [
  "No sample size is universally correct. Each result follows from the assumptions shown; change them and the result changes.",
  "The formulas estimate a proportion. They don't size studies that test hypotheses or compare groups; power analysis is needed for those, and isn't available here yet.",
  "The confidence level and margin of error strictly apply only to random samples, and cover sampling error, not bias.",
  "Estimating a mean needs its standard deviation, which these formulas don't use.",
  "Qualitative studies usually decide sample size by saturation or depth, not by formula.",
  "Nothing is saved. Your plan is lost when you leave the page.",
];

/** Content awaiting review before launch. */
export const SAMPLE_SIZE_REVIEW_ITEMS: readonly string[] = [
  "Statistical review: the methods, their assumptions and limitations, the checks, and the choice to round each step up.",
  "Formula verification: each formula and z-score has been checked against an independent calculation and the published Krejcie and Morgan table, and needs sign-off by a statistician.",
  "References: each method needs its original source and a methods textbook. None have been added yet.",
  "Examples: worked examples for each method, for the guide.",
];
