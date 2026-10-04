/**
 * Chicago notes: the full note for the first citation of a source and the shortened
 * note for later ones, following the CMOS 18 sample citations
 * (chicagomanualofstyle.org/tools_citationguide/citation-guide-1.html):
 *
 *   Full      1. Charles Yu, *Interior Chinatown* (Pantheon Books, 2020), 45.
 *             4. Emily L. Dittmar and Douglas W. Schemske, “Temporal Variation . . . ,” *American Naturalist* 202, no. 4 (2023): 480, https://doi.org/10.1086/725865.
 *             3. “About Yale: Yale Facts,” Yale University, accessed March 8, 2022, https://www.yale.edu/about-yale/yale-facts.
 *   Short     3. Yu, *Interior Chinatown*, 48.
 *             5. Kwon, “Inclusion Work,” 1851.
 *             4. Google, “Privacy Policy.”
 *             6. “Yale Facts.”
 *
 * - Names are in normal order in a full note; three or more authors are the first and
 *   et al. A shortened note gives surnames, as in an author-date citation.
 * - A note cites the specific page; the bibliography gives an article's full range.
 * - A web page's note begins with its title when no person is its author, naming the
 *   site and then its owner.
 * - Commas go inside closing quotation marks, even after a question mark
 *   (“Are Flax Seeds All That?,”).
 * - Note numbers belong to the writer's document, so they are not generated.
 */

import { endsWithTerminalPunctuation, italic, mergeRuns, placeholder, plain, type Run } from "../../source";
import { noteAuthors, textAuthors } from "../names";
import { formatChicagoPages } from "../numbers";
import { chicagoEdition, sameName } from "../source-parts";
import { analyse, type Analysis } from "./analysis";
import { journalNumbers } from "./bibliography";
import type { Decision, Note } from "./notes";
import type { NoteContext, NoteLocator, NotesBibliographyRequest } from "./request";
import { chicagoShortTitle } from "./short-title";

export interface ChicagoNote {
  runs: Run[];
  decisions: Decision[];
  notes: Note[];
}

/** The locator as a note gives it: a page or range with no “p.”, or “chap. 6”. */
function locatorText(locator: NoteLocator | undefined, decisions: Decision[], notes: Note[]): string | null {
  if (!locator) return null;
  const value = locator.value.trim();
  if (!value) {
    notes.push({ code: "missing-locator-value" });
    return null;
  }
  if (locator.kind === "paragraph" || locator.kind === "section") {
    notes.push({ code: "unsupported-locator", kind: locator.kind });
    return null;
  }
  if (locator.kind === "chapter") {
    decisions.push({ code: "note-locator", kind: "chapter" });
    return `chap. ${value}`;
  }
  const pages = formatChicagoPages(value);
  if (locator.kind === "page-range" && !pages.range) notes.push({ code: "incomplete-locator" });
  if (pages.shortened) decisions.push({ code: "pages-shortened", from: value, to: pages.text });
  decisions.push({ code: "note-locator", kind: "page" });
  return pages.text;
}

/**
 * The title as a note element. A comma that follows a quoted title goes inside the
 * quotation marks; the note's final full stop does too, unless the title ends with
 * its own question or exclamation mark.
 */
function noteTitle(analysis: Analysis, text: string, after: "comma" | "end" | "none"): Run[] {
  if (!text) return [placeholder("[Title]"), plain(after === "comma" ? "," : after === "end" ? "." : "")];
  if (analysis.source.type === "book") return [italic(text), plain(after === "comma" ? "," : after === "end" ? (endsWithTerminalPunctuation(text) ? "" : ".") : "")];
  const mark = after === "comma" ? "," : after === "end" && !endsWithTerminalPunctuation(text) ? "." : "";
  return [plain(`“${text}${mark}”`)];
}

/** Joins elements with commas and ends the note with a full stop. */
function commaSeparated(elements: readonly Run[][]): Run[] {
  const runs = elements.flatMap((element, index) => (index === 0 ? element : [plain(", "), ...element]));
  const last = runs[runs.length - 1];
  return [...runs, plain(last && endsWithTerminalPunctuation(last.text) ? "" : ".")];
}

