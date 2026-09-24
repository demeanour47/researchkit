/**
 * Checks each variable and the set as a whole. Checks explain; they never score or
 * rank. They use the same wording as the other research tools' checks.
 */

import { CHECK_STATUS_LABELS, type CheckStatus } from "./hypothesis-checks";
import { containsPhrase, joinList } from "./question-text";
import type { ResearchProjectDraft } from "./research-project";
import { connectionsFor } from "./variable-relationships";
import { FRAMEWORK_KIND } from "./variables";
import { MEASUREMENT_LEVEL_INFO, VARIABLE_KIND_INFO, levelFit, type ProjectVariable, type VariableKind } from "./variable-types";

export { CHECK_STATUS_LABELS };

export const VARIABLE_CHECK_IDS = [
  "duplicate",
  "indicators",
  "measurement",
  "conceptual",
  "operational",
  "question",
  "objectives",
  "hypotheses",
  "framework",
] as const;
export type VariableCheckId = (typeof VARIABLE_CHECK_IDS)[number];

export const VARIABLE_CHECK_LABELS: Readonly<Record<VariableCheckId, string>> = {
  duplicate: "Unique variable",
  indicators: "Indicators",
  measurement: "Measurement",
  conceptual: "Conceptual definition",
  operational: "Operational definition",
  question: "Research question alignment",
  objectives: "Objective alignment",
  hypotheses: "Hypothesis alignment",
  framework: "Conceptual framework alignment",
};

export interface VariableCheck {
  check: VariableCheckId;
  label: string;
  status: CheckStatus;
  explanation: string;
}

const check = (id: VariableCheckId, status: CheckStatus, explanation: string): VariableCheck => ({ check: id, label: VARIABLE_CHECK_LABELS[id], status, explanation });
const quote = (values: readonly string[]) => joinList(values.map((value) => `“${value}”`));
const kindLabel = (kind: VariableKind) => VARIABLE_KIND_INFO[kind].label.toLowerCase();

/** Kinds that don't usually appear in a research question, objectives or main hypotheses. */
const BACKGROUND_KINDS: readonly VariableKind[] = ["control", "extraneous", "confounding"];

function duplicateCheck(variable: ProjectVariable, variables: readonly ProjectVariable[]): VariableCheck {
  const others = variables.filter((other) => other.id !== variable.id);
  const sameName = others.filter((other) => other.name.toLowerCase() === variable.name.toLowerCase());
  const sameShort = others.filter((other) => other.shortName.toLowerCase() === variable.shortName.toLowerCase() && !sameName.includes(other));
  if (sameName.length > 0) return check("duplicate", "worth-checking", `Another variable is also called “${variable.name}”. Combine them, or rename one so each is clearly distinct.`);
  if (sameShort.length > 0) return check("duplicate", "worth-checking", `Another variable has the same short name, “${variable.shortName}”, so they would look alike in tables and figures.`);
  return check("duplicate", "aligned", "No other variable has this name or short name.");
}

function indicatorsCheck(variable: ProjectVariable, variables: readonly ProjectVariable[]): VariableCheck {
  const names = variable.possibleIndicators.map((indicator) => indicator.name.toLowerCase());
  if (names.length === 0) return check("indicators", "missing", "Add at least one indicator: an observable sign of the variable that you can measure.");
  const repeated = [...new Set(names.filter((name, index) => names.indexOf(name) !== index))];
  if (repeated.length > 0) return check("indicators", "worth-checking", `The indicator ${quote(repeated)} is listed more than once. Each indicator should measure something distinct.`);
  const shared = variable.possibleIndicators.filter((indicator) =>
    variables.some((other) => other.id !== variable.id && other.possibleIndicators.some((candidate) => candidate.name.toLowerCase() === indicator.name.toLowerCase())),
  );
  if (shared.length > 0) {
    return check("indicators", "worth-checking", `${quote(shared.map((indicator) => indicator.name))} also measures another variable. An indicator shared between variables makes them hard to tell apart.`);
  }
  return check("indicators", "aligned", `${variable.possibleIndicators.length === 1 ? "One indicator" : `${variable.possibleIndicators.length} distinct indicators`} ${variable.possibleIndicators.length === 1 ? "is" : "are"} listed.`);
}

