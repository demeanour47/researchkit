/**
 * Builds a conceptual framework from the project draft, and edits it.
 *
 * Variables come from the project's variable lists and hypotheses; relationships
 * come only from its hypotheses. Nothing is inferred: a variable listed without a
 * hypothesis appears unconnected, for the researcher to connect. Every edit returns a
 * new framework and never blocks: problems are reported by validation instead.
 */

import {
  RELATIONSHIP_TYPES,
  VARIABLE_TYPES,
  type ConceptualFramework,
  type FrameworkRelationship,
  type FrameworkVariable,
  type Point,
  type RelationshipType,
  type VariableType,
} from "./conceptual-types";
import type { HypothesisForm, HypothesisRelationship, ProjectHypothesis } from "./hypothesis-types";
import { containsPhrase, normalise } from "./question-text";
import { updateProjectDraft, type ResearchProjectDraft } from "./research-project";

/** The longest box label kept in full; longer names are shortened, with an ellipsis. */
export const SHORT_LABEL_LENGTH = 40;

/** How the form of a main hypothesis is drawn. Awaiting academic review. */
export const FORM_RELATIONSHIP: Readonly<Record<HypothesisForm, RelationshipType>> = {
  difference: "direct",
  relationship: "association",
  prediction: "influence",
};

export function defaultShortLabel(name: string): string {
  const clean = normalise(name);
  return clean.length <= SHORT_LABEL_LENGTH ? clean : `${clean.slice(0, SHORT_LABEL_LENGTH - 1).trimEnd()}…`;
}

const slug = (text: string) =>
  normalise(text)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "") || "item";