function fullNote(analysis: Analysis, located: string | null, decisions: Decision[], notes: Note[]): Run[] {
  const { source, authors } = analysis;
  const names = authors.length > 0 ? noteAuthors(authors) : null;
  if (names) {
    decisions.push({ code: "note-names-normal-order" });
    if (authors.length > 2) decisions.push({ code: "note-et-al" });
  }
  const location = analysis.location.location?.text ?? null;

  if (source.type === "book") {
    const edition = chicagoEdition(source.edition);
    const publisher = (source.publisher ?? "").trim();
    decisions.push({ code: "book-publication-parentheses" });
    const label = edition.kind === "numbered" || edition.kind === "as-typed" ? edition.label : null;
    const titleRuns = label ? [...noteTitle(analysis, analysis.title, "comma"), plain(` ${label}`)] : noteTitle(analysis, analysis.title, "none");
    const book: Run[] = [...titleRuns, plain(` (${publisher ? `${publisher}, ` : ""}${analysis.year})`)];
    return commaSeparated([...(names ? [[plain(names)]] : []), book, ...(located ? [[plain(located)]] : []), ...(location ? [[plain(location)]] : [])]);
  }

  if (source.type === "journal-article") {
    const journal = source.journal.trim();
    const volume = (source.volume ?? "").trim();
    const issue = (source.issue ?? "").trim();
    const articleNumber = (source.articleNumber ?? "").trim();
    const where = [located, articleNumber || null].filter(Boolean).join(", ");
    if (!located) notes.push({ code: "article-note-without-page" });
    const article: Run[] = [
      ...noteTitle(analysis, analysis.title, "comma"),
      plain(" "),
      ...(journal ? [italic(journal)] : [placeholder("[Journal]")]),
      plain(`${journalNumbers(volume, issue, analysis.year)}${where ? `: ${where}` : ""}`),
    ];
    return commaSeparated([...(names ? [[plain(names)]] : []), article, ...(location ? [[plain(location)]] : [])]);
  }

  // A web page: the author first if a person, otherwise the title; then the site, its owner, the date and the URL.
  if (!(analysis.personal && names)) decisions.push({ code: "web-note-title-first" });
  const lead: Run[] = analysis.personal && names ? [plain(`${names}, `)] : [];
  const owner = analysis.personal ? null : analysis.owner;
  const tail = [
    analysis.siteName,
    owner && !(analysis.siteName && sameName(owner, analysis.siteName)) ? owner : null,
    analysis.webDate ?? (analysis.accessed ? `accessed ${analysis.accessed}` : null),
    located,
    location,
  ].filter((part): part is string => Boolean(part));
  if (tail.length === 0) return [...lead, ...noteTitle(analysis, analysis.title, "end")];
  return [...lead, ...noteTitle(analysis, analysis.title, "comma"), plain(" "), ...commaSeparated(tail.map((part) => [plain(part)]))];
}

function shortNote(analysis: Analysis, request: NotesBibliographyRequest, located: string | null, decisions: Decision[], notes: Note[]): Run[] {
  const { source, authors } = analysis;
  const short = chicagoShortTitle(analysis.title, request.shortTitle);
  if (analysis.title || short.method === "custom") decisions.push({ code: "short-title", text: short.text, method: short.method });
  if (short.needsJudgment) notes.push({ code: "shorten-title" });

  // Web pages are cited by title alone unless a person wrote them, or an organization is named apart from its site (CMOS samples).
  const named = source.type !== "webpage" ? authors.length > 0 : analysis.personal || (authors.length > 0 && analysis.siteName !== null);
  if (named) decisions.push({ code: "short-note-surnames" });
  else decisions.push({ code: "short-note-title-only" });
  if (!named && !short.text) notes.push({ code: "short-note-unidentifiable" });

  const title = noteTitle(analysis, short.text, located ? "comma" : "end");
  const runs: Run[] = [...(named ? [plain(`${textAuthors(authors)}, `)] : []), ...title];
  if (located) runs.push(plain(` ${located}.`));
  return runs;
}

/** A full or shortened note for the request. The writer chooses which, since only their document shows whether the source was cited before. */
export function formatChicagoNote(request: NotesBibliographyRequest, context: NoteContext, analysis: Analysis = analyse(request.record.source)): ChicagoNote {
  const decisions: Decision[] = [...analysis.decisions];
  const notes: Note[] = [...analysis.notes];
  const located = locatorText(request.locator, decisions, notes);
  const runs = context === "full-note" ? fullNote(analysis, located, decisions, notes) : shortNote(analysis, request, located, decisions, notes);
  if (context === "short-note") notes.push({ code: "ibid-not-used" });
  return { runs: mergeRuns(runs), decisions, notes };
}

