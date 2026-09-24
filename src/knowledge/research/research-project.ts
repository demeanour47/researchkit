/**
 * ResearchProjectDraft: the shared record of a research project as it develops.
 *
 * Every research methodology tool reads from and adds to this one model, so the
 * researcher never has to enter the same information twice. Each field is optional
 * because tools fill it in progressively. It holds only information common to the
 * whole project; anything specific to one tool belongs to that tool.
 *
 * Drafts are immutable: every change returns a new draft. Nothing here stores them.
 */

import { validateSelection } from "./compatibility";
import { getDesign } from "./design-types";
import { cleanDesignRecord, type ResearchDesignRecord } from "./research-design";
import { cleanSamplingPlan, type SamplingPlan } from "./sampling";
import { cleanSampleSizePlan, type SampleSizePlan } from "./sample-size";
import { getSampleSizeMethod } from "./sample-size-types";
import { cleanQuestionnaire } from "./questionnaire";
import type { Questionnaire } from "./questionnaire-types";
import { getTechnique } from "./sampling-types";
import {
  MEASUREMENT_LEVELS,
  VARIABLE_KINDS,
  type ProjectVariable,
  type VariableIndicator,
  type VariableSource,
} from "./variable-types";
import {
  RELATIONSHIP_TYPES,
  VARIABLE_TYPES,
  type ConceptualFramework,
  type FrameworkRelationship,
  type FrameworkVariable,
  type Point,
} from "./conceptual-types";
import {
  DIRECTIONS,
  HYPOTHESIS_FORMS,
  HYPOTHESIS_ROLES,
  RELATIONSHIP_KINDS,
  type HypothesisRelationship,
  type ProjectHypothesis,
} from "./hypothesis-types";
import { findOption, LAYERS } from "./research-onion";
import type { LayerId, OnionSelection } from "./types";

/** The methodological choices, using the same ids as the research onion's "choice" layer. */
export const METHODOLOGIES = ["quantitative", "qualitative", "mixed-methods", "multi-method"] as const;
export type MethodologyId = (typeof METHODOLOGIES)[number];

export interface ResearchProjectDraft {
  /** The broad field, such as "Public health". */
  researchArea?: string;
  /** The specific subject within the area, such as "sleep and academic performance". */
  topic?: string;
  /** What the project sets out to achieve, in the researcher's words. */
  researchAim?: string;
  /** The research question, as the researcher has written it. */
  researchQuestion?: string;
  researchObjectives?: readonly string[];
  /** Who or what is studied, such as "first-year undergraduate students". */
  population?: string;
  /** Where the study takes place. */
  location?: string;
  /** When, or over what period, the study takes place. */
  timeContext?: string;
  independentVariables?: readonly string[];
  dependentVariables?: readonly string[];
  /** Variables that change the strength or direction of a relationship. */
  moderatorVariables?: readonly string[];
  /** Variables through which one variable affects another. */
  mediatorVariables?: readonly string[];
  /** Variables held constant or adjusted for. */
  controlVariables?: readonly string[];
  /** Every variable, with its definitions, indicators and measurement. Written by the Variables Builder. */
  variables?: readonly ProjectVariable[];
  /** Hypotheses, each with its relationship as structured data. Written by the Hypothesis Builder. */
  hypotheses?: readonly ProjectHypothesis[];
  /** Variables, relationships and box positions. Written by the Conceptual Framework Builder. */
  conceptualFramework?: ConceptualFramework;
  /** The designs considered, the one chosen and its justification. Written by the Research Design Builder. */
  researchDesign?: ResearchDesignRecord;
  /** The population, the sampling technique chosen and how sampling will be done. Written by the Sampling Technique Builder. */
  samplingPlan?: SamplingPlan;
  /** The sample size method and its inputs. Written by the Sample Size Calculator; results are recalculated from these. */
  sampleSizePlan?: SampleSizePlan;
  /** Sections and questions, each question linked to a variable and indicator. Written by the Questionnaire Builder. */
  questionnaire?: Questionnaire;
  /** The researcher's stated methodology. */
  methodology?: MethodologyId;
  /** Choices made in the Research Onion Explorer. */
  researchOnionSelection?: OnionSelection;
  notes?: string;
}

