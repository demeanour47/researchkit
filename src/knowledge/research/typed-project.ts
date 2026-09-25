/**
 * A project draft from what a researcher types into a research tool's project step:
 * variables with indicators and levels, hypotheses drafted by the Hypothesis Builder's
 * rules, onion choices, design, sampling and a sample size plan, each built with the
 * owning tool's own functions. The stopgap until the research tools share a saved
 * project; used by every tool that needs the whole project.
 */

import { applyDesign } from "./design-summary";
import type { DesignId } from "./design-types";
import { generateHypotheses } from "./hypothesis-builder";
import { applyHypotheses, toProjectHypotheses } from "./hypothesis-summary";
import type { HypothesisForm } from "./hypothesis-types";
import { EMPTY_DESIGN, chooseDesign } from "./research-design";
import { createProjectDraft, parseList, updateProjectDraft, type ResearchProjectDraft } from "./research-project";
import { DEFAULT_SAMPLE_SIZE_PLAN, updateInputs } from "./sample-size";
import { applySampleSize } from "./sample-size-summary";
import { EMPTY_SAMPLING_PLAN, chooseTechnique } from "./sampling";
import { applySampling } from "./sampling-summary";
import type { SamplingTechniqueId } from "./sampling-types";
import { applyVariables } from "./variable-summary";
import { variablesFromLines } from "./variable-lines";
import type { MeasurementLevel, ProjectVariable, VariableKind } from "./variable-types";

export interface TypedProject {
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

export const EMPTY_TYPED_PROJECT: TypedProject = {
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

export const TYPED_VARIABLE_FIELDS = ["independent", "dependent", "moderator", "mediator", "control"] as const satisfies readonly (keyof TypedProject & VariableKind)[];

/** The variables typed in, in the order of the fields. */
export function variablesFromTyped(inputs: TypedProject, levels: Readonly<Record<string, MeasurementLevel | "">> = {}): ProjectVariable[] {
  return variablesFromLines(
    TYPED_VARIABLE_FIELDS.map((field) => [inputs[field], field] as const),
    levels,
  );
}

/** The project the recommender reads, built with the other research tools' own functions. */
export function projectFromTyped(inputs: TypedProject, levels: Readonly<Record<string, MeasurementLevel | "">>): ResearchProjectDraft {
  const variables = variablesFromTyped(inputs, levels);
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
export const TYPED_MARGINS = ["3", "5", "7", "10", "20"] as const;
