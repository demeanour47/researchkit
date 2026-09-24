/**
 * How each variable connects to the rest of the project: where it came from, and
 * where it appears in the research question, objectives, hypotheses and conceptual
 * framework. Computed from the project each time, so it can never go out of date.
 */

import type { FrameworkRelationship, FrameworkVariable } from "./conceptual-types";
import type { ProjectHypothesis } from "./hypothesis-types";
import { containsPhrase } from "./question-text";
import type { ResearchProjectDraft } from "./research-project";
import { hypothesisKinds } from "./variables";
import { VARIABLE_KIND_INFO, type ProjectVariable, type VariableKind, type VariableSource } from "./variable-types";

export interface VariableConnections {
  /** Whether the research question names the variable. */
  question: boolean;
  /** Objectives that name it. */
  objectives: string[];
  /** Hypotheses that name it, with the kind each gives it. */
  hypotheses: { hypothesis: ProjectHypothesis; asKind: VariableKind }[];
  /** Its box in the conceptual framework, if there is one. */
  framework: FrameworkVariable | null;
  /** Framework relationships to or from that box. */
  frameworkRelationships: FrameworkRelationship[];
}

export function connectionsFor(variable: ProjectVariable, project: ResearchProjectDraft): VariableConnections {
  const name = variable.name.toLowerCase();
  const framework = project.conceptualFramework?.variables.find((box) => box.name.toLowerCase() === name) ?? null;
  return {
    question: project.researchQuestion ? containsPhrase(project.researchQuestion, variable.name) : false,
    objectives: (project.researchObjectives ?? []).filter((objective) => containsPhrase(objective, variable.name)),
    hypotheses: (project.hypotheses ?? []).flatMap((hypothesis) =>
      hypothesisKinds(hypothesis.relationship)
        .filter(([candidate]) => candidate.toLowerCase() === name)
        .map(([, asKind]) => ({ hypothesis, asKind })),
    ),
    framework,
    frameworkRelationships: framework
      ? (project.conceptualFramework?.relationships ?? []).filter((relationship) => relationship.source === framework.id || relationship.target === framework.id)
      : [],
  };
}

const article = (text: string) => (/^[aeiou]/i.test(text) ? "an" : "a");
const kindPhrase = (kind: VariableKind | null) => {
  if (!kind) return "a variable";
  const label = VARIABLE_KIND_INFO[kind].label.toLowerCase();
  return `${article(label)} ${label}`;
};

/** One sentence per source, saying where the variable came from. */
export function describeSource(source: VariableSource, variables: readonly ProjectVariable[] = []): string {
  switch (source.kind) {
    case "list":
      return `Listed as ${kindPhrase(source.asKind)} in your project details.`;
    case "hypothesis": {
      const count = source.references.length;
      return `Named as ${kindPhrase(source.asKind)} in ${count} ${count === 1 ? "hypothesis" : "hypotheses"}.`;
    }
    case "framework":
      return `A box in your conceptual framework, as ${kindPhrase(source.asKind)}.`;
    case "user": {
      const original = variables.find((variable) => variable.id === source.references[0]);
      return original ? `Added by you, as a copy of “${original.name}”.` : "Added by you in the Variables Builder.";
    }
  }
}

export const originOf = (variable: ProjectVariable, variables: readonly ProjectVariable[] = []) => variable.sources.map((source) => describeSource(source, variables));

const SOURCE_NAMES: Readonly<Record<VariableSource["kind"], string>> = {
  list: "Project details",
  hypothesis: "Hypotheses",
  framework: "Framework",
  user: "Added by you",
};

/** A short list of where a variable came from, for tables: “Project details · Hypotheses · Framework”. */
export function originSummary(variable: ProjectVariable): string {
  return [...new Set(variable.sources.map((source) => SOURCE_NAMES[source.kind]))].join(" · ");
}
