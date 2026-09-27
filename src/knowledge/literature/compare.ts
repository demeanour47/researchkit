/**
 * Two studies side by side: each column's values, whether they agree, and what the
 * studies share in variables, methods and theories.
 */

import { listItems } from "./matrix";
import { studyVariables } from "./project";
import { fold } from "./query";
import { matchConcepts, termKey, type ConceptKind } from "./vocab";
import { MATRIX_FIELDS, type MatrixField, type Study } from "./types";

export interface ComparisonRow {
  field: MatrixField;
  a: string;
  b: string;
  /** Same, different, or missing from one or both. */
  relation: "same" | "different" | "missing";
}

export interface Comparison {
  rows: ComparisonRow[];
  sharedVariables: string[];
  sharedMethods: string[];
  sharedTheories: string[];
}

const METHOD_FIELDS: readonly [MatrixField, ConceptKind][] = [
  ["design", "design"],
  ["sampling", "sampling"],
  ["dataCollection", "collection"],
  ["analysis", "analysis"],
];

/** The catalogue labels a study's method columns name, or the entries themselves when unrecognised. */
function methods(study: Study): Map<string, string> {
  const found = new Map<string, string>();
  for (const [field, kind] of METHOD_FIELDS)
    for (const item of listItems(study.fields[field])) {
      const concepts = matchConcepts(kind, item);
      if (concepts.length === 0) found.set(`${kind}:${termKey(item)}`, item);
      for (const concept of concepts) found.set(`${kind}:${concept.id}`, concept.label);
    }
  return found;
}

const sharedBy = (a: Map<string, string>, b: Map<string, string>) => [...a.entries()].filter(([key]) => b.has(key)).map(([, label]) => label);
const keyed = (items: readonly string[]) => new Map(items.map((item) => [termKey(item), item]));

export function compareStudies(a: Study, b: Study, fields: readonly MatrixField[] = MATRIX_FIELDS): Comparison {
  return {
    rows: fields.map((field) => {
      const x = a.fields[field].trim();
      const y = b.fields[field].trim();
      return { field, a: x, b: y, relation: !x || !y ? "missing" : fold(x) === fold(y) ? "same" : "different" };
    }),
    sharedVariables: sharedBy(keyed(studyVariables(a)), keyed(studyVariables(b))),
    sharedMethods: sharedBy(methods(a), methods(b)),
    sharedTheories: sharedBy(keyed(listItems(a.fields.theory)), keyed(listItems(b.fields.theory))),
  };
}
