/**
 * Patterns across the matrix: variables, designs, data collection, sampling, analyses,
 * theories, philosophies, approaches and settings that recur, each with how often and
 * in which studies, and why such a pattern is usual. Reasons come from the same
 * catalogues the other research tools use; they describe why researchers commonly make
 * a choice, not why each study did.
 */

import { listItems, studyLabel } from "./matrix";
import { studyVariables } from "./project";
import { matchConcepts, termKey, theoriesInText, type ConceptKind } from "./vocab";
import type { Matrix, MatrixField, Study } from "./types";

export interface PatternItem {
  key: string;
  label: string;
  /** Studies it appears in; a study counts once however often it names it. */
  studies: string[];
  count: number;
  /** Its share of the studies that report this column at all, from 0 to 1. */
  share: number;
  explanation: string;
}

export const PATTERN_GROUPS = ["variables", "relationships", "designs", "collection", "sampling", "analyses", "theories", "philosophies", "approaches", "countries"] as const;
export type PatternGroupId = (typeof PATTERN_GROUPS)[number];

export interface PatternGroup {
  id: PatternGroupId;
  title: string;
  /** Studies reporting this aspect at all. */
  reported: number;
  /** Everything found, most frequent first. */
  items: PatternItem[];
  /** Those appearing in two or more studies. */
  repeated: PatternItem[];
  /** What the group's pattern suggests, as sentences. */
  summary: string;
}

export const PATTERN_TITLES: Readonly<Record<PatternGroupId, string>> = {
  variables: "Repeated variables",
  relationships: "Repeated relationships",
  designs: "Research designs",
  collection: "Data collection methods",
  sampling: "Sampling techniques",
  analyses: "Statistical and qualitative analyses",
  theories: "Theories and frameworks",
  philosophies: "Research philosophies",
  approaches: "Research approaches",
  countries: "Countries",
};

/** Fewer studies than this, and patterns are noted but not generalised. */
export const MIN_STUDIES_FOR_PATTERNS = 3;

const percent = (share: number) => `${Math.round(share * 100)}%`;
const ofStudies = (count: number, total: number) => `${count} of ${total} ${total === 1 ? "study" : "studies"}`;

interface Found {
  key: string;
  label: string;
  explain: (count: number, total: number, studies: readonly Study[]) => string;
}

