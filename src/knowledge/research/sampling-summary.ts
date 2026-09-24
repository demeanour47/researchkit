/**
 * Comparing sampling techniques side by side, the sampling plan as text, and the
 * project draft update, which changes only the draft's `samplingPlan` section.
 */

import { getDesign } from "./design-types";
import { updateProjectDraft, type ResearchProjectDraft } from "./research-project";
import { POPULATION_LABELS, type SamplingPlan } from "./sampling";
import { SAMPLING_CATEGORY_LABELS, getTechnique, type SamplingTechnique, type SamplingTechniqueId } from "./sampling-types";

export const SAMPLING_ASPECTS = [
  { id: "definition", label: "Definition", value: (technique: SamplingTechnique) => technique.definition },
  { id: "category", label: "Category", value: (technique: SamplingTechnique) => SAMPLING_CATEGORY_LABELS[technique.category] },
  { id: "use", label: "Typical use", value: (technique: SamplingTechnique) => technique.whenUsed },
  { id: "strengths", label: "Strengths", value: (technique: SamplingTechnique) => technique.strengths.join(" ") },
  { id: "limitations", label: "Limitations", value: (technique: SamplingTechnique) => technique.limitations.join(" ") },
  { id: "representativeness", label: "Representativeness", value: (technique: SamplingTechnique) => technique.representativeness },
  { id: "bias", label: "Bias risk", value: (technique: SamplingTechnique) => technique.biasRisk },
  { id: "resources", label: "Resources required", value: (technique: SamplingTechnique) => technique.resources },
  { id: "time", label: "Time required", value: (technique: SamplingTechnique) => technique.time },
  { id: "designs", label: "Typical research designs", value: (technique: SamplingTechnique) => technique.typicalDesigns.map((id) => getDesign(id).name).join(", ") },
] as const;

export interface SamplingComparison {
  techniques: { id: SamplingTechniqueId; name: string }[];
  rows: { aspect: (typeof SAMPLING_ASPECTS)[number]["id"]; label: string; values: string[] }[];
}

/** Techniques side by side, one row per aspect, in the order given without repeats. */
export function compareTechniques(ids: readonly SamplingTechniqueId[]): SamplingComparison {
  const techniques = [...new Set(ids)].map(getTechnique);
  return {
    techniques: techniques.map((technique) => ({ id: technique.id, name: technique.name })),
    rows: SAMPLING_ASPECTS.map((aspect) => ({ aspect: aspect.id, label: aspect.label, values: techniques.map(aspect.value) })),
  };
}

const clean = (text: string) => text.replace(/[\t\n\r]+/g, " ");

/** The comparison as tab-separated text, which pastes as a table into word processors and spreadsheets. */
export function samplingComparisonTable(ids: readonly SamplingTechniqueId[]): string {
  const comparison = compareTechniques(ids);
  return [
    ["Aspect", ...comparison.techniques.map((technique) => technique.name)].map(clean).join("\t"),
    ...comparison.rows.map((row) => [row.label, ...row.values].map(clean).join("\t")),
  ].join("\n");
}

/** The sampling plan as plain text, for a methodology chapter or proposal. Only what the researcher entered is included. */
export function samplingPlanText(plan: SamplingPlan): string {
  const lines: string[] = ["Sampling plan", ""];
  const add = (label: string, value: string) => {
    if (value) lines.push(`${label}: ${value}`);
  };
  const { population } = plan;
  for (const key of ["targetPopulation", "accessiblePopulation", "samplingFrame", "unitOfAnalysis", "unitOfObservation", "geographicalCoverage", "samplingLocation"] as const) {
    add(POPULATION_LABELS[key], population[key]);
  }
  add(POPULATION_LABELS.inclusionCriteria, population.inclusionCriteria.join("; "));
  add(POPULATION_LABELS.exclusionCriteria, population.exclusionCriteria.join("; "));
  add("Sampling technique", plan.chosen ? `${getTechnique(plan.chosen).name} sampling (${SAMPLING_CATEGORY_LABELS[getTechnique(plan.chosen).category].toLowerCase()})` : "");
  add("Reason", plan.reason);
  add("Selection procedure", plan.selectionProcedure);
  add("Expected response rate", plan.expectedResponseRate === null ? "" : `${plan.expectedResponseRate}%`);
  add("Potential biases", plan.potentialBiases);
  add("Mitigation", plan.mitigation);
  add("Notes", plan.notes);
  return lines.join("\n");
}

/** The project draft with its sampling plan replaced. No other field changes. */
export function applySampling(project: ResearchProjectDraft, plan: SamplingPlan): ResearchProjectDraft {
  return updateProjectDraft(project, { samplingPlan: plan });
}

/** Everything the Sampling Technique Builder can't do, stated on the page. */
export const SAMPLING_LIMITATIONS: readonly string[] = [
  "It never chooses a sampling technique for you. Answers narrow the explanations; the choice and its reason are yours.",
  "It doesn't calculate sample size. That needs a sample size calculation for your analysis, which a later tool will provide.",
  "Compatibility checks compare your project's wording and choices with typical practice. They can't judge whether you can actually reach your population, or whether your approach is ethical.",
  "Some terms are used differently by different authors: judgmental and purposive sampling, for example, are often treated as the same technique.",
  "Nothing is saved. Your plan is lost when you leave the page.",
];

/** Content awaiting review before launch. */
export const SAMPLING_REVIEW_ITEMS: readonly string[] = [
  "Academic review: the definitions, strengths, limitations and assumptions of each technique.",
  "Sampling methodology review: the typical designs, research onion choices and decision-assistant traits for each technique, and the plan checks.",
  "Examples: each technique's example, typical sample sizes, time and resource descriptions.",
  "References: each technique needs references from the methodology literature. None have been added yet.",
];
