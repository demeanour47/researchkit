/**
 * Turns what the researcher types in the project step into a project draft, using the
 * other tools' own functions for hypotheses, design, sampling and sample size. Until the
 * research tools share a saved project, this is how the recommender learns about it.
 */

import {
  DEFAULT_SAMPLE_SIZE_PLAN,
  EMPTY_DESIGN,
  EMPTY_SAMPLING_PLAN,
  applyDesign,
  applyHypotheses,
  applySampleSize,
  applySampling,
  applyVariables,
  chooseDesign,
  chooseTechnique,
  createProjectDraft,
  generateHypotheses,
  parseList,
  toProjectHypotheses,
  updateInputs,
  updateProjectDraft,
  variablesFromLines,
  type DesignId,
  type HypothesisForm,
  type MeasurementLevel,
  type ProjectVariable,
  type ResearchProjectDraft,
  type SamplingTechniqueId,
  type VariableKind,
} from "../../knowledge/research";

export interface ProjectInputs {
  researchQuestion: string;
  researchObjectives: string;
  independent: string;
  dependent: string;
  moderator: string;
  mediator: string;
  control: string;
  philosophy: string;
  approach: string;
  choice: string;
  timeHorizon: string;
  design: string;
  technique: string;
  /** The margin of error of a Cochran sample size plan, as text, or empty for none. */
  margin: string;
  /** The form of hypotheses to draft, or empty for none. */
  hypotheses: "" | HypothesisForm;
}

export const EMPTY_PROJECT_INPUTS: ProjectInputs = {
  researchQuestion: "",
  researchObjectives: "",
  independent: "",
  dependent: "",
  moderator: "",
  mediator: "",
  control: "",
  philosophy: "",
  approach: "",
  choice: "",
  timeHorizon: "",
  design: "",
  technique: "",
  margin: "",
  hypotheses: "",
};

export const VARIABLE_FIELDS = ["independent", "dependent", "moderator", "mediator", "control"] as const satisfies readonly (keyof ProjectInputs & VariableKind)[];

/** The variables typed in, in the order of the fields. */
export function variablesFromInputs(inputs: ProjectInputs, levels: Readonly<Record<string, MeasurementLevel | "">> = {}): ProjectVariable[] {
  return variablesFromLines(
    VARIABLE_FIELDS.map((field) => [inputs[field], field] as const),
    levels,
  );
}

/** The project the recommender reads, built with the other research tools' own functions. */
export function projectFromInputs(inputs: ProjectInputs, levels: Readonly<Record<string, MeasurementLevel | "">>): ResearchProjectDraft {
  const variables = variablesFromInputs(inputs, levels);
  const names = (kind: VariableKind) => variables.filter((variable) => variable.variableType === kind).map((variable) => variable.name);
  const onion = Object.fromEntries((["philosophy", "approach", "choice", "timeHorizon"] as const).filter((layer) => inputs[layer]).map((layer) => [layer, inputs[layer]]));
  let project = createProjectDraft({
    researchQuestion: inputs.researchQuestion,
    researchObjectives: parseList(inputs.researchObjectives),
    independentVariables: names("independent"),
    dependentVariables: names("dependent"),
    moderatorVariables: names("moderator"),
    mediatorVariables: names("mediator"),
    controlVariables: names("control"),
    researchOnionSelection: onion,
  });
  if (inputs.hypotheses && names("independent").length > 0 && names("dependent").length > 0) {
    project = applyHypotheses(project, toProjectHypotheses(generateHypotheses(project, { form: inputs.hypotheses, direction: "non-directional" }), {}));
  }
  if (inputs.design) project = applyDesign(project, chooseDesign(EMPTY_DESIGN, inputs.design as DesignId));
  if (inputs.technique) project = applySampling(project, chooseTechnique(EMPTY_SAMPLING_PLAN, inputs.technique as SamplingTechniqueId));
  if (inputs.margin) project = applySampleSize(project, updateInputs(DEFAULT_SAMPLE_SIZE_PLAN, { margin: Number(inputs.margin) }));
  if (variables.length > 0) project = applyVariables(project, variables);
  return updateProjectDraft(project, {});
}

/** Sample size plans offered in the project step: a Cochran plan at each margin of error, as the Sample Size Calculator makes. */
export const MARGINS = ["3", "5", "7", "10", "20"] as const;