/**
 * A change to a draft. A value replaces the field; `null` or an empty value clears it;
 * a field left out is unchanged.
 */
export type ResearchProjectChanges = {
  [Field in keyof ResearchProjectDraft]?: ResearchProjectDraft[Field] | null;
};

/** Every field, in the order a project is usually described. */
export const PROJECT_FIELDS = [
  "researchArea",
  "topic",
  "researchAim",
  "researchQuestion",
  "researchObjectives",
  "population",
  "location",
  "timeContext",
  "independentVariables",
  "dependentVariables",
  "moderatorVariables",
  "mediatorVariables",
  "controlVariables",
  "variables",
  "hypotheses",
  "conceptualFramework",
  "researchDesign",
  "samplingPlan",
  "sampleSizePlan",
  "questionnaire",
  "methodology",
  "researchOnionSelection",
  "notes",
] as const satisfies readonly (keyof ResearchProjectDraft)[];

export type ProjectField = (typeof PROJECT_FIELDS)[number];

export const PROJECT_FIELD_LABELS: Readonly<Record<ProjectField, string>> = {
  researchArea: "Research area",
  topic: "Topic",
  researchAim: "Research aim",
  researchQuestion: "Research question",
  researchObjectives: "Research objectives",
  population: "Population",
  location: "Location",
  timeContext: "Time context",
  independentVariables: "Independent variables",
  dependentVariables: "Dependent variables",
  moderatorVariables: "Moderator variables",
  mediatorVariables: "Mediator variables",
  controlVariables: "Control variables",
  variables: "Variables",
  hypotheses: "Hypotheses",
  conceptualFramework: "Conceptual framework",
  researchDesign: "Research design",
  samplingPlan: "Sampling plan",
  sampleSizePlan: "Sample size",
  questionnaire: "Questionnaire",
  methodology: "Methodology",
  researchOnionSelection: "Research onion choices",
  notes: "Notes",
};

const TEXT_FIELDS = [
  "researchArea",
  "topic",
  "researchAim",
  "researchQuestion",
  "population",
  "location",
  "timeContext",
  "notes",
] as const;
const LIST_FIELDS = [
  "researchObjectives",
  "independentVariables",
  "dependentVariables",
  "moderatorVariables",
  "mediatorVariables",
  "controlVariables",
] as const;

