/**
 * A synthesis of the matrix in words: how many studies, from when and where, the usual
 * designs, samples, analyses and theories, the variables that recur, and the gaps. It
 * describes the matrix, ready to adapt into a literature review; it doesn't evaluate the
 * studies or claim more than the matrix shows.
 */

import { listNames } from "../research/data-analysis";
import { potentialGaps, statedGaps, GAP_KIND_LABELS } from "./gaps";
import { isEmptyLens, mentions, type ProjectLens } from "./project";
import { detectPatterns, MIN_STUDIES_FOR_PATTERNS, type PatternGroup } from "./patterns";
import { leadingNumber } from "./query";
import { READING_STATUSES, READING_STATUS_LABELS, type Matrix } from "./types";

export interface SynthesisSection {
  heading: string;
  paragraphs: string[];
}

const top = (group: PatternGroup, count = 3) => group.repeated.slice(0, count).map((item) => `${item.label} (${item.count})`);

export function synthesis(matrix: Matrix, lens: ProjectLens | null, currentYear: number): SynthesisSection[] {
  const n = matrix.length;
  if (n === 0) return [{ heading: "Overview", paragraphs: ["The matrix has no studies yet."] }];
  const sections: SynthesisSection[] = [];
  const { groups } = detectPatterns(matrix);
  const get = (id: PatternGroup["id"]) => groups.find((group) => group.id === id)!;

  const years = matrix.map((study) => leadingNumber(study.fields.year)).filter((year): year is number => year !== null);
  const span = years.length > 0 ? (Math.min(...years) === Math.max(...years) ? `published in ${Math.min(...years)}` : `published between ${Math.min(...years)} and ${Math.max(...years)}`) : "without years recorded";
  const countries = get("countries");
  const status = READING_STATUSES.map((id) => [READING_STATUS_LABELS[id].toLowerCase(), matrix.filter((study) => study.status === id).length] as const).filter(([, count]) => count > 0);
  const overview = [
    `The matrix holds ${n} ${n === 1 ? "study" : "studies"}, ${span}${countries.items.length > 0 ? `, from ${countries.items.length} ${countries.items.length === 1 ? "country" : "countries"}` : ""}.`,
    `Reading progress: ${status.map(([label, count]) => `${count} ${label}`).join(", ")}.`,
  ];
  if (n < MIN_STUDIES_FOR_PATTERNS) overview.push(`Patterns become meaningful from ${MIN_STUDIES_FOR_PATTERNS} studies; add more before drawing conclusions.`);
  sections.push({ heading: "Overview", paragraphs: overview });

  const methods: string[] = [];
  for (const [id, noun] of [
    ["designs", "designs"],
    ["collection", "data collection methods"],
    ["sampling", "sampling techniques"],
    ["analyses", "analyses"],
  ] as const) {
    const group = get(id);
    if (group.reported === 0) continue;
    methods.push(group.repeated.length > 0 ? `The most common ${noun} are ${listNames(top(group))}, out of ${group.reported} studies reporting them.` : `${group.reported} studies report their ${noun}, and none recurs.`);
  }
  if (methods.length > 0) sections.push({ heading: "Methods", paragraphs: methods });

  const theory = get("theories");
  const variables = get("variables");
  const relationships = get("relationships");
  const content = [
    theory.reported > 0 ? (theory.repeated.length > 0 ? `The theories used most are ${listNames(top(theory))}.` : `${theory.reported} studies name a theory, each a different one.`) : "No study names a theory.",
    variables.repeated.length > 0 ? `Variables that recur are ${listNames(top(variables, 5))}.` : "",
    relationships.repeated.length > 0 ? `Relationships tested more than once are ${listNames(top(relationships))}.` : "",
  ].filter(Boolean);
  sections.push({ heading: "Theories and variables", paragraphs: content });

  const stated = statedGaps(matrix);
  const potential = potentialGaps(matrix, lens, currentYear);
  const gaps = [
    ...(stated.length > 0 ? stated.slice(0, 5).map((gap) => `Named by ${gap.studies.length} studies (key words: ${gap.words.join(", ")}).`) : ["No gap is named by more than one study yet."]),
    ...potential.map((gap) => `${GAP_KIND_LABELS[gap.kind]}: ${gap.title}. ${gap.evidence}`),
  ];
  sections.push({ heading: "Gaps", paragraphs: gaps });

  if (lens && !isEmptyLens(lens)) {
    const relevant = lens.variables.map((variable) => [variable.name, matrix.filter((study) => mentions(study, variable.name)).length] as const);
    sections.push({
      heading: "Your project",
      paragraphs: [
        lens.topic ? `Topic: ${lens.topic}.` : "",
        lens.researchQuestion ? `Research question: ${lens.researchQuestion}` : "",
        relevant.length > 0 ? `Studies covering your variables: ${relevant.map(([name, count]) => `${name} (${count})`).join(", ")}.` : "",
      ].filter(Boolean),
    });
  }
  return sections;
}

/** The synthesis as plain text, for copying. */
export const synthesisText = (sections: readonly SynthesisSection[]) => sections.map((section) => [section.heading, ...section.paragraphs].join("\n")).join("\n\n");

/** The synthesis as Markdown. */
export const synthesisMarkdown = (sections: readonly SynthesisSection[]) => sections.map((section) => [`## ${section.heading}`, ...section.paragraphs].join("\n\n")).join("\n\n");
