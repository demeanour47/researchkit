/**
 * What the project draft says that matters for choosing analyses: how each variable is
 * measured, the research approach and design, whether measurements repeat, the planned
 * sample and how it is drawn. Everything is read from the draft; nothing is asked again,
 * and every inference records where it came from.
 */

import { getDesign, type DesignFamily, type DesignId } from "./design-types";
import { answerOptions, matrixRows } from "./questionnaire";
import { questionnaireVariables } from "./questionnaire-builder";
import type { ResearchProjectDraft } from "./research-project";
import { calculateSampleSize } from "./sample-size";
import { inputProblems } from "./sample-size-validator";
import { getTechnique } from "./sampling-types";
import type { HypothesisRelationship } from "./hypothesis-types";
import { MEASUREMENT_LEVEL_INFO, type MeasurementLevel, type ProjectVariable, type VariableKind } from "./variable-types";

/**
 * How a variable's values can be analysed:
 * - numeric: interval or ratio numbers.
 * - scale-score: a total or average of several rating items, commonly analysed as numeric.
 * - ordinal: ordered categories, including a single rating item.
 * - binary: two categories.
 * - categorical: several unordered categories.
 * - multiple: several choices can be ticked.
 * - text: written answers.
 * - unknown: not recorded yet.
 */
export const MEASURES = ["numeric", "scale-score", "ordinal", "binary", "categorical", "multiple", "text", "unknown"] as const;
export type Measure = (typeof MEASURES)[number];

export const MEASURE_LABELS: Readonly<Record<Measure, string>> = {
  numeric: "numeric",
  "scale-score": "a scale score",
  ordinal: "ordinal",
  binary: "two categories",
  categorical: "categories",
  multiple: "several ticked choices",
  text: "written answers",
  unknown: "not yet known",
};

export const MEASURE_FOR_LEVEL: Readonly<Record<MeasurementLevel, Measure>> = {
  interval: "numeric",
  ratio: "numeric",
  continuous: "numeric",
  ordinal: "ordinal",
  likert: "ordinal",
  binary: "binary",
  nominal: "categorical",
  categorical: "categorical",
  "multiple-response": "multiple",
  "open-ended": "text",
};

export interface MeasuredVariable {
  id: string;
  name: string;
  kind: VariableKind;
  measure: Measure;
  /** Rating items measuring it, from its indicators or questionnaire. Two or more make a scale. */
  items: number;
  /** How many groups it forms, when known: 2 for binary, or the number of written options. */
  groups: number | null;
  /** Where the measure was read from, such as “Measurement level: Ratio”. */
  source: string;
}

export type MethodologicalChoice = "quantitative" | "qualitative" | "mixed" | "unknown";

export interface AnalysisProfile {
  choice: MethodologicalChoice;
  choiceSource: string | null;
  approach: string | null;
  philosophy: string | null;
  design: { id: DesignId; name: string; family: DesignFamily; manipulation: string; causality: string } | null;
  /** Whether the same participants are measured more than once. */
  repeated: boolean;
  repeatedSource: string | null;
  variables: MeasuredVariable[];
  /** Alternative hypotheses, which the analyses test. */
  hypotheses: { id: string; text: string; relationship: HypothesisRelationship }[];
  objectives: readonly string[];
  /** The planned number of completed responses, from the sample size plan. */
  sampleSize: number | null;
  sampleSource: string | null;
  /** True for probability sampling, false for non-probability, null when no technique is chosen. */
  probabilitySampling: boolean | null;
  samplingSource: string | null;
  /** What the draft doesn't say yet, each as a sentence. */
  gaps: string[];
}

const RATING_TYPES = new Set(["likert", "matrix", "semantic-differential"]);
const QUESTION_MEASURE: Readonly<Record<string, Measure>> = {
  numeric: "numeric",
  likert: "ordinal",
  matrix: "ordinal",
  "semantic-differential": "ordinal",
  ranking: "ordinal",
  "yes-no": "binary",
  "true-false": "binary",
  "multiple-choice": "categorical",
  dropdown: "categorical",
  checkbox: "multiple",
  "short-answer": "text",
  "long-answer": "text",
  paragraph: "text",
};

