/** Builds projects and measured variables for data analysis tests. Not part of the product. */

import type { Measure, MeasuredVariable } from "./data-analysis-profile";
import { applyDesign } from "./design-summary";
import type { DesignId } from "./design-types";
import type { HypothesisForm, ProjectHypothesis, RelationshipKind } from "./hypothesis-types";
import { createQuestion } from "./questionnaire-items";
import type { Question, QuestionType } from "./questionnaire-types";
import { EMPTY_DESIGN, chooseDesign } from "./research-design";
import { createProjectDraft, updateProjectDraft, type ResearchProjectDraft } from "./research-project";
import { DEFAULT_SAMPLE_SIZE_PLAN, updateInputs } from "./sample-size";
import { applySampleSize } from "./sample-size-summary";
import { EMPTY_SAMPLING_PLAN, chooseTechnique } from "./sampling";
import { applySampling } from "./sampling-summary";
import type { SamplingTechniqueId } from "./sampling-types";
import type { OnionSelection } from "./types";
import { addIndicator, addVariable, updateVariable } from "./variable-builder";
import { applyVariables } from "./variable-summary";
import type { MeasurementLevel, ProjectVariable, VariableKind } from "./variable-types";

/** A measured variable for rule tests. */
export const mv = (name: string, measure: Measure, extra: Partial<MeasuredVariable> = {}): MeasuredVariable => ({
  id: `var-${name}`,
  name,
  kind: "independent",
  measure,
  items: measure === "scale-score" ? 4 : 0,
  groups: measure === "binary" ? 2 : null,
  source: `${name} source`,
  ...extra,
});

export interface HypothesisSpec {
  form: HypothesisForm;
  kind?: RelationshipKind;
  ivs: string[];
  dvs: string[];
  moderators?: string[];
  mediators?: string[];
  controls?: string[];
}

export interface ProjectSpec {
  /** Name, kind and level of each variable. */
  variables?: [string, VariableKind, MeasurementLevel | null][];
  hypotheses?: HypothesisSpec[];
  design?: DesignId;
  onion?: OnionSelection;
  /** A margin of error for a Cochran sample size: 5 gives 385, 7 gives 196, 10 gives 97, 20 gives 25. */
  margin?: number;
  sampling?: SamplingTechniqueId;
  /** Rating questions to add for a variable, by name. */
  items?: Record<string, number>;
  /** Other questions to add for a variable, by name. */
  questions?: [string, QuestionType, string[]?][];
  objectives?: string[];
}

export const slug = (name: string) => `var-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

export function hypothesis(id: string, spec: HypothesisSpec): ProjectHypothesis {
  return {
    id,
    role: "alternative",
    text: `${spec.ivs.join(" and ")} ${spec.form === "difference" ? "differs" : spec.form === "prediction" ? "predicts" : "relates to"} ${spec.dvs.join(" and ")}`,
    relationship: {
      kind: spec.kind ?? (spec.moderators?.length ? "moderation" : spec.mediators?.length ? "mediation" : "main"),
      form: spec.form,
      direction: "non-directional",
      independentVariables: spec.ivs,
      dependentVariables: spec.dvs,
      moderators: spec.moderators ?? [],
      mediators: spec.mediators ?? [],
      controls: spec.controls ?? [],
      population: null,
      context: null,
    },
  };
}

/** A project from a spec, built only with the tools' own functions. */
export function build(spec: ProjectSpec): ResearchProjectDraft {
  let project = createProjectDraft(spec.objectives ? { researchObjectives: spec.objectives } : {});
  if (spec.variables) {
    let variables: ProjectVariable[] = [];
    for (const [name, kind, level] of spec.variables) {
      variables = addVariable(variables, name, kind);
      if (level) variables = updateVariable(variables, slug(name), { measurementLevel: level });
    }
    project = applyVariables(project, variables);
  }
  if (spec.hypotheses) project = updateProjectDraft(project, { hypotheses: spec.hypotheses.map((item, index) => hypothesis(`h${index + 1}`, item)) });
  if (spec.design) project = applyDesign(project, chooseDesign(EMPTY_DESIGN, spec.design));
  if (spec.onion) project = updateProjectDraft(project, { researchOnionSelection: spec.onion });
  if (spec.margin !== undefined) project = applySampleSize(project, updateInputs(DEFAULT_SAMPLE_SIZE_PLAN, { margin: spec.margin }));
  if (spec.sampling) project = applySampling(project, chooseTechnique(EMPTY_SAMPLING_PLAN, spec.sampling));
  const questions: Question[] = [];
  for (const [name, count] of Object.entries(spec.items ?? {})) {
    for (let index = 0; index < count; index++) questions.push(createQuestion(`q-${questions.length + 1}`, "items", { type: "likert", variableId: slug(name) }));
  }
  for (const [name, type, options] of spec.questions ?? []) {
    questions.push({ ...createQuestion(`q-${questions.length + 1}`, "items", { type, variableId: slug(name) }), options: options ?? [] });
  }
  if (questions.length > 0) project = updateProjectDraft(project, { questionnaire: { title: "", sections: [{ id: "items", kind: "items", title: "Items", content: "" }], questions } });
  return project;
}

/** Adds indicators, each with a level, to a variable in a project. */
export function withIndicators(project: ResearchProjectDraft, name: string, levels: (MeasurementLevel | null)[]): ResearchProjectDraft {
  let variables = [...(project.variables ?? [])];
  levels.forEach((level, index) => {
    variables = addIndicator(variables, slug(name), { name: `${name} indicator ${index + 1}`, level });
  });
  return applyVariables(project, variables);
}
