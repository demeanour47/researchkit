/**
 * How a sampling technique fits the current project: the research question and
 * design, each research onion layer, variables, objectives, hypotheses, framework and
 * population. Each check says why, names the project elements behind it and what to
 * justify. Checks never rank or score techniques.
 */

import { judgeOnionLayer, projectVariables, type CompatibilityStatus } from "./design-compatibility";
import { getDesign } from "./design-types";
import { joinList } from "./question-text";
import { detectQuestionTypes, getQuestionType, type QuestionTypeId } from "./question-types";
import type { ResearchProjectDraft } from "./research-project";
import type { PopulationDefinition } from "./sampling";
import { getTechnique, type SamplingTechnique, type SamplingTechniqueId } from "./sampling-types";
import type { LayerId } from "./types";

export const SAMPLING_CHECK_IDS = [
  "question",
  "design",
  "philosophy",
  "approach",
  "choice",
  "strategy",
  "timeHorizon",
  "variables",
  "objectives",
  "hypotheses",
  "framework",
  "population",
] as const;
export type SamplingCheckId = (typeof SAMPLING_CHECK_IDS)[number];

export const SAMPLING_CHECK_LABELS: Readonly<Record<SamplingCheckId, string>> = {
  question: "Research question",
  design: "Research design",
  philosophy: "Research philosophy",
  approach: "Research approach",
  choice: "Methodological choice",
  strategy: "Research strategy",
  timeHorizon: "Time horizon",
  variables: "Variables",
  objectives: "Objectives",
  hypotheses: "Hypotheses",
  framework: "Conceptual framework",
  population: "Population",
};

export interface SamplingCheck {
  check: SamplingCheckId;
  label: string;
  status: CompatibilityStatus;
  explanation: string;
  supports: string[];
  justify: string | null;
}

const make = (check: SamplingCheckId, status: CompatibilityStatus, explanation: string, supports: string[] = [], justify: string | null = null): SamplingCheck => ({
  check,
  label: SAMPLING_CHECK_LABELS[check],
  status,
  explanation,
  supports,
  justify,
});

const named = (technique: SamplingTechnique) => `${technique.name} sampling`;
const lower = (technique: SamplingTechnique) => `${technique.name.toLowerCase()} sampling`;
const probability = (technique: SamplingTechnique) => technique.category === "probability";

/** Question types that usually need a representative sample, and those that usually don't. */
const MEASURING_QUESTIONS: readonly QuestionTypeId[] = ["descriptive", "comparative", "relational", "correlational", "predictive", "quantitative"];
const EXPLORING_QUESTIONS: readonly QuestionTypeId[] = ["exploratory", "qualitative"];

function questionCheck(technique: SamplingTechnique, project: ResearchProjectDraft): SamplingCheck {
  const question = project.researchQuestion;
  if (!question) return make("question", "review", "Add your research question to see whether this technique suits it.");
  const supports = [`Research question: “${question}”`];
  const types = detectQuestionTypes(question).map((detection) => detection.type);
  const measuring = types.filter((type) => MEASURING_QUESTIONS.includes(type));
  const exploring = types.filter((type) => EXPLORING_QUESTIONS.includes(type));
  const names = (list: QuestionTypeId[]) => joinList(list.map((type) => getQuestionType(type).name.toLowerCase()));
  if (types.includes("mixed-methods") || (measuring.length > 0 && exploring.length > 0)) {
    return make("question", "review", "Your question has a measured part and an exploratory part, which may need different samples. Check which part this technique serves.", supports);
  }
  if (measuring.length > 0) {
    return probability(technique)
      ? make("question", "aligned", `Your question reads as ${names(measuring)}, which usually needs a sample that represents the population, as ${lower(technique)} aims to give.`, supports)
      : make("question", "worth-checking", `Your question reads as ${names(measuring)}, which usually needs a representative sample. ${named(technique)} limits how far results can be generalised.`, supports, "Explain how far your findings will apply beyond your sample.");
  }
  if (exploring.length > 0) {
    return technique.traits.qualitative === "typical" || technique.traits.qualitative === "only"
      ? make("question", "aligned", `Your question reads as ${names(exploring)}, which usually needs participants chosen for their relevance, as ${lower(technique)} allows.`, supports)
      : make("question", "worth-checking", `Your question reads as ${names(exploring)}. Such questions usually need participants chosen for relevance rather than a ${probability(technique) ? "random" : "readily available"} sample.`, supports, `Explain why ${lower(technique)} suits an exploratory question.`);
  }
  return make("question", "review", "The wording of your question doesn't clearly signal what kind of sample it needs.", supports);
}

