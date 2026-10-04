/**
 * Chicago notes and bibliography checks (CMOS 18), against the forms ResearchKit's
 * notes-and-bibliography generator produces:
 *
 *   Bibliography   Yu, Charles. Interior Chinatown. Pantheon Books, 2020.
 *                  Dittmar, Emily L., and Douglas W. Schemske. “Temporal Variation …” American Naturalist 202, no. 4 (2023): 471–85. https://doi.org/…
 *   Full note      Charles Yu, Interior Chinatown (Pantheon Books, 2020), 45.
 *   Short note     Yu, Interior Chinatown, 48.
 *
 * Notes are read from the text the writer pastes, never from a document's footnote
 * layout, so the checker can't see where notes sit or how they are numbered. A
 * shortened note is a later citation of a source, not a second entry.
 */

import type { Source } from "../../source";
import { authorBoundary, authorYearCitationCount, clean, entryForm, invertedFirstNames, lastYear, numericCitationCount, quotedTitle } from "../features";
import { issue } from "../issue";
import { checkLinks } from "../links";
import { checkAlphabeticalOrder } from "../list";
import type { CitationScan, DetectedSourceType, ParsedReference, RecognizedCitation, ReferenceCheckIssue, ReferenceEntry, StyleChecker } from "../types";
import { APA_JOURNAL_NUMBERS, LATER_AUTHOR_INVERTED } from "./chicago-author-date";

const STYLE = "Chicago notes and bibliography";
const NAME = String.raw`\p{Lu}[\p{L}.'’-]*`;

/** A full note: a name in normal order, a comma, then the work, with its year in brackets. */
const FULL_NOTE = new RegExp(String.raw`^${NAME}(?:\s+${NAME})+(?:\s+and\s+${NAME}(?:\s+${NAME})*|\s+et al\.)?,\s.*\([^()]*\b(?:1[5-9]|20)\d\d\)`, "u");
/** A shortened note: a family name or two, a short title, and a locator. */
const SHORT_NOTE = new RegExp(String.raw`^\p{Lu}[\p{L}'’-]+(?:\s+(?:and\s+\p{Lu}[\p{L}'’-]+|et al\.))?,\s(?:(?!\.\s)[^,])+,\s[\d–-]+\.?$`, "u");

function parseEntry(entry: ReferenceEntry): ParsedReference {
  const { index, originalText, text } = entry;
  const issues: ReferenceCheckIssue[] = [];
  const base = { index, originalText, ...(entry.label ? { label: entry.label } : {}) };

  if (FULL_NOTE.test(text) || SHORT_NOTE.test(text)) {
    issues.push(issue("unsupported-structure", "warning", "This looks like a note, not a bibliography entry.", "A note gives names in normal order and points to a page; a bibliography entry inverts the first author's name and lists the work as a whole. Notes go in the notes box, where they are matched to the bibliography.", "Move this note to the notes box, or rewrite it as a bibliography entry.", text));
    return { ...base, sourceType: "unknown", confidence: "partial", excluded: true, issues };
  }
  if (entry.label) issues.push(issue("style-mismatch", "warning", "This appears to use numeric citation formatting.", "A Chicago bibliography is alphabetical and unnumbered. Numbers belong to the notes, not the bibliography.", "Remove the numbers from the bibliography, or choose the style your list follows.", entry.label.raw));

  const form = entryForm(text);
  if (form === "author-period-year" || form === "author-year-stop" || form === "author-year") {
    issues.push(issue("style-mismatch", "warning", "Reference may be formatted using a different citation style.", `The year follows the author, as in an author–date style. In a ${STYLE} bibliography the year comes with the publication details: Yu, Charles. Interior Chinatown. Pantheon Books, 2020.`, "Check whether your work uses notes and bibliography or author-date, and choose the style above.", text));
  }

  const quotedFirst = /^[“"]/u.test(text);
  const boundary = quotedFirst ? null : authorBoundary(text);
  const lead = boundary?.lead ?? "";
  const rest = boundary ? boundary.rest : text;
  const names = quotedFirst || !boundary ? { names: [] as string[], etAl: false } : invertedFirstNames(lead);
  if (lead && /\s&\s/u.test(lead)) issues.push(issue("author-format", "warning", "Authors are joined with “&”.", "Chicago joins the last two authors with “and”.", "Replace “&” with “and”.", lead));
  if (lead && LATER_AUTHOR_INVERTED.test(lead)) issues.push(issue("author-format", "warning", "A later author's name appears inverted.", "A Chicago bibliography inverts only the first author's name; later authors keep normal order.", "Write every author after the first given names first.", lead));

  const links = checkLinks(rest, { style: "Chicago", doi: "link", bareUrls: false });
  issues.push(...links.issues);
  const quoted = quotedTitle(rest);
  const articleLike = quoted !== null && quoted.index === 0;
  const title = articleLike ? quoted.title : clean((/^(.+?[.?!])(?=\s|$)/u.exec(rest)?.[1] ?? rest).replace(/\.$/u, ""));
  if (!title) issues.push(issue("missing-metadata", "error", "A title could not be identified.", "Every Chicago bibliography entry identifies the work by its title.", "Check the entry and add the title."));
  if (articleLike && quoted.quotes === "single") issues.push(issue("title-format", "warning", "The title is in single quotation marks.", "Chicago puts article and web page titles in double quotation marks.", "Use double quotation marks.", `‘${quoted.title}’`));
  if (APA_JOURNAL_NUMBERS.test(rest)) issues.push(issue("journal-structure", "warning", "Journal numbers appear in APA's arrangement.", `A ${STYLE} bibliography writes the volume, the issue after “no.”, the year in brackets and the pages after a colon: 202, no. 4 (2023): 471–85.`, "Rearrange the volume, issue, year and pages.", APA_JOURNAL_NUMBERS.exec(rest)?.[0]));
  const year = lastYear(rest);
  if (!year && !/\bn\.d\./u.test(rest)) issues.push(issue("date-format", "warning", "No year could be found.", "A bibliography entry gives the year of publication with the publication details, or n.d. when the work has none.", "Add the year, or n.d., from the source."));
  if (!boundary && !quotedFirst) issues.push(issue("parse-warning", "warning", "The author could not be identified confidently.", "A Chicago bibliography entry begins with the first author's name inverted, followed by a full stop: Yu, Charles.", "Check the entry's opening against the source."));

  const sourceType: DetectedSourceType = /\(\d{4}\):\s/u.test(rest) || APA_JOURNAL_NUMBERS.test(rest) ? "journal-article" : articleLike && links.url ? "webpage" : "book";
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
    confidence: boundary && title ? "high" : "partial",
    source,
    key: { names: names.names.length > 0 ? names.names : [title], etAl: names.etAl, year, title, number: null },
    issues,
  };
}

