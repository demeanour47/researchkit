/**
 * Reading author–date citations, such as (Smith, 2024, p. 5) and Smith (2024). The
 * reading is tolerant so that a citation written in a neighbouring style's form is
 * still recognised; each style supplies its grammar and turns every departure from
 * it into its own diagnosis. Text that doesn't read as a citation is left alone.
 */

import { roundGroups } from "./features";
import { issue } from "./issue";
import type { RecognizedCitation, ReferenceCheckIssue } from "./types";

export interface AuthorDateGrammar {
  /** Between name and year: "(Smith, 2024)" or "(Smith 2024)". */
  separator: "comma" | "space";
  /** Between two names in a parenthetical citation. Narrative citations always use "and". */
  joiner: "&" | "and";
  /** How a missing date is written. */
  noDate: "n.d." | "no date";
  /** Whether page locators take "p." or "pp.". */
  locatorLabels: boolean;
  /** The number of authors from which the first author and et al. are cited. */
  etAlFrom: number;
}

export type AuthorDateProblem =
  | "separator-missing"
  | "separator-extra"
  | "joiner"
  | "no-date-form"
  | "locator-label-missing"
  | "locator-label-extra"
  | "et-al-missing";

export interface AuthorDateCitation extends RecognizedCitation {
  locator?: string;
  problems: AuthorDateProblem[];
}

const YEAR = String.raw`(?:1[5-9]\d\d|20\d\d)[a-z]?|n\.d\.|no date|in press|forthcoming`;
const PART = new RegExp(String.raw`^(?:(?:see also|see|e\.g\.,?|cf\.|for example,?|i\.e\.,?)\s+)?(.+?)(,\s*|\s+)((?:${YEAR})(?:\s*,\s*(?:${YEAR}))*)(?:\s*,\s*(.+))?$`, "iu");
const LABELLED = /^(?:pp?|paras?|ch|chap|sec|sect|section|fig|table|line)\.?\s/iu;
const ET_AL = /\s*,?\s*et al\.?$/u;

/** Names from the author part of a citation, or null if it doesn't read as names. */
function readNames(text: string): { names: string[]; etAl: boolean; joiner: "&" | "and" | null; title?: string } | null {
  const trimmed = text.trim();
  const quoted = /^[“‘"](.+?)[,]?[”’"]$/u.exec(trimmed);
  if (quoted) return { names: [quoted[1]], etAl: false, joiner: null, title: quoted[1] };
  if (!/^\p{Lu}/u.test(trimmed) || /\d/u.test(trimmed) || trimmed.split(/\s+/u).length > 10) return null;
  const etAl = ET_AL.test(trimmed);
  const body = trimmed.replace(ET_AL, "");
  const joiner = / & /u.test(body) ? "&" : / and /u.test(body) ? "and" : null;
  const names = body.split(/\s*,\s*(?:&|and)\s+|\s+(?:&|and)\s+|\s*,\s*/u).map((name) => name.trim()).filter(Boolean);
  if (names.length === 0 || names.some((name) => !/^\p{Lu}/u.test(name))) return null;
  return { names, etAl, joiner };
}

function problemsFor(read: { names: string[]; etAl: boolean; joiner: "&" | "and" | null }, separator: string, years: string[], locator: string | undefined, grammar: AuthorDateGrammar, joinerExpected: "&" | "and"): AuthorDateProblem[] {
  const problems: AuthorDateProblem[] = [];
  const comma = separator.includes(",");
  const undated = years[0] === "n.d." || years[0] === "no date";
  if (grammar.separator === "comma" && !comma) problems.push("separator-missing");
  // Chicago puts a comma before n.d. only, so it isn't read as part of the name.
  if (grammar.separator === "space" && comma && !undated) problems.push("separator-extra");
  if (grammar.separator === "space" && !comma && undated) problems.push("separator-missing");
  if (read.joiner && read.joiner !== joinerExpected && read.names.length > 1) problems.push("joiner");
  if (years.some((year) => (year === "n.d." || year === "no date") && year !== grammar.noDate)) problems.push("no-date-form");
  if (locator) {
    const labelled = LABELLED.test(locator);
    if (grammar.locatorLabels && !labelled && /^\d/u.test(locator)) problems.push("locator-label-missing");
    if (!grammar.locatorLabels && /^pp?\.\s/iu.test(locator)) problems.push("locator-label-extra");
  }
  if (!read.etAl && read.names.length >= grammar.etAlFrom) problems.push("et-al-missing");
  return problems;
}

