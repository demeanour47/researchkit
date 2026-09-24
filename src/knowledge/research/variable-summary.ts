/**
 * Summaries of the variables: each one's operationalisation from concept to
 * questionnaire item, a table for copying, and the project draft update, which
 * changes only the draft's `variables` section.
 */

import { updateProjectDraft, type ResearchProjectDraft } from "./research-project";
import { MEASUREMENT_LEVEL_INFO, VARIABLE_KIND_INFO, VARIABLE_PLACEHOLDERS, type MeasurementLevel, type ProjectVariable, type VariableIndicator } from "./variable-types";

export interface OperationalisationStep {
  id: "conceptual" | "operational" | "indicators" | "measurement" | "scale" | "items";
  label: string;
  /** What the researcher has entered, or a placeholder where nothing is known yet. */
  values: string[];
  missing: boolean;
}

const orPlaceholder = (values: readonly string[], placeholder: string) => {
  const filled = values.map((value) => value.trim()).filter(Boolean);
  return { values: filled.length > 0 ? filled : [placeholder], missing: filled.length === 0 };
};

/** The chain from concept to questionnaire item. Unknown steps show a placeholder. */
export function operationalisation(variable: ProjectVariable): OperationalisationStep[] {
  const indicators = variable.possibleIndicators;
  const levelLabel = variable.measurementLevel ? MEASUREMENT_LEVEL_INFO[variable.measurementLevel].label : "";
  return [
    { id: "conceptual", label: "Conceptual definition", ...orPlaceholder([variable.conceptualDefinition], VARIABLE_PLACEHOLDERS.conceptualDefinition) },
    { id: "operational", label: "Operational definition", ...orPlaceholder([variable.operationalDefinition], VARIABLE_PLACEHOLDERS.operationalDefinition) },
    { id: "indicators", label: "Indicators", ...orPlaceholder(indicators.map((indicator) => indicator.name), VARIABLE_PLACEHOLDERS.indicator) },
    {
      id: "measurement",
      label: "Measurement",
      ...orPlaceholder(
        [levelLabel ? `${levelLabel} level` : "", ...indicators.map((indicator) => (indicator.measurement.trim() ? `${indicator.name}: ${indicator.measurement.trim()}` : ""))],
        VARIABLE_PLACEHOLDERS.measurement,
      ),
    },
    {
      id: "scale",
      label: "Scale",
      ...orPlaceholder([variable.measurementScale, ...indicators.map((indicator) => (indicator.scale.trim() ? `${indicator.name}: ${indicator.scale.trim()}` : ""))], VARIABLE_PLACEHOLDERS.scale),
    },
    { id: "items", label: "Possible questionnaire items", ...orPlaceholder(variable.questionnaireItems, VARIABLE_PLACEHOLDERS.item) },
  ];
}

/** The answer format an item at each level usually has, with placeholders for its content. */
const ANSWER_FORMATS: Readonly<Record<MeasurementLevel, string>> = {
  nominal: "choose one of [categories]",
  ordinal: "choose one of [ordered options]",
  interval: "a number in [unit]",
  ratio: "a number in [unit]",
  binary: "choose one of [two options]",
  likert: "a rating on [scale]",
  continuous: "a number in [unit]",
  categorical: "choose one of [categories]",
  "multiple-response": "tick all that apply from [options]",
  "open-ended": "a free-text answer",
};

/**
 * Draft item structures, one per indicator, for the researcher to write. They name the
 * indicator and the answer format only; the question wording stays a placeholder.
 */
export function draftItems(variable: ProjectVariable): string[] {
  return variable.possibleIndicators.map((indicator: VariableIndicator) => {
    const level = indicator.level ?? variable.measurementLevel;
    const answer = level ? ANSWER_FORMATS[level] : VARIABLE_PLACEHOLDERS.measurement;
    const scale = indicator.scale.trim() || variable.measurementScale.trim();
    return `[question about ${indicator.name}] — answer: ${level === "likert" && scale ? `a rating on ${scale}` : answer}`;
  });
}

export interface VariableRow {
  id: string;
  name: string;
  kind: string;
  level: string;
  indicators: string;
  conceptual: string;
  operational: string;
  scale: string;
}

/** One row per variable, with placeholders for what isn't known. */
export function variableRows(variables: readonly ProjectVariable[]): VariableRow[] {
  return variables.map((variable) => ({
    id: variable.id,
    name: variable.name,
    kind: VARIABLE_KIND_INFO[variable.variableType].label,
    level: variable.measurementLevel ? MEASUREMENT_LEVEL_INFO[variable.measurementLevel].label : VARIABLE_PLACEHOLDERS.measurement,
    indicators: variable.possibleIndicators.map((indicator) => indicator.name).join("; ") || VARIABLE_PLACEHOLDERS.indicator,
    conceptual: variable.conceptualDefinition.trim() || VARIABLE_PLACEHOLDERS.conceptualDefinition,
    operational: variable.operationalDefinition.trim() || VARIABLE_PLACEHOLDERS.operationalDefinition,
    scale: variable.measurementScale.trim() || VARIABLE_PLACEHOLDERS.scale,
  }));
}

export const TABLE_HEADINGS = ["Variable", "Type", "Conceptual definition", "Operational definition", "Indicators", "Measurement level", "Scale"] as const;

/** The variables as tab-separated text, which pastes as a table into word processors and spreadsheets. */
export function variablesTable(variables: readonly ProjectVariable[]): string {
  const clean = (text: string) => text.replace(/[\t\n\r]+/g, " ");
  const rows = variableRows(variables).map((row) => [row.name, row.kind, row.conceptual, row.operational, row.indicators, row.level, row.scale].map(clean).join("\t"));
  return [TABLE_HEADINGS.join("\t"), ...rows].join("\n");
}

/** The project draft with its variables replaced. No other field changes. */
export function applyVariables(project: ResearchProjectDraft, variables: readonly ProjectVariable[]): ResearchProjectDraft {
  return updateProjectDraft(project, { variables });
}

/** Everything the Variables Builder can't do, stated on the page. */
export const VARIABLE_LIMITATIONS: readonly string[] = [
  "It can't write definitions, indicators or questionnaire items for you. It shows placeholders until you add them, and draft items name only the indicator and answer format.",
  "It can't check that a definition matches the literature, or that an indicator measures what it should. That needs your reading and, ideally, an established instrument.",
  "It can't test reliability or validity. Those need data and the right statistical checks.",
  "Links to your question, objectives, hypotheses and framework are found by matching variable names, so a variable described in other words won't be matched.",
  "Nothing is saved. Your variables are lost when you leave the page.",
];

/** Content awaiting review before launch. */
export const VARIABLE_REVIEW_ITEMS: readonly string[] = [
  "Academic review: the definitions and examples of each variable type, and references for them.",
  "Measurement review: the definitions, examples, strengths and limitations of each measurement level, references for them, and which levels are treated as combining.",
  "Indicator review: the guidance on indicators and the draft questionnaire item formats.",
  "Operational definition review: the checks comparing conceptual definitions, operational definitions and indicators.",
];