function checkList(references: readonly ParsedReference[]): void {
  checkAlphabeticalOrder(references, { explanation: "A Chicago bibliography is in alphabetical order by the first author's family name, or by title when there is no author.", sameAuthorByYear: false });
}

/** A note's first element: the names, or a quoted title when there is no author. */
function readNote(note: string): RecognizedCitation | null {
  const [first = "", second = ""] = note.split(/,\s+/u);
  if (/^[“"]/u.test(first)) {
    // The comma after a quoted title sits inside the closing quotation mark, so the title is read as a whole.
    const title = quotedTitle(note)?.title ?? first.replace(/^[“"]|[,.]?[”"]$/gu, "");
    return { evidence: note, kind: FULL_NOTE.test(note) ? "full-note" : "short-note", names: [], etAl: false, years: [], numbers: [], title, issues: [] };
  }
  if (!/^\p{Lu}/u.test(first) || /\d/u.test(first)) return null;
  const etAl = /\set al\.$/u.test(first);
  const people = first.replace(/\s+et al\.$/u, "").split(/\s+and\s+/u);
  const full = people[0].trim().split(/\s+/u).length > 1;
  // In a full note names are in normal order, so the family name is the last word; a shortened note gives the family name alone.
  const names = people.map((person) => (full ? (person.trim().split(/\s+/u).pop() ?? person) : person.trim()));
  // The words before the family name, so an organization written in full can still be matched.
  const context = full ? people[0].trim().split(/\s+/u).slice(0, -1).join(" ") : undefined;
  const shortTitle = clean(second.replace(/^[“"]|[,.]?[”"]$/gu, "").replace(/\s*\(.*$/u, "")).split(/\s+/u).slice(0, 4).join(" ");
  return { evidence: note, kind: full ? "full-note" : "short-note", names, etAl, years: [], numbers: [], ...(context ? { context } : {}), ...(shortTitle ? { shortTitle } : {}), issues: [] };
}

function readCitations(text: string): CitationScan {
  const notes = text
    .replace(/\r\n?/gu, "\n")
    .split(/\n+/u)
    .map((line) => clean(line).replace(/^\d{1,4}[.)]?\s+/u, ""))
    .filter(Boolean);
  const citations: RecognizedCitation[] = [];
  const issues: ReferenceCheckIssue[] = [];
  const unread: string[] = [];
  for (const note of notes) {
    if (/^ibid\b/iu.test(note)) {
      issues.push(issue("citation-format", "information", "Ibid. can't be matched to an entry.", "Ibid. points to the note before it, so it depends on note order the checker can't verify. The Chicago Manual of Style, 18th edition, discourages ibid. in favour of shortened notes.", "Consider a shortened note, such as Yu, Interior Chinatown, 48.", note));
      continue;
    }
    const read = readNote(note);
    if (read) citations.push(read);
    else {
      unread.push(note);
      issues.push(issue("citation-consistency", "information", "Could not confidently identify citation.", "This line doesn't read as a full or shortened note, so it wasn't matched to the bibliography.", "If it is a note, check that it begins with the author's name or the title.", note));
    }
  }
  // A full note has the publisher and year in brackets, so only lines that aren't notes are checked for author–date citations.
  const authorDate = authorYearCitationCount(unread.join("\n"));
  if (authorDate > 0) issues.push(issue("style-mismatch", "warning", "This citation pattern appears author–date rather than notes.", "Citations such as (Yu 2020) belong to author–date systems. Notes and bibliography cites sources in numbered notes.", "Check whether your work uses notes or author–date citations, and choose the style above.", `${authorDate} author–date citation${authorDate === 1 ? "" : "s"}`));
  const numeric = numericCitationCount(text);
  if (numeric > 0) issues.push(issue("style-mismatch", "warning", "This appears to use numeric citation formatting rather than notes.", "Citations such as [1] belong to numeric styles such as IEEE.", "Check which style your document uses, and choose it above.", `${numeric} numeric citation${numeric === 1 ? "" : "s"}`));
  return { citations, issues };
}

export const chicagoNotesBibliographyChecker: StyleChecker = {
  id: "chicago-notes-bibliography",
  capabilities: { sourceTypes: ["book", "journal-article", "webpage"], citations: "notes", list: "bibliography", ordering: "alphabetical", yearLetters: false },
  notices: [
    issue("manual-review", "information", "Notes are checked as pasted text.", "The checker reads the notes you paste, one per line. It can't see where notes sit in your document or check their numbering.", "Check note placement and numbering in your word processor."),
  ],
  parseEntry,
  checkList,
  readCitations,
};
