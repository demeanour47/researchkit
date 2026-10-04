/**
 * IEEE checks, against the forms ResearchKit's IEEE generator produces (IEEE
 * Reference Guide, version 3.28.2025):
 *
 *   [1] B. Klaus and P. Horn, Robot Vision. Cambridge, MA, USA: MIT Press, 1986.
 *   [2] M. M. Chiampi, “Induction of electric field …,” IEEE Trans. Biomed. Eng., vol. 58, no. 10, pp. 2787–2793, Oct. 2011, doi: 10.1109/TBME.2011.2158315.
 *
 * In IEEE the number is the reference's identity: citations such as [2] or
 * [1, p. 5] point to it, and numbers follow the order of first citation (ADR-0007).
 * Numbers are checked as written; nothing is renumbered.
 */

import { parseReferenceNumbers } from "../../source";
import type { Source } from "../../source";
import { ENTRY_FORM_NAMES, authorYearCitationCount, clean, entryForm, initialsFirstNames, lastYear, quotedTitle, squareGroups } from "../features";
import { issue } from "../issue";
import { checkLinks } from "../links";
import type { CitationScan, DetectedSourceType, ParsedReference, RecognizedCitation, ReferenceCheckIssue, ReferenceEntry, StyleChecker } from "../types";
import { APA_JOURNAL_NUMBERS } from "./chicago-author-date";

const STYLE = "IEEE";

/** The authors before the title: up to the quoted title, or the names before a book title. */
function readLead(text: string): { lead: string; rest: string } {
  const quoted = quotedTitle(text);
  if (quoted && quoted.index > 0) return { lead: text.slice(0, quoted.index).replace(/,\s*$/u, ""), rest: text.slice(quoted.index) };
  const parts = text.split(/,\s+/u);
  let count = 0;
  // Names begin with initials ("B. Klaus") or "and"; the first part that doesn't is the title.
  while (count < parts.length - 1 && /^(?:and\s+)?(?:\p{Lu}\.[\s-]?)+\p{Lu}/u.test(parts[count])) count += 1;
  if (count === 0) count = 1;
  return { lead: parts.slice(0, count).join(", "), rest: parts.slice(count).join(", ") };
}