function designCheck(technique: SamplingTechnique, project: ResearchProjectDraft): SamplingCheck {
  const chosen = project.researchDesign?.chosen;
  if (!chosen) return make("design", "review", "Choose your research design in the Research Design Builder to see how this technique fits it.");
  const design = getDesign(chosen);
  const supports = [`Research design: ${design.name}`];
  if (technique.typicalDesigns.includes(chosen)) {
    return make("design", "aligned", `${named(technique)} is commonly used with ${design.name.toLowerCase()} designs.`, supports);
  }
  if (probability(technique) && design.traits.emphasis === "qualitative") {
    return make("design", "clarify", `${design.name} designs usually choose participants for relevance, not at random, so ${lower(technique)} would be unusual.`, supports, `Explain why a random sample suits a ${design.name.toLowerCase()} design.`);
  }
  if (technique.traits.qualitative === "only") {
    return make("design", "clarify", `${named(technique)} belongs to grounded theory, but your design is ${design.name.toLowerCase()}.`, supports, "Explain how theoretical sampling will work in your design.");
  }
  return make("design", "worth-checking", `${named(technique)} isn't one of the techniques most often used with ${design.name.toLowerCase()} designs.`, supports, `Explain why ${lower(technique)} suits your design.`);
}

function onionCheck(technique: SamplingTechnique, project: ResearchProjectDraft, layer: LayerId, check: SamplingCheckId): SamplingCheck {
  const judgement = judgeOnionLayer(technique.onion, project, layer, { subject: named(technique), plural: false, inSentence: lower(technique) });
  return make(check, judgement.status, judgement.explanation, judgement.supports, judgement.justify);
}

const GROUP_LEVELS = new Set(["nominal", "ordinal", "binary", "categorical", "likert"]);

function variablesCheck(technique: SamplingTechnique, project: ResearchProjectDraft): SamplingCheck {
  const variables = projectVariables(project);
  if (variables.length === 0) return make("variables", "review", "Your project has no variables yet. Add them in the Variables Builder to see how they affect sampling.");
  const supports = variables.map((variable) => `${variable.name} (${variable.kind})`);
  if (technique.traits.needsGroups) {
    const grouping = variables.filter((variable) => variable.level && GROUP_LEVELS.has(variable.level));
    return grouping.length > 0
      ? make("variables", "aligned", `${named(technique)} divides the population into groups. ${joinList(grouping.map((variable) => `“${variable.name}”`))} could define them.`, grouping.map((variable) => `${variable.name} (${variable.kind})`), "Explain which characteristic defines the groups, and why.")
      : make("variables", "worth-checking", `${named(technique)} divides the population into groups by a characteristic, such as year of study. None of your variables is recorded as categorical.`, supports, "Name the characteristic that will define the groups.");
  }
  if (probability(technique)) {
    return make("variables", "aligned", `A random sample lets you estimate your variables' values and relationships across the population.`, supports);
  }
  return make("variables", "review", `${named(technique)} chooses participants for reasons other than your variables. Check that the sample will include enough variety in them.`, supports);
}

function objectivesCheck(technique: SamplingTechnique, project: ResearchProjectDraft): SamplingCheck {
  const objectives = project.researchObjectives ?? [];
  if (objectives.length === 0) return make("objectives", "review", "Add your research objectives to see which of them this technique serves.");
  const matching = objectives.filter((objective) => technique.objectiveCues.test(objective));
  if (matching.length > 0) {
    return make("objectives", "aligned", `${matching.length === 1 ? "An objective uses" : `${matching.length} objectives use`} wording that suits ${lower(technique)}.`, matching.map((objective) => `Objective: “${objective}”`));
  }
  return make("objectives", "worth-checking", `None of your objectives uses wording typical of what ${lower(technique)} is used for.`, [], "Explain which objective this technique serves.");
}