function measurementCheck(variable: ProjectVariable, project: ResearchProjectDraft): VariableCheck {
  if (!variable.measurementLevel) return check("measurement", "missing", "Choose a measurement level, so it is clear what kind of data the variable produces.");
  const level = variable.measurementLevel;
  const levelName = MEASUREMENT_LEVEL_INFO[level].label.toLowerCase();
  const clashing = variable.possibleIndicators.filter((indicator) => indicator.level && levelFit(level, indicator.level) === "inconsistent");
  if (clashing.length > 0) {
    return check(
      "measurement",
      "clarify",
      `The variable is ${levelName}, but ${quote(clashing.map((indicator) => indicator.name))} ${clashing.length === 1 ? "is" : "are"} measured at a level that doesn't combine with it. Check how the indicators will be combined into the variable.`,
    );
  }
  const unmeasured = variable.possibleIndicators.filter((indicator) => !indicator.measurement.trim());
  if (unmeasured.length > 0) return check("measurement", "missing", `Say how ${quote(unmeasured.map((indicator) => indicator.name))} will be measured.`);
  if (!variable.measurementScale.trim()) return check("measurement", "missing", "Describe the measurement scale, such as the answer options, the range or the unit.");
  const methodology = project.methodology ?? project.researchOnionSelection?.choice;
  if (level === "open-ended" && methodology === "quantitative" && (variable.variableType === "dependent" || variable.variableType === "independent")) {
    return check("measurement", "worth-checking", "Open-ended answers need coding before they can be analysed statistically, which a quantitative design usually expects for its main variables.");
  }
  if (level === "likert" && !/\d/.test(variable.measurementScale)) {
    return check("measurement", "review", "State how many points the rating scale has and what its ends mean, such as “1 = strongly disagree to 5 = strongly agree”.");
  }
  const debatable = variable.possibleIndicators.filter((indicator) => indicator.level && levelFit(level, indicator.level) === "review");
  if (debatable.length > 0) {
    return check(
      "measurement",
      "review",
      `Rated items (${quote(debatable.map((indicator) => indicator.name))}) are combined into a numerical variable. Whether such scores can be treated as numbers is debated; say how you will treat them.`,
    );
  }
  return check("measurement", "aligned", `Measured at the ${levelName} level, with a scale and a measurement for every indicator.`);
}

function conceptualCheck(variable: ProjectVariable): VariableCheck {
  if (!variable.conceptualDefinition.trim()) {
    return check("conceptual", "missing", "Add a conceptual definition: what the variable means, usually drawn from the literature.");
  }
  return check("conceptual", "review", "A conceptual definition is in place. Check that it matches how the literature you cite defines the concept.");
}

function operationalCheck(variable: ProjectVariable): VariableCheck {
  const definition = variable.operationalDefinition;
  if (!definition.trim()) return check("operational", "missing", "Add an operational definition: exactly how the variable will be observed or measured in this study.");
  if (!variable.conceptualDefinition.trim()) {
    return check("operational", "clarify", "There is an operational definition but no conceptual one. An operational definition should put a stated concept into practice.");
  }
  const indicators = variable.possibleIndicators;
  if (indicators.length > 0 && !indicators.some((indicator) => containsPhrase(definition, indicator.name))) {
    return check("operational", "worth-checking", `The operational definition doesn't mention any of the indicators (${quote(indicators.map((indicator) => indicator.name))}). Check that the definition and the indicators describe the same measurement.`);
  }
  return check("operational", "aligned", indicators.length > 0 ? "The operational definition refers to the indicators." : "An operational definition is in place.");
}

function questionCheck(variable: ProjectVariable, project: ResearchProjectDraft, named: boolean): VariableCheck {
  if (!project.researchQuestion) return check("question", "missing", "Add your research question, so each variable can be traced to it.");
  if (named) return check("question", "aligned", "Your research question names this variable.");
  if (BACKGROUND_KINDS.includes(variable.variableType) || variable.variableType === "mediator" || variable.variableType === "moderator") {
    return check("question", "review", `Your research question doesn't name it. That is common for ${kindLabel(variable.variableType)}s; check that its role is clear elsewhere.`);
  }
  return check("question", "worth-checking", `Your research question doesn't name this ${kindLabel(variable.variableType)}. Main variables are usually named in the question.`);
}

function objectivesCheck(variable: ProjectVariable, project: ResearchProjectDraft, objectives: string[]): VariableCheck {
  if ((project.researchObjectives ?? []).length === 0) return check("objectives", "missing", "Add your research objectives, so each variable can be traced to one.");
  if (objectives.length > 0) return check("objectives", "aligned", `The objective “${objectives[0]}” names this variable.`);
  if (BACKGROUND_KINDS.includes(variable.variableType)) return check("objectives", "review", `No objective names it, which is common for ${kindLabel(variable.variableType)}s.`);
  return check("objectives", "worth-checking", "No objective names this variable. Each main variable should serve at least one objective.");
}