/** How one variable is measured, from its own level, its indicators, or the questionnaire, in that order. */
export function measureVariable(variable: ProjectVariable, project: ResearchProjectDraft): MeasuredVariable {
  const questions = (project.questionnaire?.questions ?? []).filter((question) => question.variableId === variable.id);
  const ratingQuestions = questions.filter((question) => RATING_TYPES.has(question.type));
  const questionItems = ratingQuestions.reduce((total, question) => total + (question.type === "matrix" ? matrixRows(question).length : 1), 0);
  const likertIndicators = variable.possibleIndicators.filter((indicator) => (indicator.level ?? variable.measurementLevel) === "likert").length;
  const items = Math.max(questionItems, likertIndicators);
  const base = { id: variable.id, name: variable.name, kind: variable.variableType, items };
  const withScale = (measure: Measure, groups: number | null, source: string): MeasuredVariable =>
    measure === "ordinal" && items >= 2 ? { ...base, measure: "scale-score", groups: null, source: `${source}, with ${items} rating items` } : { ...base, measure, groups, source };

  if (variable.measurementLevel) {
    const measure = MEASURE_FOR_LEVEL[variable.measurementLevel];
    return withScale(measure, measure === "binary" ? 2 : null, `Measurement level: ${MEASUREMENT_LEVEL_INFO[variable.measurementLevel].label}`);
  }
  const levels = [...new Set(variable.possibleIndicators.map((indicator) => indicator.level).filter((level): level is MeasurementLevel => level !== null))];
  if (levels.length > 0) {
    const measures = [...new Set(levels.map((level) => MEASURE_FOR_LEVEL[level]))];
    const labels = levels.map((level) => MEASUREMENT_LEVEL_INFO[level].label).join(", ");
    // Indicators measured differently can't be combined into one score without a decision the researcher must make.
    if (measures.length > 1) return { ...base, measure: "unknown", groups: null, source: `Indicators are measured at different levels (${labels}); record the variable's own level, or analyse each indicator separately` };
    return withScale(measures[0], measures[0] === "binary" ? 2 : null, `Indicator measurement levels: ${labels}`);
  }
  const typed = questions.map((question) => QUESTION_MEASURE[question.type]).filter((measure): measure is Measure => Boolean(measure));
  if (typed.length > 0) {
    const measure = typed[0];
    const choice = questions.find((question) => question.type === "multiple-choice" || question.type === "dropdown");
    const written = choice ? answerOptions(choice).filter((option) => !option.placeholder).length : 0;
    return withScale(measure, measure === "binary" ? 2 : written >= 2 ? written : null, "Questionnaire question type");
  }
  return { ...base, measure: "unknown", groups: null, source: "No measurement level recorded" };
}

function choiceOf(project: ResearchProjectDraft): { choice: MethodologicalChoice; source: string | null } {
  const choice = project.researchOnionSelection?.choice ?? project.methodology;
  if (choice === "quantitative" || choice === "qualitative") return { choice, source: `Research onion: ${choice} methodological choice` };
  if (choice === "mixed-methods" || choice === "multi-method") return { choice: "mixed", source: `Research onion: ${choice.replace("-", " ")} choice` };
  const designId = project.researchDesign?.chosen;
  if (designId) {
    const emphasis = getDesign(designId).traits.emphasis;
    if (emphasis !== "either") return { choice: emphasis, source: `Research design: ${getDesign(designId).name}` };
  }
  return { choice: "unknown", source: null };
}

/** Everything the rules need, read from the draft. */
export function analysisProfile(project: ResearchProjectDraft): AnalysisProfile {
  const gaps: string[] = [];
  const { choice, source: choiceSource } = choiceOf(project);
  const designId = project.researchDesign?.chosen ?? null;
  const design = designId ? getDesign(designId) : null;
  const timeHorizon = project.researchOnionSelection?.timeHorizon;

  let repeated = false;
  let repeatedSource: string | null = null;
  if (designId === "longitudinal") [repeated, repeatedSource] = [true, "Research design: Longitudinal"];
  else if (timeHorizon === "longitudinal") [repeated, repeatedSource] = [true, "Research onion: longitudinal time horizon"];

  const variables = questionnaireVariables(project).map((variable) => measureVariable(variable, project));
  const unknown = variables.filter((variable) => variable.measure === "unknown");
  if (variables.length === 0) gaps.push("No variables are recorded, so no analysis can be matched to them.");
  if (unknown.length > 0) gaps.push(`No measurement level is recorded for ${unknown.map((variable) => variable.name).join(", ")}; tests depend on it.`);
  if (!design) gaps.push("No research design is chosen, so the design can't inform the recommendations.");
  if (choice === "unknown") gaps.push("The methodological choice (quantitative, qualitative or mixed) isn't recorded.");

  let sampleSize: number | null = null;
  let sampleSource: string | null = null;
  const plan = project.sampleSizePlan;
  if (plan && inputProblems(plan).length === 0) {
    const result = calculateSampleSize(plan);
    if (result.available && result.adjusted !== null) [sampleSize, sampleSource] = [result.adjusted, `Sample size plan: ${result.adjusted} completed responses`];
  }
  if (sampleSize === null) gaps.push("No planned sample size is available, so sample size can't inform the recommendations.");

  const technique = project.samplingPlan?.chosen ? getTechnique(project.samplingPlan.chosen) : null;
  const hypotheses = (project.hypotheses ?? []).filter((hypothesis) => hypothesis.role === "alternative").map((hypothesis) => ({ id: hypothesis.id, text: hypothesis.text, relationship: hypothesis.relationship }));

  return {
    choice,
    choiceSource,
    approach: project.researchOnionSelection?.approach ?? null,
    philosophy: project.researchOnionSelection?.philosophy ?? null,
    design: design ? { id: design.id, name: design.name, family: design.family, manipulation: design.traits.manipulation, causality: design.traits.causality } : null,
    repeated,
    repeatedSource,
    variables,
    hypotheses,
    objectives: project.researchObjectives ?? [],
    sampleSize,
    sampleSource,
    probabilitySampling: technique ? technique.category === "probability" : null,
    samplingSource: technique ? `Sampling technique: ${technique.name} sampling` : null,
    gaps,
  };
}
