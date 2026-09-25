/**
 * Turns what the researcher types in the project step into a project draft. Until the
 * research tools share a saved project, this is how the builder learns the variables,
 * indicators and measurement levels its questions come from.
 */

import {
  EMPTY_SAMPLING_PLAN,
  addIndicator,
  addProjectVariable,
  applyHypotheses,
  applySampling,
  applyVariables,
  createProjectDraft,
  frameworkFromProject,
  generateHypotheses,
  parseList,
  toProjectHypotheses,
  updatePopulation,
  updateProjectDraft,
  updateVariable,
  type MeasurementLevel,
  type ProjectVariable,
  type ResearchProjectDraft,
  type VariableKind,
} from "../../knowledge/research";

export interface VariableLine {
  name: string;
  indicators: string[];
}

/**
 * One variable per line, with its indicators after a colon, separated by semicolons:
 * “sleep quality: time to fall asleep; feeling rested”. Repeated names are merged.
 */
export function parseVariableLines(text: string): VariableLine[] {
  const lines: VariableLine[] = [];
  for (const raw of text.split("\n")) {
    const colon = raw.indexOf(":");
    const name = (colon === -1 ? raw : raw.slice(0, colon)).replace(/\s+/g, " ").trim();
    if (!name) continue;
    const indicators = colon === -1 ? [] : raw.slice(colon + 1).split(";").map((indicator) => indicator.replace(/\s+/g, " ").trim()).filter(Boolean);
    const existing = lines.find((line) => line.name.toLowerCase() === name.toLowerCase());
    if (existing) existing.indicators.push(...indicators.filter((indicator) => !existing.indicators.some((known) => known.toLowerCase() === indicator.toLowerCase())));
    else lines.push({ name, indicators: [...new Set(indicators)] });
  }
  return lines;
}

export interface ProjectInputs {
  topic: string;
  researchAim: string;
  researchQuestion: string;
  researchObjectives: string;
  independent: string;
  dependent: string;
  control: string;
  targetPopulation: string;
}

export const EMPTY_PROJECT_INPUTS: ProjectInputs = { topic: "", researchAim: "", researchQuestion: "", researchObjectives: "", independent: "", dependent: "", control: "", targetPopulation: "" };

const KINDS: [keyof ProjectInputs, VariableKind][] = [
  ["independent", "independent"],
  ["dependent", "dependent"],
  ["control", "control"],
];

/** The variables typed in, with their indicators. A name in more than one list keeps its first kind. */
export function variablesFromInputs(inputs: ProjectInputs, levels: Readonly<Record<string, MeasurementLevel | "">> = {}): ProjectVariable[] {
  let variables: ProjectVariable[] = [];
  for (const [field, kind] of KINDS) {
    for (const line of parseVariableLines(inputs[field])) {
      if (variables.some((variable) => variable.name.toLowerCase() === line.name.toLowerCase())) continue;
      variables = addProjectVariable(variables, line.name, kind);
      const id = variables[variables.length - 1].id;
      for (const indicator of line.indicators) variables = addIndicator(variables, id, { name: indicator });
      const level = levels[id];
      if (level) variables = updateVariable(variables, id, { measurementLevel: level });
    }
  }
  return variables;
}

/**
 * The project the builder reads: the typed details, hypotheses drafted with the
 * Hypothesis Builder's rules if asked, a framework drawn from them as the Conceptual
 * Framework Builder would, the variables with their indicators, and who will answer.
 */
export function projectFromInputs(inputs: ProjectInputs, levels: Readonly<Record<string, MeasurementLevel | "">>, withHypotheses: boolean): ResearchProjectDraft {
  const variables = variablesFromInputs(inputs, levels);
  const names = (kind: VariableKind) => variables.filter((variable) => variable.variableType === kind).map((variable) => variable.name);
  let project = createProjectDraft({
    topic: inputs.topic,
    researchAim: inputs.researchAim,
    researchQuestion: inputs.researchQuestion,
    researchObjectives: parseList(inputs.researchObjectives),
    independentVariables: names("independent"),
    dependentVariables: names("dependent"),
    controlVariables: names("control"),
  });
  if (withHypotheses && names("independent").length > 0 && names("dependent").length > 0) {
    project = applyHypotheses(project, toProjectHypotheses(generateHypotheses(project, { form: "relationship", direction: "non-directional" }), {}));
  }
  if (variables.length > 0) project = updateProjectDraft(project, { conceptualFramework: frameworkFromProject(project) });
  if (inputs.targetPopulation.trim()) project = applySampling(project, updatePopulation(EMPTY_SAMPLING_PLAN, { targetPopulation: inputs.targetPopulation }));
  return variables.length > 0 ? applyVariables(project, variables) : project;
}