function hypothesesCheck(variable: ProjectVariable, project: ResearchProjectDraft, kinds: VariableKind[]): VariableCheck {
  if ((project.hypotheses ?? []).length === 0) {
    return check("hypotheses", "review", "Your project has no hypotheses. That is usual for qualitative studies; if yours tests hypotheses, add them with the Hypothesis Builder.");
  }
  const distinct = [...new Set(kinds)];
  if (distinct.length === 0) {
    if (BACKGROUND_KINDS.includes(variable.variableType)) return check("hypotheses", "review", `No hypothesis names it, which is common for ${kindLabel(variable.variableType)}s.`);
    return check("hypotheses", "worth-checking", "No hypothesis names this variable. Check whether a hypothesis is missing, or whether the variable is needed.");
  }
  if (!distinct.includes(variable.variableType)) {
    return check("hypotheses", "clarify", `Your hypotheses treat it as ${joinList(distinct.map(kindLabel))}, but here it is ${kindLabel(variable.variableType)}. Make the two agree.`);
  }
  return check("hypotheses", "aligned", `Your hypotheses treat it as ${kindLabel(variable.variableType)}, as here.`);
}

function frameworkCheck(variable: ProjectVariable, project: ResearchProjectDraft, box: ReturnType<typeof connectionsFor>["framework"]): VariableCheck {
  if (!project.conceptualFramework) return check("framework", "review", "Your project has no conceptual framework yet. Build one to see how the variables relate.");
  if (!box) return check("framework", "worth-checking", "Your conceptual framework has no box for this variable.");
  const boxKind = FRAMEWORK_KIND[box.type];
  if (boxKind === variable.variableType) return check("framework", "aligned", `Your conceptual framework shows it as ${kindLabel(boxKind)}, as here.`);
  if (variable.variableType === "confounding" && boxKind === "extraneous") {
    return check("framework", "aligned", "Your conceptual framework shows it as an extraneous variable, the closest box type to a confounding variable.");
  }
  return check("framework", "clarify", `Your conceptual framework shows it as ${kindLabel(boxKind)}, but here it is ${kindLabel(variable.variableType)}. Make the two agree.`);
}

/** Every check for one variable, in a fixed order. */
export function validateVariable(variable: ProjectVariable, variables: readonly ProjectVariable[], project: ResearchProjectDraft): VariableCheck[] {
  const connections = connectionsFor(variable, project);
  return [
    duplicateCheck(variable, variables),
    indicatorsCheck(variable, variables),
    measurementCheck(variable, project),
    conceptualCheck(variable),
    operationalCheck(variable),
    questionCheck(variable, project, connections.question),
    objectivesCheck(variable, project, connections.objectives),
    hypothesesCheck(variable, project, connections.hypotheses.map((entry) => entry.asKind)),
    frameworkCheck(variable, project, connections.framework),
  ];
}

export interface SetCheck {
  check: "independent" | "dependent" | "duplicates";
  label: string;
  status: CheckStatus;
  explanation: string;
}

/** Checks of the whole set: an independent and a dependent variable, and no duplicates. */
export function validateSet(variables: readonly ProjectVariable[]): SetCheck[] {
  const has = (kind: VariableKind) => variables.some((variable) => variable.variableType === kind);
  const names = variables.map((variable) => variable.name.toLowerCase());
  const repeated = [...new Set(variables.filter((variable, index) => names.indexOf(variable.name.toLowerCase()) !== index).map((variable) => variable.name))];
  return [
    has("independent")
      ? { check: "independent", label: "Independent variable", status: "aligned", explanation: "At least one independent variable is listed." }
      : { check: "independent", label: "Independent variable", status: "missing", explanation: "No independent variable is listed. Most studies of relationships or effects need at least one; exploratory studies may not." },
    has("dependent")
      ? { check: "dependent", label: "Dependent variable", status: "aligned", explanation: "At least one dependent variable is listed." }
      : { check: "dependent", label: "Dependent variable", status: "missing", explanation: "No dependent variable is listed. A study usually needs at least one outcome to measure." },
    repeated.length > 0
      ? { check: "duplicates", label: "Duplicate variables", status: "worth-checking", explanation: `${quote(repeated)} ${repeated.length === 1 ? "appears" : "appear"} more than once. Combine or rename them.` }
      : { check: "duplicates", label: "Duplicate variables", status: "aligned", explanation: "Every variable has a distinct name." },
  ];
}
