/**
 * Brings together the variables a project already names: in its variable lists, its
 * hypotheses and its conceptual framework, so nothing has to be typed again. A name
 * found in several places becomes one variable that remembers every place. Nothing is
 * invented: only names, types and descriptions already in the project are used.
 */

import type { VariableType } from "./conceptual-types";
import type { HypothesisRelationship } from "./hypothesis-types";
import type { ResearchProjectDraft } from "./research-project";
import { createVariable } from "./variable-builder";
import type { ProjectVariable, VariableKind, VariableSource } from "./variable-types";

/** Framework box types and variable kinds share names; confounding variables have no box type of their own. */
export const FRAMEWORK_KIND: Readonly<Record<VariableType, VariableKind>> = {
  independent: "independent",
  dependent: "dependent",
  mediator: "mediator",
  moderator: "moderator",
  control: "control",
  extraneous: "extraneous",
};

/** The kinds a hypothesis's relationship gives each of its variables. */
export function hypothesisKinds(relationship: HypothesisRelationship): [string, VariableKind][] {
  return [
    ...relationship.independentVariables.map((name) => [name, "independent"] as [string, VariableKind]),
    ...relationship.dependentVariables.map((name) => [name, "dependent"] as [string, VariableKind]),
    ...relationship.mediators.map((name) => [name, "mediator"] as [string, VariableKind]),
    ...relationship.moderators.map((name) => [name, "moderator"] as [string, VariableKind]),
    ...relationship.controls.map((name) => [name, "control"] as [string, VariableKind]),
  ];
}

const sameSource = (a: VariableSource, b: VariableSource) => a.kind === b.kind && a.asKind === b.asKind;

/** Records a source on a variable, merging references with an existing source of the same kind. */
function withSource(variable: ProjectVariable, source: VariableSource): ProjectVariable {
  const existing = variable.sources.find((candidate) => sameSource(candidate, source));
  if (!existing) return { ...variable, sources: [...variable.sources, source] };
  return {
    ...variable,
    sources: variable.sources.map((candidate) =>
      candidate === existing ? { ...candidate, references: [...new Set([...candidate.references, ...source.references])] } : candidate,
    ),
  };
}

/** The variables a project names, in the order: variable lists, hypotheses, framework. */
export function importVariables(project: ResearchProjectDraft): ProjectVariable[] {
  let variables: ProjectVariable[] = [];
  const add = (name: string, source: VariableSource, extra: Partial<Pick<ProjectVariable, "description" | "shortName">> = {}) => {
    const key = name.trim().toLowerCase();
    if (!key) return;
    const index = variables.findIndex((variable) => variable.name.toLowerCase() === key);
    if (index === -1) {
      const created = createVariable(name, source.asKind ?? "independent", new Set(variables.map((variable) => variable.id)), source);
      variables = [...variables, { ...created, ...Object.fromEntries(Object.entries(extra).filter(([, value]) => value)) }];
      return;
    }
    let variable = withSource(variables[index], source);
    if (!variable.description && extra.description) variable = { ...variable, description: extra.description };
    variables = variables.map((candidate, at) => (at === index ? variable : candidate));
  };

  const lists: [readonly string[] | undefined, VariableKind][] = [
    [project.independentVariables, "independent"],
    [project.dependentVariables, "dependent"],
    [project.mediatorVariables, "mediator"],
    [project.moderatorVariables, "moderator"],
    [project.controlVariables, "control"],
  ];
  for (const [names, kind] of lists) for (const name of names ?? []) add(name, { kind: "list", asKind: kind, references: [] });

  for (const hypothesis of project.hypotheses ?? []) {
    for (const [name, kind] of hypothesisKinds(hypothesis.relationship)) add(name, { kind: "hypothesis", asKind: kind, references: [hypothesis.id] });
  }

  for (const box of project.conceptualFramework?.variables ?? []) {
    add(box.name, { kind: "framework", asKind: FRAMEWORK_KIND[box.type], references: [box.id] }, { description: box.description, shortName: box.shortLabel });
  }
  return variables;
}

/**
 * Adds newly found variables to an existing list without touching the researcher's
 * edits: existing variables keep every detail and only gain new sources.
 */
export function mergeImported(existing: readonly ProjectVariable[], imported: readonly ProjectVariable[]): ProjectVariable[] {
  let merged = [...existing];
  for (const variable of imported) {
    const index = merged.findIndex((candidate) => candidate.name.toLowerCase() === variable.name.toLowerCase());
    if (index === -1) {
      const taken = new Set(merged.map((candidate) => candidate.id));
      merged = [...merged, taken.has(variable.id) ? createVariableLike(variable, taken) : variable];
    } else {
      merged[index] = variable.sources.reduce(withSource, merged[index]);
    }
  }
  return merged;
}

function createVariableLike(variable: ProjectVariable, taken: ReadonlySet<string>): ProjectVariable {
  const fresh = createVariable(variable.name, variable.variableType, taken);
  return { ...variable, id: fresh.id, possibleIndicators: variable.possibleIndicators.map((indicator, index) => ({ ...indicator, id: `${fresh.id}-ind-${index + 1}` })) };
}
