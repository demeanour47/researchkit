/** Builds projects of a given shape for conceptual framework tests. Not part of the product. */

import { frameworkFromProject } from "./conceptual-framework";
import type { ConceptualFramework } from "./conceptual-types";
import { generateHypotheses } from "./hypothesis-builder";
import { applyHypotheses, toProjectHypotheses } from "./hypothesis-summary";
import { createProjectDraft, type ResearchProjectDraft } from "./research-project";

const names = (prefix: string, count: number) => Array.from({ length: count }, (_, index) => `${prefix} ${index + 1}`);

export interface Shape {
  independent: number;
  dependent: number;
  mediators: number;
  moderators: number;
  controls?: number;
}

/** A project with the given numbers of variables, and hypotheses for every relationship between them. */
export function projectOfShape(shape: Shape): ResearchProjectDraft {
  const project = createProjectDraft({
    population: "adults",
    independentVariables: names("predictor", shape.independent),
    dependentVariables: names("outcome", shape.dependent),
    mediatorVariables: names("mediator", shape.mediators),
    moderatorVariables: names("moderator", shape.moderators),
    controlVariables: names("control", shape.controls ?? 0),
  });
  if (shape.independent === 0 || shape.dependent === 0) return project;
  return applyHypotheses(project, toProjectHypotheses(generateHypotheses(project, { form: "prediction", direction: "non-directional" }), {}));
}

export const frameworkOfShape = (shape: Shape): ConceptualFramework => frameworkFromProject(projectOfShape(shape));
