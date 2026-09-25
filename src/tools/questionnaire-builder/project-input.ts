/**
 * Turns what the researcher types in the project step into a project draft. Until the
 * research tools share a saved project, this is how the builder learns the variables,
 * indicators and measurement levels its questions come from.
 */

import {
  EMPTY_SAMPLING_PLAN,
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
  variablesFromLines,
  type MeasurementLevel,
  type ProjectVariable,
  type ResearchProjectDraft,
  type VariableKind,
} from "../../knowledge/research";

export { parseVariableLines, type VariableLine } from "../../knowledge/research";

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

/** The variables typed in, with their indicators. A name in more than one list keeps its first kind. */
export function variablesFromInputs(inputs: ProjectInputs, levels: Readonly<Record<string, MeasurementLevel | "">> = {}): ProjectVariable[] {
  return variablesFromLines(
    [
      [inputs.independent, "independent"],
      [inputs.dependent, "dependent"],
      [inputs.control, "control"],
    ],
    levels,
  );
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
