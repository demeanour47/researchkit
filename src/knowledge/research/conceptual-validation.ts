/**
 * Warnings about a conceptual framework. Each explains why it matters; none blocks
 * editing. Checks compare the framework with the project's hypotheses and objectives.
 */

import { supportingObjectives } from "./conceptual-framework";
import type { FrameworkLayout } from "./conceptual-layout";
import { RELATIONSHIP_TYPE_INFO, type ConceptualFramework, type FrameworkRelationship } from "./conceptual-types";
import type { ResearchProjectDraft } from "./research-project";

export const WARNING_CODES = [
  "no-dependent",
  "no-independent",
  "disconnected",
  "loop",
  "duplicate",
  "unused",
  "hypothesis-alignment",
  "objective-alignment",
  "crossing",
  "overlap",
] as const;
export type WarningCode = (typeof WARNING_CODES)[number];

export interface FrameworkWarning {
  code: WarningCode;
  /** What was found. */
  message: string;
  /** Why it matters. */
  why: string;
  /** The variables and relationships involved, for highlighting. */
  targets: string[];
}

const quote = (name: string) => `“${name}”`;

/** Directed cycles among one-way relationships, each listed once, as variable ids. */
export function findLoops(framework: ConceptualFramework): string[][] {
  const next = new Map<string, string[]>();
  for (const relationship of framework.relationships) {
    if (RELATIONSHIP_TYPE_INFO[relationship.type].style.arrows !== "one-way") continue;
    if (relationship.type === "moderation" && relationship.moderates) continue;
    next.set(relationship.source, [...(next.get(relationship.source) ?? []), relationship.target]);
  }
  const loops: string[][] = [];
  const seen = new Set<string>();
  const state = new Map<string, "active" | "done">();
  const path: string[] = [];
  const visit = (id: string) => {
    state.set(id, "active");
    path.push(id);
    for (const target of next.get(id) ?? []) {
      if (state.get(target) === "active") {
        const cycle = path.slice(path.indexOf(target));
        const key = [...cycle].sort().join("|");
        if (!seen.has(key)) {
          seen.add(key);
          loops.push(cycle);
        }
      } else if (!state.has(target)) {
        visit(target);
      }
    }
    path.pop();
    state.set(id, "done");
  };
  for (const variable of framework.variables) if (!state.has(variable.id)) visit(variable.id);
  return loops;
}

/** Relationships that repeat another between the same two variables. */
export function findDuplicates(framework: ConceptualFramework): FrameworkRelationship[][] {
  const groups = new Map<string, FrameworkRelationship[]>();
  for (const relationship of framework.relationships) {
    const directed = RELATIONSHIP_TYPE_INFO[relationship.type].style.arrows === "one-way";
    const ends = directed ? [relationship.source, relationship.target] : [relationship.source, relationship.target].sort();
    const key = relationship.type === "moderation" ? `${relationship.source}|${relationship.moderates ?? relationship.target}|m` : ends.join("|");
    groups.set(key, [...(groups.get(key) ?? []), relationship]);
  }
  return [...groups.values()].filter((group) => group.length > 1);
}