function uniqueId(base: string, taken: ReadonlySet<string>): string {
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

const findByName = (framework: ConceptualFramework, name: string) =>
  framework.variables.find((variable) => variable.name.toLowerCase() === normalise(name).toLowerCase());

/** Hypotheses grouped by the relationship they state, so a null and its alternative count once. */
function hypothesisGroups(hypotheses: readonly ProjectHypothesis[]): { relationship: HypothesisRelationship; ids: string[] }[] {
  const groups = new Map<string, { relationship: HypothesisRelationship; ids: string[] }>();
  for (const hypothesis of hypotheses) {
    const r = hypothesis.relationship;
    const key = [r.kind, r.form, r.independentVariables, r.dependentVariables, r.moderators, r.mediators].map(String).join("|").toLowerCase();
    const group = groups.get(key) ?? { relationship: r, ids: [] };
    group.ids.push(hypothesis.id);
    groups.set(key, group);
  }
  return [...groups.values()];
}

/** Builds the framework the project draft describes. */
export function frameworkFromProject(project: ResearchProjectDraft): ConceptualFramework {
  let framework: ConceptualFramework = { variables: [], relationships: [], positions: {} };
  const ensure = (name: string, type: VariableType): string => {
    const existing = findByName(framework, name);
    if (existing) return existing.id;
    framework = addVariable(framework, { name, type });
    return framework.variables[framework.variables.length - 1].id;
  };

  const lists: [readonly string[] | undefined, VariableType][] = [
    [project.independentVariables, "independent"],
    [project.dependentVariables, "dependent"],
    [project.mediatorVariables, "mediator"],
    [project.moderatorVariables, "moderator"],
    [project.controlVariables, "control"],
  ];
  for (const [names, type] of lists) for (const name of names ?? []) ensure(name, type);

  hypothesisGroups(project.hypotheses ?? []).forEach(({ relationship: r, ids }, index) => {
    const number = index + 1;
    const sign = r.direction === "positive" ? " (+)" : r.direction === "negative" ? " (−)" : "";
    const label = `H${number}${sign}`;
    for (const name of r.controls) ensure(name, "control");
    for (const iv of r.independentVariables) {
      for (const dv of r.dependentVariables) {
        const source = ensure(iv, "independent");
        const target = ensure(dv, "dependent");
        if (r.kind === "main") {
          framework = connect(framework, { source, target, type: FORM_RELATIONSHIP[r.form], label, hypothesisIds: ids });
        } else if (r.kind === "moderation") {
          for (const moderator of r.moderators) {
            const moderated = framework.relationships.find((relationship) => relationship.source === source && relationship.target === target && relationship.type !== "moderation");
            framework = connect(framework, {
              source: ensure(moderator, "moderator"),
              target,
              type: "moderation",
              label,
              moderates: moderated?.id ?? null,
              hypothesisIds: ids,
            });
          }
        } else {
          for (const mediatorName of r.mediators) {
            const mediator = ensure(mediatorName, "mediator");
            framework = connect(framework, { source, target: mediator, type: "mediation", label, hypothesisIds: ids });
            framework = connect(framework, { source: mediator, target, type: "mediation", label, hypothesisIds: ids });
          }
        }
      }
    }
  });
  return framework;
}

/** Adds a relationship, or merges its hypotheses into an identical one already present. */
function connect(framework: ConceptualFramework, relationship: NewRelationship & { hypothesisIds: readonly string[] }): ConceptualFramework {
  const existing = framework.relationships.find(
    (candidate) =>
      candidate.source === relationship.source &&
      candidate.target === relationship.target &&
      candidate.type === relationship.type &&
      candidate.moderates === (relationship.moderates ?? null),
  );
  if (!existing) return addRelationship(framework, relationship);
  // The same path stated by several hypotheses: keep one connector, listing every hypothesis.
  const labels = [existing.label, relationship.label ?? null].filter((label): label is string => Boolean(label));
  return {
    ...framework,
    relationships: framework.relationships.map((candidate) =>
      candidate === existing
        ? { ...candidate, label: [...new Set(labels)].join(", ") || null, hypothesisIds: [...new Set([...candidate.hypothesisIds, ...relationship.hypothesisIds])] }
        : candidate,
    ),
  };
}

// Editing. Each operation returns a new framework and leaves the original unchanged.

export interface NewVariable {
  name: string;
  type: VariableType;
  shortLabel?: string;
  description?: string;
}

function checkType(type: VariableType) {
  if (!VARIABLE_TYPES.includes(type)) throw new RangeError(`Unknown variable type: ${type}`);
}

function checkName(name: string): string {
  const clean = normalise(name);
  if (!clean) throw new RangeError("A variable needs a name.");
  return clean;
}

function getVariable(framework: ConceptualFramework, id: string): FrameworkVariable {
  const variable = framework.variables.find((candidate) => candidate.id === id);
  if (!variable) throw new RangeError(`Unknown variable: ${id}`);
  return variable;
}

export function addVariable(framework: ConceptualFramework, variable: NewVariable): ConceptualFramework {
  const name = checkName(variable.name);
  checkType(variable.type);
  const id = uniqueId(`v-${slug(name)}`, new Set(framework.variables.map((candidate) => candidate.id)));
  return {
    ...framework,
    variables: [
      ...framework.variables,
      { id, name, shortLabel: normalise(variable.shortLabel ?? "") || defaultShortLabel(name), description: normalise(variable.description ?? ""), type: variable.type },
    ],
  };
}

const updateVariable = (framework: ConceptualFramework, id: string, change: (variable: FrameworkVariable) => FrameworkVariable): ConceptualFramework => {
  getVariable(framework, id);
  return { ...framework, variables: framework.variables.map((variable) => (variable.id === id ? change(variable) : variable)) };
};

/** Renames a variable. A box label that was still the default follows the new name. */
export function renameVariable(framework: ConceptualFramework, id: string, name: string): ConceptualFramework {
  const clean = checkName(name);
  return updateVariable(framework, id, (variable) => ({
    ...variable,
    name: clean,
    shortLabel: variable.shortLabel === defaultShortLabel(variable.name) ? defaultShortLabel(clean) : variable.shortLabel,
  }));
}

export function setShortLabel(framework: ConceptualFramework, id: string, shortLabel: string): ConceptualFramework {
  return updateVariable(framework, id, (variable) => ({ ...variable, shortLabel: normalise(shortLabel) || defaultShortLabel(variable.name) }));
}

export function setDescription(framework: ConceptualFramework, id: string, description: string): ConceptualFramework {
  return updateVariable(framework, id, (variable) => ({ ...variable, description: normalise(description) }));
}

export function changeVariableType(framework: ConceptualFramework, id: string, type: VariableType): ConceptualFramework {
  checkType(type);
  return updateVariable(framework, id, (variable) => ({ ...variable, type }));
}

/** Deletes a variable, its relationships, any moderation of those relationships, and its position. */
export function deleteVariable(framework: ConceptualFramework, id: string): ConceptualFramework {
  getVariable(framework, id);
  const removed = new Set(framework.relationships.filter((relationship) => relationship.source === id || relationship.target === id).map((relationship) => relationship.id));
  const positions = { ...framework.positions };
  delete positions[id];
  return {
    variables: framework.variables.filter((variable) => variable.id !== id),
    relationships: framework.relationships
      .filter((relationship) => !removed.has(relationship.id))
      .map((relationship) => (relationship.moderates && removed.has(relationship.moderates) ? { ...relationship, moderates: null } : relationship)),
    positions,
  };
}

export interface NewRelationship {
  source: string;
  target: string;
  type: RelationshipType;
  label?: string | null;
  moderates?: string | null;
  hypothesisIds?: readonly string[];
}

/** Adds a relationship. It must join two different variables that exist. */
export function addRelationship(framework: ConceptualFramework, relationship: NewRelationship): ConceptualFramework {
  getVariable(framework, relationship.source);
  getVariable(framework, relationship.target);
  if (relationship.source === relationship.target) throw new RangeError("A relationship needs two different variables.");
  if (!RELATIONSHIP_TYPES.includes(relationship.type)) throw new RangeError(`Unknown relationship type: ${relationship.type}`);
  if (relationship.moderates && !framework.relationships.some((candidate) => candidate.id === relationship.moderates)) {
    throw new RangeError(`Unknown relationship: ${relationship.moderates}`);
  }
  const base = `r-${relationship.source.replace(/^v-/, "")}-${relationship.target.replace(/^v-/, "")}`;
  const id = uniqueId(base, new Set(framework.relationships.map((candidate) => candidate.id)));
  return {
    ...framework,
    relationships: [
      ...framework.relationships,
      {
        id,
        source: relationship.source,
        target: relationship.target,
        type: relationship.type,
        label: normalise(relationship.label ?? "") || null,
        moderates: relationship.type === "moderation" ? (relationship.moderates ?? null) : null,
        hypothesisIds: [...(relationship.hypothesisIds ?? [])],
      },
    ],
  };
}

function updateRelationship(framework: ConceptualFramework, id: string, change: (relationship: FrameworkRelationship) => FrameworkRelationship): ConceptualFramework {
  if (!framework.relationships.some((relationship) => relationship.id === id)) throw new RangeError(`Unknown relationship: ${id}`);
  return { ...framework, relationships: framework.relationships.map((relationship) => (relationship.id === id ? change(relationship) : relationship)) };
}

export function setRelationshipLabel(framework: ConceptualFramework, id: string, label: string): ConceptualFramework {
  return updateRelationship(framework, id, (relationship) => ({ ...relationship, label: normalise(label) || null }));
}

export function setRelationshipType(framework: ConceptualFramework, id: string, type: RelationshipType): ConceptualFramework {
  if (!RELATIONSHIP_TYPES.includes(type)) throw new RangeError(`Unknown relationship type: ${type}`);
  return updateRelationship(framework, id, (relationship) => ({ ...relationship, type, moderates: type === "moderation" ? relationship.moderates : null }));
}

/** Deletes a relationship, and clears any moderation that pointed at it. */
export function deleteRelationship(framework: ConceptualFramework, id: string): ConceptualFramework {
  if (!framework.relationships.some((relationship) => relationship.id === id)) throw new RangeError(`Unknown relationship: ${id}`);
  return {
    ...framework,
    relationships: framework.relationships
      .filter((relationship) => relationship.id !== id)
      .map((relationship) => (relationship.moderates === id ? { ...relationship, moderates: null } : relationship)),
  };
}

// Positions.

/** Grid step for moving a box with the arrow keys; Shift moves further. */
export const NUDGE_STEP = 8;
export const NUDGE_STEP_LARGE = 40;

/** Places a box's top-left corner, snapped to whole units and kept inside the diagram. */
export function moveVariable(framework: ConceptualFramework, id: string, to: Point): ConceptualFramework {
  getVariable(framework, id);
  if (!Number.isFinite(to.x) || !Number.isFinite(to.y)) throw new RangeError("A position needs finite coordinates.");
  return { ...framework, positions: { ...framework.positions, [id]: { x: Math.max(0, Math.round(to.x)), y: Math.max(0, Math.round(to.y)) } } };
}

/** Moves a box by a number of steps from where it is now drawn. */
export function nudgeVariable(framework: ConceptualFramework, id: string, from: Point, dx: number, dy: number, large = false): ConceptualFramework {
  const step = large ? NUDGE_STEP_LARGE : NUDGE_STEP;
  return moveVariable(framework, id, { x: from.x + dx * step, y: from.y + dy * step });
}

/** Returns every box to the automatic layout, keeping the variables' order. */
export function resetLayout(framework: ConceptualFramework): ConceptualFramework {
  return { ...framework, positions: {} };
}

/**
 * Reorders variables within each role so that connected boxes sit level with each
 * other, which reduces crossing lines, then returns every box to the automatic layout.
 * Deterministic: ties keep the existing order.
 */
export function autoLayout(framework: ConceptualFramework): ConceptualFramework {
  const order = new Map(framework.variables.map((variable, index) => [variable.id, index]));
  const neighbours = (id: string) =>
    framework.relationships.flatMap((relationship) =>
      relationship.source === id ? [relationship.target] : relationship.target === id ? [relationship.source] : [],
    );
  // Fix independent variables in their current order, then place every other role by
  // the average position of the variables it connects to (the barycentre heuristic).
  const rank = new Map<string, number>();
  const byType = (type: VariableType) => framework.variables.filter((variable) => variable.type === type);
  byType("independent").forEach((variable, index) => rank.set(variable.id, index));
  for (const type of ["mediator", "dependent", "moderator", "control", "extraneous"] as const) {
    const members = byType(type);
    const weighted = members.map((variable) => {
      const known = neighbours(variable.id).filter((id) => rank.has(id)).map((id) => rank.get(id)!);
      return { variable, weight: known.length > 0 ? known.reduce((sum, value) => sum + value, 0) / known.length : Number.POSITIVE_INFINITY };
    });
    weighted.sort((a, b) => a.weight - b.weight || order.get(a.variable.id)! - order.get(b.variable.id)!);
    weighted.forEach(({ variable }, index) => rank.set(variable.id, index));
  }
  const sorted = [...framework.variables].sort((a, b) =>
    a.type === b.type ? rank.get(a.id)! - rank.get(b.id)! : order.get(a.id)! - order.get(b.id)!,
  );
  // Keep each role's slots where they were, filling them in the new order.
  const queues = new Map(VARIABLE_TYPES.map((type) => [type, sorted.filter((variable) => variable.type === type)]));
  return { ...framework, variables: framework.variables.map((variable) => queues.get(variable.type)!.shift()!), positions: {} };
}

// Tracing relationships back to the project.

export interface RelationshipTrace {
  relationship: FrameworkRelationship;
  source: FrameworkVariable;
  target: FrameworkVariable;
  /** The relationship a moderation points at, if any. */
  moderated: FrameworkRelationship | null;
  /** The project hypotheses that created it. */
  hypotheses: ProjectHypothesis[];
  /** Objectives that mention both variables. */
  objectives: string[];
}

export function traceRelationship(framework: ConceptualFramework, id: string, project: ResearchProjectDraft): RelationshipTrace {
  const relationship = framework.relationships.find((candidate) => candidate.id === id);
  if (!relationship) throw new RangeError(`Unknown relationship: ${id}`);
  const source = getVariable(framework, relationship.source);
  const target = getVariable(framework, relationship.target);
  return {
    relationship,
    source,
    target,
    moderated: framework.relationships.find((candidate) => candidate.id === relationship.moderates) ?? null,
    hypotheses: (project.hypotheses ?? []).filter((hypothesis) => relationship.hypothesisIds.includes(hypothesis.id)),
    objectives: supportingObjectives(project, source.name, target.name),
  };
}

export const supportingObjectives = (project: ResearchProjectDraft, first: string, second: string) =>
  (project.researchObjectives ?? []).filter((objective) => containsPhrase(objective, first) && containsPhrase(objective, second));

/** The project draft with its conceptual framework replaced. No other field changes. */
export function applyFramework(project: ResearchProjectDraft, framework: ConceptualFramework): ResearchProjectDraft {
  return updateProjectDraft(project, { conceptualFramework: framework });
}

/** Everything the Conceptual Framework Builder can't do, stated on the page. */
export const FRAMEWORK_LIMITATIONS: readonly string[] = [
  "The figure shows the relationships in your hypotheses. It can't judge whether your framework is supported by theory or previous research.",
  "Layout is automatic and always gives the same result for the same project. Complex frameworks can still have crossing lines; move boxes to improve them.",
  "PDF export uses the standard Helvetica font, which covers Western European characters only. Other characters appear as “?”: use SVG or PNG for other scripts.",
  "Text is fitted to boxes using Helvetica measurements. An application that substitutes another font may fit text slightly differently.",
  "Pasting depends on the application and its version, and not every application accepts SVG from the clipboard. If pasting doesn't work, download the SVG or PNG and insert it as a picture.",
  "The figure doesn't follow any particular journal's requirements. Check your target journal's figure guidelines.",
  "Nothing is saved. The framework is lost when you leave the page.",
];

/** Content awaiting review before launch. */
export const FRAMEWORK_REVIEW_ITEMS: readonly string[] = [
  "Academic review: how each hypothesis form is drawn (difference as a direct effect, relationship as an association, prediction as an influence), the definitions of the relationship types, and the conventions for drawing moderation and mediation.",
  "Layout review: spacing, arrow sizes, label placement and type captions, by a designer and an academic reader.",
  "Export verification: pasting and inserting the figure in Microsoft Word (Windows and Mac), Google Docs, PowerPoint and LibreOffice hasn't yet been checked by hand.",
];