function parseEntry(entry: ReferenceEntry): ParsedReference {
  const { index, originalText, text } = entry;
  const issues: ReferenceCheckIssue[] = [];
  const base = { index, originalText, ...(entry.label ? { label: entry.label } : {}) };

  if (!entry.label) issues.push(issue("numbering", "error", "The reference number is missing.", "Every IEEE reference begins with its number in square brackets, [1], which the citations in the text point to.", "Add the reference's number in square brackets at the start."));
  else if (entry.label.form === "list") issues.push(issue("numbering", "warning", "The reference number isn't in square brackets.", "IEEE writes reference numbers in square brackets: [1], not 1.", "Write the number in square brackets.", entry.label.raw));
  else if (entry.label.number === null) issues.push(issue("numbering", "error", "The reference number is malformed.", "An IEEE reference number is a whole number in square brackets, such as [3].", "Correct the number.", entry.label.raw));

  const form = entryForm(text);
  if (form && form !== "initials-first") issues.push(issue("style-mismatch", "warning", "Reference may be formatted using a different citation style.", `This entry appears to use ${ENTRY_FORM_NAMES[form]}. IEEE gives initials first and the date near the end: B. Klaus and P. Horn, Robot Vision. Cambridge, MA, USA: MIT Press, 1986.`, "Check which style your list should follow, and choose it above or reformat the entry.", text));

  const { lead, rest } = readLead(text);
  const names = initialsFirstNames(lead);
  const opening = text.slice(0, Math.max(text.length - rest.length, lead.length));
  if (/^\p{Lu}[\p{L}'’-]+,\s+(?:\p{Lu}\.\s?)+/u.test(text)) issues.push(issue("author-format", "warning", "Author names appear inverted.", "IEEE writes initials before the family name: B. Klaus.", "Write each author's initials first.", opening));
  // "&" between author names, before the title.
  if (/\s&\s(?:\p{Lu}\.\s?)+\p{Lu}/u.test(text.split(/[“"]/u)[0] ?? "")) issues.push(issue("author-format", "warning", "Authors are joined with “&”.", "IEEE joins the last two authors with “and”: B. Klaus and P. Horn.", "Replace “&” with “and”.", opening));

  const links = checkLinks(rest, { style: STYLE, doi: "prefix", bareUrls: false });
  issues.push(...links.issues);
  const quoted = quotedTitle(rest);
  const articleLike = quoted !== null && quoted.index === 0;
  const title = articleLike ? quoted.title : clean((/^(.+?[.?!])(?=\s|$)/u.exec(rest)?.[1] ?? rest).replace(/\.$/u, ""));
  if (!title) issues.push(issue("missing-metadata", "error", "A title could not be identified.", "Every IEEE reference identifies the work by its title.", "Check the entry and add the title."));
  if (articleLike && /”,/u.test(rest.slice(quoted.index, quoted.end + 1))) issues.push(issue("title-format", "information", "The comma after the title is outside the quotation marks.", "IEEE puts the comma inside the closing quotation mark: “Title,” Journal.", "Move the comma inside the quotation marks.", rest.slice(quoted.index, quoted.end + 1)));
  if (APA_JOURNAL_NUMBERS.test(rest)) issues.push(issue("journal-structure", "warning", "Journal numbers aren't labelled.", "IEEE labels the volume, issue and pages: vol. 58, no. 10, pp. 2787–2793.", "Write vol., no. and pp. before the numbers.", APA_JOURNAL_NUMBERS.exec(rest)?.[0]));
  const range = /(?:^|,\s)(pp?\.\s*)?(\d+\s*[–-]\s*\d+)(?=[,.]|$)/u.exec(rest);
  if (range && !range[1]) issues.push(issue("journal-structure", "warning", "The page range has no “pp.”.", "IEEE writes a range of pages with pp.: pp. 2787–2793.", "Add pp. before the page range.", range[2]));
  if (links.url?.valid && !/Available:\s*$/u.test(rest.slice(0, links.url.index))) issues.push(issue("url", "information", "The URL isn't introduced with “[Online]. Available:”.", "The IEEE Reference Guide introduces a URL with [Online]. Available:.", "Add [Online]. Available: before the URL.", links.url.raw));

  const year = lastYear(rest);
  const sourceType: DetectedSourceType = /\bvol\.\s*\d/u.test(rest) || APA_JOURNAL_NUMBERS.test(rest) ? "journal-article" : links.url && !links.doi ? "webpage" : "book";
  const date = { year: year ? Number(year) : undefined };
  const authors = names.names.map((name) => ({ kind: "organization" as const, name }));
  const source: Source =
    sourceType === "journal-article"
      ? { type: "journal-article", authors, date, title, journal: "", doi: links.doi?.normalized ?? undefined, url: links.url?.raw }
      : sourceType === "webpage"
        ? { type: "webpage", authors, date, title, url: links.url?.raw ?? "" }
        : { type: "book", authors, date, title, doi: links.doi?.normalized ?? undefined, url: links.url?.raw };
  return {
    ...base,
    sourceType,
    confidence: entry.label?.number && title ? "high" : "partial",
    source,
    key: { names: names.names, etAl: names.etAl, year, title, number: entry.label?.number ?? null },
    issues,
  };
}

function checkList(references: readonly ParsedReference[]): void {
  const seen = new Map<number, number>();
  let previous: number | null = null;
  for (const reference of references) {
    const number = reference.key?.number ?? null;
    if (reference.excluded || number === null) continue;
    const first = seen.get(number);
    if (first !== undefined) {
      reference.issues.push(issue("numbering", "error", `Reference number [${number}] is used more than once.`, "Each IEEE reference has its own number, so a citation can lead to only one entry.", `Compare this entry with reference ${first}, and renumber or remove one of them.`, reference.label?.raw));
    } else if (previous === null && number !== 1) {
      reference.issues.push(issue("numbering", "warning", "The list doesn't start at [1].", "IEEE numbers references from [1], in the order they are first cited.", "Check whether earlier references are missing.", reference.label?.raw));
    } else if (previous !== null && number < previous) {
      reference.issues.push(issue("numbering", "warning", "The reference numbers are out of order.", "An IEEE reference list is in numerical order.", "Move this entry to its place in the numbered list.", reference.label?.raw));
    } else if (previous !== null && number > previous + 1) {
      const missing = number - previous === 2 ? `[${previous + 1}]` : `[${previous + 1}]–[${number - 1}]`;
      reference.issues.push(issue("numbering", "warning", `Reference ${missing} appears to be missing.`, "IEEE numbers references consecutively, so a gap usually means an entry was left out or renumbering went wrong.", "Check whether the missing references belong in the list.", reference.label?.raw));
    }
    if (first === undefined) seen.set(number, reference.index);
    previous = previous === null ? number : Math.max(previous, number);
  }
}

const LOCATOR = /^(\d+),\s*((?:pp?|Ch|Sect|Fig|Eq|Table)\.\s*\S.*)$/u;
const NUMBERS = /^\d+(?:\s*[–-]\s*\d+)?(?:\s*,\s*\d+(?:\s*[–-]\s*\d+)?)*$/u;

function readCitations(text: string): CitationScan {
  const citations: RecognizedCitation[] = [];
  const issues: ReferenceCheckIssue[] = [];
  // "[1]–[4]" cites every reference from 1 to 4.
  const ranges = [...text.matchAll(/\[(\d+)\]\s*[–-]\s*\[(\d+)\]/gu)];
  const covered = new Set<number>();
  for (const match of ranges) {
    const start = Number(match[1]);
    const end = Number(match[2]);
    const at = match.index ?? 0;
    covered.add(at);
    covered.add(at + match[0].lastIndexOf("["));
    if (end <= start) {
      issues.push(issue("numbering", "error", "The citation range is malformed.", "A range runs from a lower number to a higher one: [1]–[4].", "Correct the range.", match[0]));
      continue;
    }
    citations.push({ evidence: match[0], kind: "numeric", names: [], etAl: false, years: [], numbers: Array.from({ length: Math.min(end - start, 100) + 1 }, (_, i) => start + i), issues: [] });
  }
  for (const group of squareGroups(text)) {
    if (covered.has(group.index) || !/^\s*\d/u.test(group.inner)) continue;
    const located = LOCATOR.exec(group.inner);
    if (located) {
      citations.push({ evidence: group.text, kind: "numeric", names: [], etAl: false, years: [], numbers: [Number(located[1])], issues: [] });
      continue;
    }
    const read = NUMBERS.test(group.inner) ? parseReferenceNumbers(group.inner) : null;
    if (!read || read.numbers.length === 0) {
      issues.push(issue("numbering", "error", "The citation number is malformed.", "An IEEE citation is a reference number in square brackets, such as [3], [3, p. 24] or [4]–[7].", "Correct the citation.", group.text));
      continue;
    }
    citations.push({ evidence: group.text, kind: "numeric", names: [], etAl: false, years: [], numbers: read.numbers, issues: [] });
  }

  // Numbers follow the order of first citation: each new number should be the next one.
  const firsts: number[] = [];
  const ordered = [...citations].sort((a, b) => text.indexOf(a.evidence) - text.indexOf(b.evidence));
  for (const citation of ordered) for (const number of citation.numbers) if (!firsts.includes(number)) firsts.push(number);
  const outOfOrder = firsts.findIndex((number, position) => position > 0 && number < firsts[position - 1]);
  if (outOfOrder > 0) issues.push(issue("numbering", "warning", "Reference numbers may not follow the order of first citation.", `In the text you pasted, [${firsts[outOfOrder]}] is first cited after [${firsts[outOfOrder - 1]}]. IEEE numbers references in the order they are first cited; this is checked only within the text you pasted.`, "Check the numbering against the whole document.", `First citations in order: ${firsts.slice(0, 12).map((number) => `[${number}]`).join(", ")}`));

  const authorDate = authorYearCitationCount(text);
  if (authorDate > 0) issues.push(issue("style-mismatch", "warning", "This citation pattern appears author–date rather than IEEE numeric.", "Citations such as (Smith, 2024) belong to author–date styles. IEEE cites a reference by its number in square brackets: [1].", "Check which style your document uses, and choose it above.", `${authorDate} author–date citation${authorDate === 1 ? "" : "s"}`));
  return { citations, issues };
}

export const ieeeChecker: StyleChecker = {
  id: "ieee",
  capabilities: { sourceTypes: ["book", "journal-article", "webpage"], citations: "numeric", list: "reference list", ordering: "numeric", yearLetters: false },
  notices: [],
  parseEntry,
  checkList,
  readCitations,
};