function hypothesesCheck(technique: SamplingTechnique, project: ResearchProjectDraft): SamplingCheck {
  const count = (project.hypotheses ?? []).filter((hypothesis) => hypothesis.role === "alternative").length;
  const supports = count > 0 ? [`${count} alternative ${count === 1 ? "hypothesis" : "hypotheses"}`] : [];
  if (count === 0) {
    return probability(technique)
      ? make("hypotheses", "review", "Your project has no hypotheses. A random sample also suits describing a population without testing hypotheses.")
      : make("hypotheses", "aligned", `Your project has no hypotheses, so ${lower(technique)} isn't limiting any statistical test.`);
  }
  if (probability(technique)) return make("hypotheses", "aligned", "Your hypotheses can be tested statistically on a random sample and the results generalised to the population.", supports);
  if (technique.traits.qualitative === "typical" || technique.traits.qualitative === "only") {
    return make("hypotheses", "clarify", `${named(technique)} is mainly used in qualitative research, which rarely tests hypotheses, but your project has some.`, supports, "Explain how the hypotheses will be tested with this sample.");
  }
  return make("hypotheses", "worth-checking", "Statistical tests of your hypotheses assume a sample the results can be generalised from. A non-random sample limits that.", supports, "Explain how far your test results will apply beyond the sample.");
}

function frameworkCheck(technique: SamplingTechnique, project: ResearchProjectDraft): SamplingCheck {
  const framework = project.conceptualFramework;
  if (!framework) return make("framework", "review", "Your project has no conceptual framework yet.");
  const supports = [`Conceptual framework: ${framework.relationships.length} ${framework.relationships.length === 1 ? "relationship" : "relationships"}`];
  if (technique.traits.qualitative === "only") {
    return make("framework", "review", `${named(technique)} follows the theory as it emerges, so check that a fixed framework won't close off where sampling needs to go.`, supports);
  }
  if (probability(technique) && framework.relationships.length > 0) {
    return make("framework", "aligned", "A random sample lets you estimate the relationships in your framework across the population.", supports);
  }
  return make("framework", "review", `Check that ${lower(technique)} will include enough variety to examine each relationship in your framework.`, supports);
}

const filled = (population: PopulationDefinition | undefined) =>
  population ? Object.values(population).some((value) => (Array.isArray(value) ? value.length > 0 : value !== "")) : false;

function populationCheck(technique: SamplingTechnique, project: ResearchProjectDraft): SamplingCheck {
  const population = project.samplingPlan?.population;
  if (!population || !filled(population)) return make("population", "review", "Define your population below to see how it fits this technique.");
  const supports = [population.targetPopulation && `Target population: ${population.targetPopulation}`, population.samplingFrame && `Sampling frame: ${population.samplingFrame}`].filter(Boolean);
  if (technique.traits.frame !== "none" && !population.samplingFrame) {
    return make(
      "population",
      "clarify",
      technique.traits.frame === "individuals"
        ? `${named(technique)} needs a sampling frame: a list of every member of the population. You haven't described one.`
        : `${named(technique)} needs a list of groups, such as schools or areas, to select from. You haven't described one.`,
      supports,
      "Describe the sampling frame, or consider a technique that doesn't need one.",
    );
  }
  if (!population.targetPopulation) return make("population", "review", "Describe your target population, so the sample can be judged against it.", supports);
  if (["purposive", "judgmental", "theoretical", "consecutive"].includes(technique.id) && population.inclusionCriteria.length === 0) {
    return make("population", "worth-checking", `${named(technique)} depends on clear criteria for who is included. You haven't listed any inclusion criteria.`, supports, "State who is eligible, and why.");
  }
  return make("population", "aligned", technique.traits.frame === "none" ? "Your population is defined, so it is clear who you are looking for." : "Your population and sampling frame are defined.", supports);
}

/** Every compatibility check for a technique, in a fixed order. */
export function checkSamplingCompatibility(id: SamplingTechniqueId, project: ResearchProjectDraft): SamplingCheck[] {
  const technique = getTechnique(id);
  return [
    questionCheck(technique, project),
    designCheck(technique, project),
    onionCheck(technique, project, "philosophy", "philosophy"),
    onionCheck(technique, project, "approach", "approach"),
    onionCheck(technique, project, "choice", "choice"),
    onionCheck(technique, project, "strategy", "strategy"),
    onionCheck(technique, project, "timeHorizon", "timeHorizon"),
    variablesCheck(technique, project),
    objectivesCheck(technique, project),
    hypothesesCheck(technique, project),
    frameworkCheck(technique, project),
    populationCheck(technique, project),
  ];
}

/** Every project element that supports a technique, from checks that look aligned. */
export function samplingSupport(id: SamplingTechniqueId, project: ResearchProjectDraft): string[] {
  return [...new Set(checkSamplingCompatibility(id, project).filter((check) => check.status === "aligned").flatMap((check) => check.supports))];
}