/** Counts what each study reports for one aspect, once per study. */
function tally(matrix: Matrix, extract: (study: Study) => Found[]): { items: PatternItem[]; reported: number } {
  const entries = new Map<string, { found: Found; studies: Study[] }>();
  let reported = 0;
  for (const study of matrix) {
    const found = extract(study);
    if (found.length > 0) reported++;
    const keys = new Set<string>();
    for (const item of found) {
      if (keys.has(item.key)) continue;
      keys.add(item.key);
      const entry = entries.get(item.key) ?? { found: item, studies: [] };
      entry.studies.push(study);
      entries.set(item.key, entry);
    }
  }
  const items = [...entries.values()]
    .map(({ found, studies }) => ({ key: found.key, label: found.label, studies: studies.map((study) => study.id), count: studies.length, share: reported === 0 ? 0 : studies.length / reported, explanation: found.explain(studies.length, reported, studies) }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  return { items, reported };
}

/** Concepts from a list column, matched to a catalogue; unmatched entries are counted by their own wording. */
function conceptsIn(study: Study, field: MatrixField, kind: ConceptKind, noun: string): Found[] {
  return listItems(study.fields[field]).flatMap((item): Found[] => {
    const concepts = matchConcepts(kind, item);
    if (concepts.length > 0)
      return concepts.map((concept) => ({
        key: `${kind}:${concept.id}`,
        label: concept.label,
        explain: (count: number, total: number) => `${concept.label} appears in ${ofStudies(count, total)} that report their ${noun} (${percent(count / total)}). ${concept.why} ${concept.caution}`.trim(),
      }));
    return [{ key: `${kind}:${termKey(item)}`, label: item, explain: (count: number, total: number) => `“${item}” appears in ${ofStudies(count, total)} that report their ${noun} (${percent(count / total)}).` }];
  });
}

function group(id: PatternGroupId, result: { items: PatternItem[]; reported: number }, total: number, summary: (repeated: PatternItem[], reported: number) => string): PatternGroup {
  const repeated = result.items.filter((item) => item.count >= 2);
  return { id, title: PATTERN_TITLES[id], reported: result.reported, items: result.items, repeated, summary: result.reported === 0 ? `No study reports this yet.` : total < MIN_STUDIES_FOR_PATTERNS ? `With ${ofStudies(result.reported, total)}, patterns are too early to judge.` : summary(repeated, result.reported) };
}

/** Where a study sits: its countries, as entered. */
const countriesOf = (study: Study): Found[] => listItems(study.fields.country).map((country) => ({ key: termKey(country), label: country, explain: (count: number, total: number) => `${ofStudies(count, total)} that name a setting were conducted in ${country}.` }));

/** Relationships studied: each independent variable with each dependent variable. */
function relationshipsOf(study: Study): Found[] {
  const found: Found[] = [];
  for (const cause of listItems(study.fields.independent))
    for (const effect of listItems(study.fields.dependent))
      found.push({
        key: `${termKey(cause)} -> ${termKey(effect)}`,
        label: `${cause} → ${effect}`,
        explain: (count: number) => `${count} studies test the effect of ${cause} on ${effect}. A relationship tested repeatedly is well established as a question; look at whether the findings agree, and what the studies haven't varied, such as setting, population or design.`,
      });
  return found;
}

/** Theories from the theory column, and theories named in the study's own text. */
function theoriesOf(study: Study): Found[] {
  const named = [...listItems(study.fields.theory), ...theoriesInText([study.fields.context, study.fields.problem, study.fields.contribution, study.fields.notes].join(" "))];
  return named.map((theory) => ({
    key: termKey(theory),
    label: theory.replace(/\s*\([^)]*\)\s*$/, ""),
    explain: (count: number, total: number) => `${theory.replace(/\s*\([^)]*\)\s*$/, "")} underpins ${ofStudies(count, total)} that name a theory (${percent(count / total)}). A theory used this often is the field's usual lens: it makes studies comparable, but can also narrow the questions they ask.`,
  }));
}

function variablesOf(study: Study): Found[] {
  return studyVariables(study).map((variable) => ({
    key: termKey(variable),
    label: variable,
    explain: (count: number, total: number, studies: readonly Study[]) => {
      const roles = (["independent", "dependent", "mediator", "moderator"] as const)
        .map((role) => [role, studies.filter((candidate) => listItems(candidate.fields[role]).some((item) => termKey(item) === termKey(variable))).length] as const)
        .filter(([, n]) => n > 0)
        .map(([role, n]) => `${role} in ${n}`);
      return `${variable} is studied in ${ofStudies(count, total)} that report variables${roles.length > 0 ? ` (as ${roles.join(", ")})` : ""}. A variable that recurs is usually a core construct of the field; define and measure it consistently with these studies.`;
    },
  }));
}

export interface PatternReport {
  studies: number;
  groups: PatternGroup[];
}

const leading = (repeated: PatternItem[]) => repeated[0];

/** Every pattern in the matrix. */
export function detectPatterns(matrix: Matrix): PatternReport {
  const total = matrix.length;
  const concept = (field: MatrixField, kind: ConceptKind, noun: string) => tally(matrix, (study) => conceptsIn(study, field, kind, noun));
  const groups: PatternGroup[] = [
    group("variables", tally(matrix, variablesOf), total, (repeated) => (repeated.length > 0 ? `${repeated.length} ${repeated.length === 1 ? "variable recurs" : "variables recur"} across studies, led by ${leading(repeated).label} (${leading(repeated).count} studies).` : "No variable recurs yet; the studies examine different constructs.")),
    group("relationships", tally(matrix, relationshipsOf), total, (repeated) => (repeated.length > 0 ? `${repeated.length} ${repeated.length === 1 ? "relationship is" : "relationships are"} tested in more than one study.` : "No relationship between the same variables is tested twice.")),
    group("designs", concept("design", "design", "design"), total, (repeated, reported) => (repeated.length > 0 ? `${leading(repeated).label} is the most common design, in ${percent(leading(repeated).count / reported)} of studies that report one.` : "The studies use varied designs.")),
    group("collection", concept("dataCollection", "collection", "data collection"), total, (repeated, reported) => (repeated.length > 0 ? `${leading(repeated).label} is the most common way of collecting data (${percent(leading(repeated).count / reported)}).` : "Data are collected in varied ways.")),
    group("sampling", concept("sampling", "sampling", "sampling technique"), total, (repeated, reported) => (repeated.length > 0 ? `${leading(repeated).label} is the most common technique (${percent(leading(repeated).count / reported)}).` : "Sampling techniques vary.")),
    group("analyses", concept("analysis", "analysis", "analysis"), total, (repeated, reported) => (repeated.length > 0 ? `${leading(repeated).label} is the most common analysis (${percent(leading(repeated).count / reported)}).` : "Analyses vary across studies.")),
    group("theories", tally(matrix, theoriesOf), total, (repeated, reported) => (repeated.length > 0 ? `${leading(repeated).label} is the most used theory, in ${leading(repeated).count} of ${reported} studies that name one.` : reported < total / 2 ? "Fewer than half the studies name a theory." : "Each study draws on a different theory.")),
    group("philosophies", concept("philosophy", "philosophy", "philosophy"), total, (repeated) => (repeated.length > 0 ? `${leading(repeated).label} is the most common stated philosophy.` : "Philosophies vary, or are rarely stated.")),
    group("approaches", concept("approach", "approach", "approach"), total, (repeated) => (repeated.length > 0 ? `${leading(repeated).label} is the most common approach.` : "Approaches vary.")),
    group("countries", tally(matrix, countriesOf), total, (repeated, reported) => (repeated.length > 0 ? `${leading(repeated).label} hosts the most studies (${leading(repeated).count} of ${reported}).` : "Each study comes from a different country.")),
  ];
  return { studies: total, groups };
}

/** A pattern item's studies as their citation labels, for display. */
export const itemStudyLabels = (item: PatternItem, matrix: Matrix) => item.studies.map((id) => matrix.find((study) => study.id === id)).filter((study): study is Study => Boolean(study)).map(studyLabel);
