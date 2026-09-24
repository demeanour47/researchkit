/**
 * The sampling plan stored in the project draft: the population definition, the
 * techniques being considered, the one the researcher chose (only by their own
 * action), and how sampling will be carried out.
 */

import { validateSamplingAnswers, type SamplingAnswers, type SamplingQuestionId } from "./sampling-decision";
import { isTechniqueId, type SamplingTechniqueId } from "./sampling-types";

export interface PopulationDefinition {
  targetPopulation: string;
  accessiblePopulation: string;
  samplingFrame: string;
  unitOfAnalysis: string;
  unitOfObservation: string;
  geographicalCoverage: string;
  inclusionCriteria: readonly string[];
  exclusionCriteria: readonly string[];
  samplingLocation: string;
}

export interface SamplingPlan {
  population: PopulationDefinition;
  /** The technique the researcher chose, or null until they choose. */
  chosen: SamplingTechniqueId | null;
  shortlist: readonly SamplingTechniqueId[];
  reason: string;
  selectionProcedure: string;
  /** The expected response rate, as a percentage from 0 to 100, or null if not known. */
  expectedResponseRate: number | null;
  potentialBiases: string;
  mitigation: string;
  notes: string;
  answers: SamplingAnswers;
}

export const EMPTY_POPULATION: PopulationDefinition = {
  targetPopulation: "",
  accessiblePopulation: "",
  samplingFrame: "",
  unitOfAnalysis: "",
  unitOfObservation: "",
  geographicalCoverage: "",
  inclusionCriteria: [],
  exclusionCriteria: [],
  samplingLocation: "",
};

export const EMPTY_SAMPLING_PLAN: SamplingPlan = {
  population: EMPTY_POPULATION,
  chosen: null,
  shortlist: [],
  reason: "",
  selectionProcedure: "",
  expectedResponseRate: null,
  potentialBiases: "",
  mitigation: "",
  notes: "",
  answers: {},
};

export const POPULATION_LABELS: Readonly<Record<keyof PopulationDefinition, string>> = {
  targetPopulation: "Target population",
  accessiblePopulation: "Accessible population",
  samplingFrame: "Sampling frame",
  unitOfAnalysis: "Unit of analysis",
  unitOfObservation: "Unit of observation",
  geographicalCoverage: "Geographical coverage",
  inclusionCriteria: "Inclusion criteria",
  exclusionCriteria: "Exclusion criteria",
  samplingLocation: "Sampling location",
};

function check(id: SamplingTechniqueId) {
  if (!isTechniqueId(id)) throw new RangeError(`Unknown sampling technique: ${id}`);
}

/** Updates the population definition. Lists replace the existing ones. */
export function updatePopulation(plan: SamplingPlan, changes: Partial<PopulationDefinition>): SamplingPlan {
  return { ...plan, population: { ...plan.population, ...changes } };
}

export function shortlistTechnique(plan: SamplingPlan, id: SamplingTechniqueId): SamplingPlan {
  check(id);
  return plan.shortlist.includes(id) ? plan : { ...plan, shortlist: [...plan.shortlist, id] };
}

/** Removes a technique; if it was chosen, nothing is chosen any more. */
export function removeTechnique(plan: SamplingPlan, id: SamplingTechniqueId): SamplingPlan {
  check(id);
  return { ...plan, shortlist: plan.shortlist.filter((candidate) => candidate !== id), chosen: plan.chosen === id ? null : plan.chosen };
}

/** Records the researcher's own choice, adding it to the shortlist if needed. `null` clears it. */
export function chooseTechnique(plan: SamplingPlan, id: SamplingTechniqueId | null): SamplingPlan {
  if (id === null) return { ...plan, chosen: null };
  return { ...shortlistTechnique(plan, id), chosen: id };
}

export type PlanText = "reason" | "selectionProcedure" | "potentialBiases" | "mitigation" | "notes";

export const setPlanText = (plan: SamplingPlan, field: PlanText, text: string): SamplingPlan => ({ ...plan, [field]: text });

/**
 * Parses a response rate typed as text, such as “70”, “70%” or “62.5 %”.
 * Returns null for empty text and a RangeError for anything that isn't a percentage.
 */
export function parseResponseRate(text: string): number | null {
  const trimmed = text.trim().replace(/\s*%$/, "");
  if (!trimmed) return null;
  const value = Number(trimmed);
  if (!Number.isFinite(value) || value < 0 || value > 100) throw new RangeError("Enter a percentage between 0 and 100.");
  return value;
}

export function setResponseRate(plan: SamplingPlan, rate: number | null): SamplingPlan {
  if (rate !== null && (!Number.isFinite(rate) || rate < 0 || rate > 100)) throw new RangeError("Enter a percentage between 0 and 100.");
  return { ...plan, expectedResponseRate: rate };
}

/** Records an answer; undefined clears it. */
export function answerSamplingQuestion(plan: SamplingPlan, question: SamplingQuestionId, answer: "yes" | "no" | undefined): SamplingPlan {
  const answers = { ...plan.answers };
  if (answer === undefined) delete answers[question];
  else answers[question] = answer;
  validateSamplingAnswers(answers);
  return { ...plan, answers };
}

/** Checks and cleans a plan for storage. Throws a RangeError for an unknown technique, answer or rate. */
export function cleanSamplingPlan(plan: SamplingPlan): SamplingPlan | undefined {
  for (const id of plan.shortlist) check(id);
  if (plan.chosen !== null) check(plan.chosen);
  validateSamplingAnswers(plan.answers);
  setResponseRate(plan, plan.expectedResponseRate);
  const text = (value: string) => value.replace(/[ \t]+/g, " ").trim();
  const list = (values: readonly string[]) => [...new Set(values.map(text).filter(Boolean))];
  const population: PopulationDefinition = {
    targetPopulation: text(plan.population.targetPopulation),
    accessiblePopulation: text(plan.population.accessiblePopulation),
    samplingFrame: text(plan.population.samplingFrame),
    unitOfAnalysis: text(plan.population.unitOfAnalysis),
    unitOfObservation: text(plan.population.unitOfObservation),
    geographicalCoverage: text(plan.population.geographicalCoverage),
    inclusionCriteria: list(plan.population.inclusionCriteria),
    exclusionCriteria: list(plan.population.exclusionCriteria),
    samplingLocation: text(plan.population.samplingLocation),
  };
  const cleaned: SamplingPlan = {
    population,
    chosen: plan.chosen,
    shortlist: [...new Set(plan.chosen && !plan.shortlist.includes(plan.chosen) ? [...plan.shortlist, plan.chosen] : plan.shortlist)],
    reason: text(plan.reason),
    selectionProcedure: text(plan.selectionProcedure),
    expectedResponseRate: plan.expectedResponseRate,
    potentialBiases: text(plan.potentialBiases),
    mitigation: text(plan.mitigation),
    notes: text(plan.notes),
    answers: Object.fromEntries(Object.entries(plan.answers).filter(([, value]) => value !== undefined)),
  };
  const populationEmpty = Object.values(population).every((value) => (Array.isArray(value) ? value.length === 0 : value === ""));
  const empty =
    populationEmpty &&
    !cleaned.chosen &&
    cleaned.shortlist.length === 0 &&
    [cleaned.reason, cleaned.selectionProcedure, cleaned.potentialBiases, cleaned.mitigation, cleaned.notes].every((value) => !value) &&
    cleaned.expectedResponseRate === null &&
    Object.keys(cleaned.answers).length === 0;
  return empty ? undefined : cleaned;
}
