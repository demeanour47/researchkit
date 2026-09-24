/**
 * Text descriptions of a conceptual framework, for screen readers and for the
 * description embedded in exported figures. Every box and every connector is described.
 */

import { RELATIONSHIP_TYPE_INFO, VARIABLE_TYPE_LABELS, VARIABLE_TYPES, type ConceptualFramework, type FrameworkRelationship } from "./conceptual-types";
import { capitalise, joinList } from "./question-text";

const nameOf = (framework: ConceptualFramework, id: string) => framework.variables.find((variable) => variable.id === id)?.name ?? "an unknown variable";

/** "Screen time, independent variable." followed by its description, if any. */
export function describeVariable(framework: ConceptualFramework, id: string): string {
  const variable = framework.variables.find((candidate) => candidate.id === id);
  if (!variable) throw new RangeError(`Unknown variable: ${id}`);
  const base = `${variable.name}, ${VARIABLE_TYPE_LABELS[variable.type].toLowerCase()}.`;
  return variable.description ? `${base} ${variable.description}` : base;
}

/** "Screen time has a direct effect on sleep quality, labelled H1 (+)." */
export function describeRelationship(framework: ConceptualFramework, relationship: FrameworkRelationship): string {
  const source = capitalise(nameOf(framework, relationship.source));
  const label = relationship.label ? `, labelled ${relationship.label}` : "";
  const moderated = relationship.moderates ? framework.relationships.find((candidate) => candidate.id === relationship.moderates) : undefined;
  if (relationship.type === "moderation" && moderated) {
    return `${source} moderates the relationship between ${nameOf(framework, moderated.source)} and ${nameOf(framework, moderated.target)}${label}.`;
  }
  return `${source} ${RELATIONSHIP_TYPE_INFO[relationship.type].verb} ${nameOf(framework, relationship.target)}${label}.`;
}

const PLURAL: Readonly<Record<(typeof VARIABLE_TYPES)[number], string>> = {
  independent: "Independent variables",
  dependent: "Dependent variables",
  mediator: "Mediators",
  moderator: "Moderators",
  control: "Control variables",
  extraneous: "Extraneous variables",
};

/** A complete description of the figure: its variables by type, then every relationship. */
export function describeFramework(framework: ConceptualFramework): string {
  const { variables, relationships } = framework;
  if (variables.length === 0) return "An empty conceptual framework with no variables.";
  const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
  const parts = [`Conceptual framework with ${count(variables.length, "variable", "variables")} and ${count(relationships.length, "relationship", "relationships")}.`];
  for (const type of VARIABLE_TYPES) {
    const names = variables.filter((variable) => variable.type === type).map((variable) => variable.name);
    if (names.length > 0) parts.push(`${PLURAL[type]}: ${joinList(names)}.`);
  }
  for (const relationship of relationships) parts.push(describeRelationship(framework, relationship));
  return parts.join(" ");
}
