/**
 * IEEE citations in the text (IEEE Reference Guide, v. 3.28.2025, “Citing References”):
 *
 * - A citation is the reference's number in square brackets, on the line and inside
 *   the punctuation: “according to [1]”. It may follow the authors' names: “Smith [4]”,
 *   “Brown and Jones [5]”, “Wood et al. [7]”.
 * - Several references are each bracketed and separated by commas: [2], [4], [5].
 *   The current guide writes every number out: “[1]–[4]” is now “[1], [2], [3], [4]”.
 *   Earlier guidance, which some publishers still require, joined consecutive numbers
 *   with an en dash (“[2], [4]–[7], [9]”); that form is available on request, for runs
 *   of three or more, since the guides write two consecutive numbers as “[4], [5]”.
 * - A part of a reference is cited inside the brackets: [3, pp. 5–10], [3, Ch. 2],
 *   [3, Sect. 4.5]. A single page is “p.”.
 */

import { consecutiveRuns, formatPages, parseReferenceNumbers, plain, type NamedContributor, type Run } from "../source";
import { textAuthors } from "./names";
import type { Decision, Note } from "./notes";
import type { IeeeLocator, RangeStyle } from "./request";

export interface IeeeCitation {
  /** The citation, such as “[1]” or “[1], [3]”, or null when the numbers are invalid. */
  runs: Run[] | null;
  /** The numbers cited, in the order given; empty when they are invalid. */
  numbers: number[];
  decisions: Decision[];
  notes: Note[];
}

/** The locator inside the brackets, after a comma: “p. 24”, “pp. 24–26”, “Ch. 2”, “Sect. 4.5”. */
export function locatorText(locator: IeeeLocator | undefined, notes: Note[]): string | null {
  if (!locator) return null;
  const value = locator.value.trim();
  if (!value) {
    notes.push({ code: "missing-locator-value" });
    return null;
  }
  if (locator.kind === "chapter") return `Ch. ${value}`;
  if (locator.kind === "section") return `Sect. ${value}`;
  if (locator.kind === "paragraph") {
    notes.push({ code: "unsupported-locator", kind: "paragraph" });
    return null;
  }
  const pages = formatPages(value);
  const range = pages.includes("–");
  if (locator.kind === "page-range" && !range) notes.push({ code: "incomplete-locator" });
  return `${range ? "pp." : "p."} ${pages}`;
}

/** Brackets for each number, separated by commas; with en dashes, runs of three or more become [4]–[7]. */
export function bracketNumbers(numbers: readonly number[], ranges: RangeStyle): string {
  if (ranges === "written-out") return numbers.map((n) => `[${n}]`).join(", ");
  return consecutiveRuns(numbers)
    .flatMap((run) => (run.length >= 3 ? [`[${run[0]}]–[${run[run.length - 1]}]`] : run.map((n) => `[${n}]`)))
    .join(", ");
}

/** A citation of one reference: its number, with any locator inside the brackets. */
export function formatSingleCitation(number: string, locator?: IeeeLocator): IeeeCitation {
  const decisions: Decision[] = [{ code: "citation-brackets" }];
  const notes: Note[] = [];
  const parsed = parseReferenceNumbers(number);
  const located = locatorText(locator, notes);
  const invalid = parsed.problems.find((problem) => problem.code !== "not-ascending");
  if (invalid) notes.push({ code: "invalid-reference-number", problem: invalid });
  else if (parsed.numbers.length > 1) notes.push({ code: "invalid-reference-number", problem: { code: "more-than-one" } });
  if (invalid || parsed.numbers.length !== 1) return { runs: null, numbers: [], decisions, notes };
  if (located) decisions.push({ code: "citation-locator", text: located });
  return { runs: [plain(`[${parsed.numbers[0]}${located ? `, ${located}` : ""}]`)], numbers: parsed.numbers, decisions, notes };
}

/** The citation with the authors' names before it, for running text: “Klaus and Horn [1]”. */
export function namedCitation(authors: readonly NamedContributor[], citation: readonly Run[]): Run[] | null {
  return authors.length > 0 ? [plain(`${textAuthors(authors)} `), ...citation] : null;
}

/** A citation of several references at once, in the order given. */
export function formatMultipleCitation(numbers: string, ranges: RangeStyle, locator?: IeeeLocator): IeeeCitation {
  const decisions: Decision[] = [{ code: "citation-brackets" }];
  const notes: Note[] = [];
  const parsed = parseReferenceNumbers(numbers);
  for (const problem of parsed.problems) {
    if (problem.code === "not-ascending") notes.push({ code: "numbers-not-ascending" });
    else notes.push({ code: "invalid-reference-number", problem });
  }
  if (locator && locator.value.trim()) notes.push({ code: "locator-with-several-numbers" });
  if (parsed.numbers.length === 0) return { runs: null, numbers: [], decisions, notes };
  decisions.push({ code: ranges === "written-out" ? "citations-written-out" : "citations-en-dash" });
  if (ranges === "en-dash") notes.push({ code: "en-dash-ranges-variant" });
  return { runs: [plain(bracketNumbers(parsed.numbers, ranges))], numbers: parsed.numbers, decisions, notes };
}