const splitYears = (text: string) => text.split(/\s*,\s*/u).map((year) => year.trim().toLowerCase().replace(/^no date$/u, "no date"));

/** Parenthetical citations: each part of "(Smith, 2024; Jones, 2023)" is one citation. */
export function readParenthetical(text: string, grammar: AuthorDateGrammar): AuthorDateCitation[] {
  const found: AuthorDateCitation[] = [];
  for (const group of roundGroups(text)) {
    const parts = group.inner.split(/\s*;\s*/u);
    for (const part of parts) {
      const match = PART.exec(part);
      if (!match) continue;
      const read = readNames(match[1]);
      if (!read) continue;
      const years = splitYears(match[3]);
      const locator = match[4]?.trim();
      found.push({
        evidence: parts.length > 1 ? part : group.text,
        kind: "parenthetical",
        names: read.names,
        etAl: read.etAl,
        years,
        numbers: [],
        ...(read.title ? { title: read.title } : {}),
        ...(locator ? { locator } : {}),
        problems: problemsFor(read, match[2], years, locator, grammar, grammar.joiner),
        issues: [],
      });
    }
  }
  return found;
}

const NAME = String.raw`\p{Lu}[\p{L}'’-]+`;
const NARRATIVE = new RegExp(String.raw`(${NAME}(?:(?:,\s+|\s+(?:and|&)\s+|,\s+(?:and|&)\s+)${NAME})*(?:\s+et al\.)?)\s+\(((?:${YEAR})(?:\s*,\s*(?:${YEAR}))*)(?:\s*,\s*([^)]+))?\)`, "gu");

/** Narrative citations: "Smith (2024)", "Hughes and Ali (2022, p. 6)", "Gerrard et al. (2005)". */
export function readNarrative(text: string, grammar: AuthorDateGrammar): AuthorDateCitation[] {
  const found: AuthorDateCitation[] = [];
  for (const match of text.matchAll(NARRATIVE)) {
    const read = readNames(match[1]);
    if (!read) continue;
    const at = match.index ?? 0;
    const context = text.slice(Math.max(0, at - 80), at);
    // A capitalised word just before the names may make them part of a longer name, such as an organization's.
    const uncertain = /\p{Lu}[\p{L}'’-]*\s+$/u.test(context) || /\b(?:of|for|the|and)\s+$/u.test(context);
    const years = splitYears(match[2]);
    const locator = match[3]?.trim();
    found.push({
      evidence: match[0],
      kind: "narrative",
      names: read.names,
      etAl: read.etAl,
      years,
      numbers: [],
      context,
      uncertain,
      ...(locator ? { locator } : {}),
      problems: problemsFor(read, ",", years, locator, { ...grammar, separator: "comma" }, "and"),
      issues: [],
    });
  }
  return found;
}

/**
 * Bracketed text with a year that no reading recognised as a citation: reported as
 * uncertain, never as an error, because it may be an ordinary aside such as (in 2020).
 */
export function unreadYearGroups(text: string, citations: readonly RecognizedCitation[]): string[] {
  return roundGroups(text)
    .filter((group) => /\b(?:1[5-9]\d\d|20\d\d)[a-z]?\b|n\.d\./u.test(group.inner))
    .filter((group) => !citations.some((citation) => citation.evidence.includes(group.text) || group.inner.includes(citation.evidence)))
    .filter((group) => /\p{Lu}/u.test(group.inner))
    .map((group) => group.text);
}

/** The notice for bracketed text that may be a citation the style's grammar couldn't read. */
export const uncertainCitation = (evidence: string): ReferenceCheckIssue =>
  issue("citation-consistency", "information", "Could not confidently identify citation.", "This bracketed text contains a year but doesn't read as a citation in the selected style, so it wasn't matched to the list.", "If it is a citation, check its form against the style; if not, nothing needs doing.", evidence);