export function validateFramework(framework: ConceptualFramework, project: ResearchProjectDraft, layout?: FrameworkLayout): FrameworkWarning[] {
  const warnings: FrameworkWarning[] = [];
  const name = (id: string) => framework.variables.find((variable) => variable.id === id)?.name ?? id;
  const { variables, relationships } = framework;

  if (variables.length > 0 && !variables.some((variable) => variable.type === "dependent")) {
    warnings.push({
      code: "no-dependent",
      message: "The framework has no dependent variable.",
      why: "A conceptual framework usually shows what the study explains: at least one outcome, or dependent variable.",
      targets: [],
    });
  }
  if (variables.length > 0 && !variables.some((variable) => variable.type === "independent")) {
    warnings.push({
      code: "no-independent",
      message: "The framework has no independent variable.",
      why: "A conceptual framework usually shows what is expected to influence the outcome: at least one independent variable.",
      targets: [],
    });
  }

  const connected = new Set(relationships.flatMap((relationship) => [relationship.source, relationship.target]));
  for (const variable of variables) {
    if (variable.type === "control" || variable.type === "extraneous" || connected.has(variable.id)) continue;
    warnings.push({
      code: "disconnected",
      message: `${quote(variable.name)} isn't connected to any other variable.`,
      why: "Every variable in the framework should play a part in a relationship. Connect it, or remove it if the study doesn't examine it.",
      targets: [variable.id],
    });
  }

  for (const loop of findLoops(framework)) {
    warnings.push({
      code: "loop",
      message: `The relationships form a loop: ${[...loop, loop[0]].map((id) => quote(name(id))).join(" → ")}.`,
      why: "A loop means each variable is expected to affect itself indirectly. Most research designs can't test that; check whether an arrow points the wrong way.",
      targets: loop,
    });
  }

  for (const group of findDuplicates(framework)) {
    const [first] = group;
    warnings.push({
      code: "duplicate",
      message: `There are ${group.length} relationships between ${quote(name(first.source))} and ${quote(name(first.target))}.`,
      why: "Two relationships between the same variables usually mean one is repeated, or that they should be combined into one with a clear meaning.",
      targets: group.map((relationship) => relationship.id),
    });
  }

  const hypothesisNames = new Set(
    (project.hypotheses ?? []).flatMap((hypothesis) => {
      const r = hypothesis.relationship;
      return [...r.independentVariables, ...r.dependentVariables, ...r.moderators, ...r.mediators, ...r.controls].map((value) => value.toLowerCase());
    }),
  );
  for (const variable of variables) {
    if (hypothesisNames.has(variable.name.toLowerCase())) continue;
    warnings.push({
      code: "unused",
      message: `${quote(variable.name)} isn't used in any hypothesis.`,
      why: "Variables in the framework normally appear in the hypotheses that the study will test. Add a hypothesis, or check whether the variable is needed.",
      targets: [variable.id],
    });
  }

  const hypothesisIds = new Set((project.hypotheses ?? []).map((hypothesis) => hypothesis.id));
  for (const relationship of relationships) {
    if (!relationship.hypothesisIds.some((id) => hypothesisIds.has(id))) {
      warnings.push({
        code: "hypothesis-alignment",
        message: `No hypothesis supports the relationship from ${quote(name(relationship.source))} to ${quote(name(relationship.target))}.`,
        why: "Each relationship in a conceptual framework should correspond to a hypothesis, so the figure shows what the study will test.",
        targets: [relationship.id],
      });
    }
    if (supportingObjectives(project, name(relationship.source), name(relationship.target)).length === 0) {
      warnings.push({
        code: "objective-alignment",
        message: `No objective mentions both ${quote(name(relationship.source))} and ${quote(name(relationship.target))}.`,
        why: "Each relationship should serve at least one research objective. Add or reword an objective, or check whether the relationship is needed.",
        targets: [relationship.id],
      });
    }
  }

  for (const crossing of layout?.crossings ?? []) {
    const relationship = relationships.find((candidate) => candidate.id === crossing.edge);
    if (!relationship) continue;
    warnings.push({
      code: "crossing",
      message: `The connector from ${quote(name(relationship.source))} to ${quote(name(relationship.target))} passes behind ${quote(name(crossing.node))}.`,
      why: "Readers may think the connector involves that box. Move a box, or use Auto layout, to clear it.",
      targets: [crossing.edge, crossing.node],
    });
  }
  for (const overlap of layout?.overlaps ?? []) {
    const [first, second] = overlap.edges.map((id) => relationships.find((candidate) => candidate.id === id));
    if (!first || !second) continue;
    warnings.push({
      code: "overlap",
      message: `Two connectors lie on top of each other: ${quote(name(first.source))} to ${quote(name(first.target))}, and ${quote(name(second.source))} to ${quote(name(second.target))}.`,
      why: "Overlapping lines hide one of the relationships. Move a box so that each connector can be seen.",
      targets: [first.id, second.id],
    });
  }
  return warnings;
}
