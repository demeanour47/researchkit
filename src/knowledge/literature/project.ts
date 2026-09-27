/**
 * The project as the matrix sees it: the topic, research question, objectives,
 * hypotheses and variables already in the project draft, so none is typed again. Each
 * study is compared with it to show which of the project's variables it covers.
 */

import type { ResearchProjectDraft } from "../research/research-project";
import type { VariableKind } from "../research/variable-types";
import { listItems } from "./matrix";
import { fold } from "./query";
import type { MatrixField, Study } from "./types";

export interface ProjectLens {
  topic: string;
  researchQuestion: string;
  objectives: string[];
  hypotheses: string[];
  variables: { name: string; kind: VariableKind }[];
}

/** What the matrix reads from the project draft. */
export function projectLens(project: ResearchProjectDraft): ProjectLens {
  return {
    topic: project.topic?.trim() ?? "",
    researchQuestion: project.researchQuestion?.trim() ?? "",
    objectives: (project.researchObjectives ?? []).map((objective) => objective.trim()).filter(Boolean),
    hypotheses: (project.hypotheses ?? []).filter((hypothesis) => hypothesis.role === "alternative").map((hypothesis) => hypothesis.text),
    variables: (project.variables ?? []).map((variable) => ({ name: variable.name, kind: variable.variableType })),
  };
}

export const isEmptyLens = (lens: ProjectLens) => !lens.topic && !lens.researchQuestion && lens.objectives.length === 0 && lens.hypotheses.length === 0 && lens.variables.length === 0;

/** The columns where a study names its variables. */
export const VARIABLE_FIELDS: readonly MatrixField[] = ["variables", "independent", "dependent", "mediator", "moderator"];

/** Whether a study mentions a term: in its variable columns, or anywhere in its aims and findings. Words match whole. */
export function mentions(study: Study, term: string, fields: readonly MatrixField[] = [...VARIABLE_FIELDS, "objectives", "problem", "findings", "title"]): boolean {
  const needle = fold(term);
  if (!needle) return false;
  const pattern = new RegExp(`(^|[^a-z0-9])${needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9]|$)`);
  return fields.some((field) => pattern.test(fold(study.fields[field])));
}

/** The project's variables a study covers, in the project's order. */
export const coveredVariables = (study: Study, lens: ProjectLens) => lens.variables.filter((variable) => mentions(study, variable.name)).map((variable) => variable.name);

/** Every variable a study names, across its variable columns, without repeats. */
export function studyVariables(study: Study): string[] {
  const seen = new Map<string, string>();
  for (const field of VARIABLE_FIELDS) for (const item of listItems(study.fields[field])) if (!seen.has(fold(item))) seen.set(fold(item), item);
  return [...seen.values()];
}