function cleanText(value: string): string | undefined {
  const trimmed = value.replace(/\s+/g, " ").trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/** Trims each item, drops empty ones and removes repeats, ignoring case. Order is kept. */
function cleanList(values: readonly string[]): readonly string[] | undefined {
  const seen = new Set<string>();
  const cleaned: string[] = [];
  for (const value of values) {
    const item = cleanText(value);
    if (!item || seen.has(item.toLowerCase())) continue;
    seen.add(item.toLowerCase());
    cleaned.push(item);
  }
  return cleaned.length > 0 ? cleaned : undefined;
}

function cleanRelationship(relationship: HypothesisRelationship): HypothesisRelationship {
  if (!RELATIONSHIP_KINDS.includes(relationship.kind)) throw new RangeError(`Unknown relationship kind: ${relationship.kind}`);
  if (!HYPOTHESIS_FORMS.includes(relationship.form)) throw new RangeError(`Unknown hypothesis form: ${relationship.form}`);
  if (!DIRECTIONS.includes(relationship.direction)) throw new RangeError(`Unknown direction: ${relationship.direction}`);
  return {
    kind: relationship.kind,
    form: relationship.form,
    direction: relationship.direction,
    independentVariables: cleanList(relationship.independentVariables) ?? [],
    dependentVariables: cleanList(relationship.dependentVariables) ?? [],
    moderators: cleanList(relationship.moderators) ?? [],
    mediators: cleanList(relationship.mediators) ?? [],
    controls: cleanList(relationship.controls) ?? [],
    population: relationship.population ? (cleanText(relationship.population) ?? null) : null,
    context: relationship.context ? (cleanText(relationship.context) ?? null) : null,
  };
}

/** Checks each hypothesis and drops any with empty wording. Throws a RangeError for an invalid one. */
function cleanHypotheses(hypotheses: readonly ProjectHypothesis[]): readonly ProjectHypothesis[] | undefined {
  const ids = new Set<string>();
  const cleaned: ProjectHypothesis[] = [];
  for (const hypothesis of hypotheses) {
    if (!HYPOTHESIS_ROLES.includes(hypothesis.role)) throw new RangeError(`Unknown hypothesis role: ${hypothesis.role}`);
    if (!hypothesis.id || ids.has(hypothesis.id)) throw new RangeError(`Missing or repeated hypothesis id: ${hypothesis.id}`);
    ids.add(hypothesis.id);
    const text = cleanText(hypothesis.text);
    if (!text) continue;
    cleaned.push({ id: hypothesis.id, role: hypothesis.role, text, relationship: cleanRelationship(hypothesis.relationship) });
  }
  return cleaned.length > 0 ? cleaned : undefined;
}

const SOURCE_KINDS: readonly VariableSource["kind"][] = ["list", "hypothesis", "framework", "user"];

/**
 * Checks variables and returns clean copies: text trimmed, variables and indicators
 * without names dropped. Throws a RangeError for an unknown type, level or source, or a repeated id.
 */
function cleanVariables(variables: readonly ProjectVariable[]): readonly ProjectVariable[] | undefined {
  const ids = new Set<string>();
  const cleaned: ProjectVariable[] = [];
  const level = <T,>(value: T | null) => {
    if (value !== null && !MEASUREMENT_LEVELS.includes(value as never)) throw new RangeError(`Unknown measurement level: ${value}`);
    return value;
  };
  for (const variable of variables) {
    if (!VARIABLE_KINDS.includes(variable.variableType)) throw new RangeError(`Unknown variable type: ${variable.variableType}`);
    if (!variable.id || ids.has(variable.id)) throw new RangeError(`Missing or repeated variable id: ${variable.id}`);
    const name = cleanText(variable.name);
    if (!name) continue;
    ids.add(variable.id);
    const indicatorIds = new Set<string>();
    const indicators: VariableIndicator[] = [];
    for (const indicator of variable.possibleIndicators) {
      if (!indicator.id || indicatorIds.has(indicator.id)) throw new RangeError(`Missing or repeated indicator id: ${indicator.id}`);
      const indicatorName = cleanText(indicator.name);
      if (!indicatorName) continue;
      indicatorIds.add(indicator.id);
      indicators.push({
        id: indicator.id,
        name: indicatorName,
        description: cleanText(indicator.description) ?? "",
        measurement: cleanText(indicator.measurement) ?? "",
        scale: cleanText(indicator.scale) ?? "",
        level: level(indicator.level),
      });
    }
    for (const source of variable.sources) {
      if (!SOURCE_KINDS.includes(source.kind)) throw new RangeError(`Unknown variable source: ${source.kind}`);
    }
    cleaned.push({
      id: variable.id,
      name,
      shortName: cleanText(variable.shortName) ?? name,
      description: cleanText(variable.description) ?? "",
      variableType: variable.variableType,
      measurementLevel: level(variable.measurementLevel),
      measurementScale: cleanText(variable.measurementScale) ?? "",
      conceptualDefinition: cleanText(variable.conceptualDefinition) ?? "",
      operationalDefinition: cleanText(variable.operationalDefinition) ?? "",
      possibleIndicators: indicators,
      questionnaireItems: cleanList(variable.questionnaireItems) ?? [],
      notes: cleanText(variable.notes) ?? "",
      sources: variable.sources.map((source) => ({ kind: source.kind, asKind: source.asKind, references: [...source.references] })),
    });
  }
  return cleaned.length > 0 ? cleaned : undefined;
}

/**
 * Checks a framework and returns a clean copy: names trimmed, relationships that refer
 * to missing variables dropped, positions kept only for existing variables. Throws a
 * RangeError for an unknown variable or relationship type, or a repeated id.
 */
function cleanFramework(framework: ConceptualFramework): ConceptualFramework | undefined {
  const variableIds = new Set<string>();
  const variables: FrameworkVariable[] = [];
  for (const variable of framework.variables) {
    if (!VARIABLE_TYPES.includes(variable.type)) throw new RangeError(`Unknown variable type: ${variable.type}`);
    if (!variable.id || variableIds.has(variable.id)) throw new RangeError(`Missing or repeated variable id: ${variable.id}`);
    const name = cleanText(variable.name);
    if (!name) continue;
    variableIds.add(variable.id);
    variables.push({ id: variable.id, name, shortLabel: cleanText(variable.shortLabel) ?? name, description: cleanText(variable.description) ?? "", type: variable.type });
  }
  const relationshipIds = new Set<string>();
  const relationships: FrameworkRelationship[] = [];
  for (const relationship of framework.relationships) {
    if (!RELATIONSHIP_TYPES.includes(relationship.type)) throw new RangeError(`Unknown relationship type: ${relationship.type}`);
    if (!relationship.id || relationshipIds.has(relationship.id)) throw new RangeError(`Missing or repeated relationship id: ${relationship.id}`);
    if (!variableIds.has(relationship.source) || !variableIds.has(relationship.target) || relationship.source === relationship.target) continue;
    relationshipIds.add(relationship.id);
    relationships.push({
      id: relationship.id,
      source: relationship.source,
      target: relationship.target,
      type: relationship.type,
      label: relationship.label ? (cleanText(relationship.label) ?? null) : null,
      moderates: relationship.moderates ?? null,
      hypothesisIds: [...relationship.hypothesisIds],
    });
  }
  const kept = relationships.map((relationship) => (relationship.moderates && !relationshipIds.has(relationship.moderates) ? { ...relationship, moderates: null } : relationship));
  const positions: Record<string, Point> = {};
  for (const [id, point] of Object.entries(framework.positions)) {
    if (variableIds.has(id) && Number.isFinite(point.x) && Number.isFinite(point.y)) positions[id] = { x: point.x, y: point.y };
  }
  return variables.length > 0 ? { variables, relationships: kept, positions } : undefined;
}

function cleanSelection(selection: OnionSelection): OnionSelection | undefined {
  validateSelection(selection);
  const entries = Object.entries(selection).filter(([, id]) => id !== undefined && id !== "");
  return entries.length > 0 ? (Object.fromEntries(entries) as OnionSelection) : undefined;
}

/**
 * Applies changes to a draft, returning a new draft. Text is trimmed, empty values
 * are removed, and methodology and onion choices are checked.
 * Throws a RangeError for an unknown methodology or onion choice.
 */
export function updateProjectDraft(draft: ResearchProjectDraft, changes: ResearchProjectChanges): ResearchProjectDraft {
  const next: Record<string, unknown> = { ...draft };
  const set = (field: ProjectField, value: unknown) => {
    if (value === undefined) delete next[field];
    else next[field] = value;
  };

  for (const field of TEXT_FIELDS) {
    if (!(field in changes)) continue;
    const value = changes[field];
    set(field, typeof value === "string" ? cleanText(value) : undefined);
  }
  for (const field of LIST_FIELDS) {
    if (!(field in changes)) continue;
    const value = changes[field];
    set(field, value ? cleanList(value) : undefined);
  }
  if ("hypotheses" in changes) {
    const value = changes.hypotheses;
    set("hypotheses", value ? cleanHypotheses(value) : undefined);
  }
  if ("sampleSizePlan" in changes) {
    const value = changes.sampleSizePlan;
    set("sampleSizePlan", value ? cleanSampleSizePlan(value) : undefined);
  }
  if ("questionnaire" in changes) {
    const value = changes.questionnaire;
    set("questionnaire", value ? cleanQuestionnaire(value) : undefined);
  }
  if ("samplingPlan" in changes) {
    const value = changes.samplingPlan;
    set("samplingPlan", value ? cleanSamplingPlan(value) : undefined);
  }
  if ("researchDesign" in changes) {
    const value = changes.researchDesign;
    set("researchDesign", value ? cleanDesignRecord(value) : undefined);
  }
  if ("variables" in changes) {
    const value = changes.variables;
    set("variables", value ? cleanVariables(value) : undefined);
  }
  if ("conceptualFramework" in changes) {
    const value = changes.conceptualFramework;
    set("conceptualFramework", value ? cleanFramework(value) : undefined);
  }
  if ("methodology" in changes) {
    const value = changes.methodology;
    if (value && !METHODOLOGIES.includes(value)) throw new RangeError(`Unknown methodology: ${value}`);
    set("methodology", value || undefined);
  }
  if ("researchOnionSelection" in changes) {
    const value = changes.researchOnionSelection;
    set("researchOnionSelection", value ? cleanSelection(value) : undefined);
  }
  return next as ResearchProjectDraft;
}

/** A new draft, optionally starting from some information. Cleaned in the same way as an update. */
export function createProjectDraft(initial: ResearchProjectDraft = {}): ResearchProjectDraft {
  return updateProjectDraft({}, initial);
}

/** Splits text entered one item per line (or separated by semicolons) into a list. */
export function parseList(text: string): string[] {
  return text
    .split(/[\n;]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

/** The fields that hold information, in the standard order. */
export function filledFields(draft: ResearchProjectDraft): ProjectField[] {
  return PROJECT_FIELDS.filter((field) => draft[field] !== undefined);
}

/** A readable value for each filled field, for showing the draft to the researcher. */
export function describeProject(draft: ResearchProjectDraft): { field: ProjectField; label: string; value: string }[] {
  return filledFields(draft).map((field) => ({ field, label: PROJECT_FIELD_LABELS[field], value: describeField(draft, field) }));
}

function describeField(draft: ResearchProjectDraft, field: ProjectField): string {
  if (field === "methodology") return findOption(draft.methodology!)?.name ?? draft.methodology!;
  if (field === "researchOnionSelection") {
    const selection = draft.researchOnionSelection!;
    return LAYERS.flatMap((layer) => {
      const id = selection[layer.id as LayerId];
      return id ? [`${layer.name}: ${findOption(id)?.name ?? id}`] : [];
    }).join("; ");
  }
  if (field === "sampleSizePlan") {
    const plan = draft.sampleSizePlan!;
    const population = plan.inputs.populationType === "finite" ? `population ${plan.inputs.populationSize}` : "unknown population";
    return `${getSampleSizeMethod(plan.method).name}: ${plan.inputs.confidence}% confidence, ±${plan.inputs.margin}% margin, ${population}.`;
  }
  if (field === "questionnaire") {
    const { title, sections, questions } = draft.questionnaire!;
    return `${title || "Untitled questionnaire"}: ${sections.length} ${sections.length === 1 ? "section" : "sections"}, ${questions.length} ${questions.length === 1 ? "question" : "questions"}.`;
  }
  if (field === "samplingPlan") {
    const plan = draft.samplingPlan!;
    const technique = plan.chosen ? `Technique: ${getTechnique(plan.chosen).name} sampling` : "No technique chosen";
    const population = plan.population.targetPopulation ? `. Target population: ${plan.population.targetPopulation}` : "";
    return `${technique}${population}.`;
  }
  if (field === "researchDesign") {
    const record = draft.researchDesign!;
    const chosen = record.chosen ? `Chosen: ${getDesign(record.chosen).name}` : "No design chosen";
    const shortlist = record.shortlist.length > 0 ? `. Considering: ${record.shortlist.map((id) => getDesign(id).name).join(", ")}` : "";
    return `${chosen}${shortlist}.`;
  }
  if (field === "variables") {
    const variables = draft.variables!;
    return `${variables.length} ${variables.length === 1 ? "variable" : "variables"}: ${variables.map((variable) => variable.name).join("; ")}`;
  }
  if (field === "conceptualFramework") {
    const { variables, relationships } = draft.conceptualFramework!;
    return `${variables.length} ${variables.length === 1 ? "variable" : "variables"} and ${relationships.length} ${relationships.length === 1 ? "relationship" : "relationships"}`;
  }
  if (field === "hypotheses") {
    return draft.hypotheses!.map((hypothesis) => `${hypothesis.role === "null" ? "H₀" : "H₁"}: ${hypothesis.text}`).join(" ");
  }
  const value = draft[field];
  return Array.isArray(value) ? value.join("; ") : String(value);
}
