/**
 * The assumptions behind a sample size, each traced to the project information it
 * comes from, and values the project can supply so they don't need retyping.
 */

import type { ResearchProjectDraft } from "./research-project";
import { formatNumber, type SampleSizePlan } from "./sample-size";
import { zScore } from "./sample-size-formulas";
import { INPUT_INFO, getSampleSizeMethod } from "./sample-size-types";
import { getTechnique } from "./sampling-types";
import { getDesign } from "./design-types";

export interface Assumption {
  id: string;
  label: string;
  value: string;
  /** Where the value comes from: project information, or the researcher's own choice. */
  source: string;
  explanation: string;
}

export function assumptionsFor(plan: SampleSizePlan, project: ResearchProjectDraft): Assumption[] {
  const { inputs } = plan;
  const method = getSampleSizeMethod(plan.method);
  const sampling = project.samplingPlan;
  const fixed = plan.method === "yamane" || plan.method === "slovin";
  const list: Assumption[] = [];

  if (project.researchQuestion) {
    list.push({ id: "question", label: "Research question", value: project.researchQuestion, source: "Research question", explanation: "The sample size is for answering this question." });
  }
  list.push({
    id: "population",
    label: INPUT_INFO.populationSize.label,
    value: inputs.populationType === "finite" && inputs.populationSize !== null ? String(inputs.populationSize) : "Unknown or very large",
    source: sampling?.population.samplingFrame ? `Sampling plan: sampling frame, “${sampling.population.samplingFrame}”` : sampling?.population.targetPopulation ? `Sampling plan: target population, “${sampling.population.targetPopulation}”` : "Your entry",
    explanation: inputs.populationType === "finite" ? INPUT_INFO.finite.whenMatters : INPUT_INFO.unknown.whenMatters,
  });
  list.push({
    id: "confidence",
    label: INPUT_INFO.confidence.label,
    value: fixed ? "95% (fixed by the formula)" : `${inputs.confidence}% (z = ${formatNumber(zScore(inputs.confidence), 6)})`,
    source: fixed ? `${method.name}` : "Your choice",
    explanation: INPUT_INFO.confidence.meaning,
  });
  list.push({ id: "margin", label: INPUT_INFO.margin.label, value: `±${formatNumber(inputs.margin, 2)}%`, source: "Your choice", explanation: INPUT_INFO.margin.meaning });
  const estimating = (project.researchObjectives ?? []).find((objective) => /\b(prevalence|proportion|percentage|estimat\w*)\b/i.test(objective));
  list.push({
    id: "proportion",
    label: INPUT_INFO.proportion.label,
    value: fixed ? "50% (fixed by the formula)" : `${formatNumber(inputs.proportion, 2)}%`,
    source: estimating ? `Objective: “${estimating}”` : "Your choice",
    explanation: inputs.proportion === 50 || fixed ? "50% gives the largest, most cautious sample when the true proportion isn't known." : "A prior estimate from previous studies or a pilot; cite where it comes from.",
  });
  list.push({
    id: "response",
    label: INPUT_INFO.responseRate.label,
    value: inputs.responseRate === null ? "Not set" : `${formatNumber(inputs.responseRate, 2)}%`,
    source: sampling?.expectedResponseRate !== null && sampling?.expectedResponseRate !== undefined && sampling.expectedResponseRate === inputs.responseRate ? "Sampling plan: expected response rate" : "Your entry",
    explanation: INPUT_INFO.responseRate.limitations,
  });
  const technique = sampling?.chosen ? getTechnique(sampling.chosen) : null;
  list.push({
    id: "design-effect",
    label: INPUT_INFO.designEffect.label,
    value: formatNumber(inputs.designEffect, 2),
    source: technique ? `Sampling plan: ${technique.name.toLowerCase()} sampling` : "Your entry",
    explanation: technique && technique.traits.frame === "clusters" ? "Your technique samples groups, which usually needs a design effect above 1." : INPUT_INFO.designEffect.meaning,
  });
  list.push({
    id: "random",
    label: "Random sampling",
    value: technique ? (technique.category === "probability" ? "Assumed, and your technique is random" : "Assumed, but your technique isn't random") : "Assumed",
    source: technique ? `Sampling plan: ${technique.name.toLowerCase()} sampling` : "The formulas' own assumption",
    explanation: "The confidence level and margin of error only strictly apply to random samples.",
  });
  const dependent = (project.variables ?? []).filter((variable) => variable.variableType === "dependent").map((variable) => variable.name);
  if (dependent.length > 0) {
    list.push({ id: "outcome", label: "Outcome estimated", value: dependent.join(", "), source: "Variables: dependent variables", explanation: "The formulas estimate a proportion of this outcome." });
  }
  if (project.researchDesign?.chosen) {
    list.push({ id: "design", label: "Research design", value: getDesign(project.researchDesign.chosen).name, source: "Research design", explanation: "The design determines whether estimating a proportion is the right basis for the sample." });
  }
  return list;
}

/** Values the project already holds that can fill inputs, so nothing needs retyping. */
export function suggestedInputs(project: ResearchProjectDraft): { responseRate: number | null } {
  return { responseRate: project.samplingPlan?.expectedResponseRate ?? null };
}
