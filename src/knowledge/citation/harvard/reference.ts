/**
 * Harvard reference list entries for books, journal articles and web pages in
 * ResearchKit's Harvard profile: Cite Them Right, 13th edition (Pears and Shields,
 * 2025; ADR-0008). Cite Them Right is published by subscription, so its patterns are
 * taken from university library guides that reproduce it; italics marked *like this*:
 *
 *   Book      Cottrell, S. (2019) *The study skills handbook*. 5th edn. Red Globe Press.
 *   Article   Thaker, J., Smith, N. and Leiserowitz, A. (2020) ‘Global warming risk perceptions
 *             in India’, *Risk Analysis*, 40(12), pp. 2481–2497. Available at: https://doi.org/10.1111/risa.13574
 *             Iacobellis, G. (2020) ‘COVID-19 and diabetes: can DPP4 inhibition play a role?’,
 *             *Diabetes Research and Clinical Practice*, 162, article 108125.
 *   Web page  Sneed, A. (2019) *The reason Antarctica is melting*. Available at:
 *             https://www.scientificamerican.com/ (Accessed: 23 July 2020).
 *             Cool Antarctica (no date) *Antarctica and global warming*. Available at: … (Accessed: 23 July 2020).
 *
 * - The year follows the author in round brackets, with no full stop after it; without
 *   one, "no date" takes its place.
 * - The 13th edition dropped the place of publication: a book gives its publisher only.
 *   A later edition is abbreviated "edn": 2nd edn.
 * - A DOI is given as a https://doi.org/ link after "Available at:" and needs no access
 *   date. A URL is followed by the date it was accessed. Neither link is followed by a
 *   full stop, so it can't be mistaken for part of the address; the access date is.
 * - Pages take "p." or "pp." and are given in full: pp. 2481–2497.
 * - Without an author, the entry begins with the title, followed by the year.
 * - Titles are not re-capitalized: sentence case needs judgment about proper nouns.
 */

import { endsWithTerminalPunctuation, formatPages, isWebAddress, italic, mergeRuns, normalizeDoi, ordinal, placeholder, plain, type PublicationDate, type Run, type Source } from "../source";
import { nameableAuthors, type NamedContributor } from "../source/authors";
import { harvardDate, readYearLetter } from "./dates";
import { MAX_TEXT_AUTHORS, listAuthors } from "./names";
import type { Decision, Note } from "./notes";

/** What an entry begins with. Text citations name the same thing. */
export type Lead =
  | { kind: "authors"; authors: readonly NamedContributor[] }
  | { kind: "title"; title: string; style: "italic" | "quoted" };

export interface HarvardReference {
  runs: Run[];
  lead: Lead;
  /** The year with any letter, "2024a", or "no date": exactly as it appears in the reference. */
  date: string;
  decisions: Decision[];
  notes: Note[];
}

/** Adds a full stop unless the text already ends with terminal punctuation. */
const closing = (text: string) => (endsWithTerminalPunctuation(text) ? "" : ".");

/** A title as the reference writes it: italic for a book or web page, in single quotation marks for an article. */
const titleStyle = (source: Source) => (source.type === "journal-article" ? "quoted" : "italic");

function titleRuns(title: string, style: "italic" | "quoted"): Run[] {
  if (!title) return style === "quoted" ? [plain("‘"), placeholder("[Title]"), plain("’")] : [placeholder("[Title]")];
  return style === "quoted" ? [plain(`‘${title}’`)] : [italic(title)];
}

/** "2" or "2nd" → "2nd edn."; a first edition isn't shown; other wording is kept as typed. */
function editionElement(edition: string | undefined, decisions: Decision[], notes: Note[]): Run[] | null {
  const text = (edition ?? "").trim();
  if (!text) return null;
  const numbered = /^(\d+)(?:st|nd|rd|th)?$/iu.exec(text);
  if (numbered) {
    const number = Number(numbered[1]);
    if (number <= 1) {
      decisions.push({ code: "first-edition-omitted" });
      return null;
    }
    decisions.push({ code: "edition-shown" });
    return [plain(`${ordinal(number)} edn.`)];
  }
  notes.push({ code: "check-edition" });
  return [plain(text + closing(text))];
}

/**
 * "Available at:" and a DOI link, or a URL and its access date. A valid DOI is
 * preferred; an invalid one is reported and the URL is used instead.
 */
function availableAt(doi: string | undefined, url: string | undefined, accessed: PublicationDate | undefined, decisions: Decision[], notes: Note[]): Run[] | null {
  const typedUrl = (url ?? "").trim();
  const access = accessed ? harvardDate(accessed) : null;
  if (doi && doi.trim()) {
    const link = normalizeDoi(doi);
    if (link) {
      decisions.push({ code: "doi-used" });
      if (typedUrl) decisions.push({ code: "url-left-out-for-doi" });
      if (access?.text) notes.push({ code: "access-date-not-needed" });
      return [plain(`Available at: ${link}`)];
    }
    notes.push({ code: "invalid-doi" });
  }
  if (!typedUrl) return null;
  if (!isWebAddress(typedUrl)) {
    notes.push({ code: "invalid-url" });
    return null;
  }
  decisions.push({ code: "url-used" });
  if (access?.problem) notes.push({ code: access.problem, date: "access" });
  if (!access?.text) {
    notes.push({ code: "missing-access-date" });
    return [plain(`Available at: ${typedUrl}`)];
  }
  if (!access.complete) notes.push({ code: "incomplete-access-date" });
  decisions.push({ code: "access-date", text: access.text });
  return [plain(`Available at: ${typedUrl} (Accessed: ${access.text}).`)];
}

function bookElements(source: Extract<Source, { type: "book" }>, decisions: Decision[], notes: Note[]): (Run[] | null)[] {
  const publisher = (source.publisher ?? "").trim();
  if (publisher) decisions.push({ code: "publisher-only" });
  else notes.push({ code: "missing-publisher" });
  return [
    editionElement(source.edition, decisions, notes),
    publisher ? [plain(publisher + closing(publisher))] : null,
    availableAt(source.doi, source.url, source.accessed, decisions, notes),
  ];
}

/** "*Journal*, 40(12), pp. 2481–2497." */
function journalDetails(source: Extract<Source, { type: "journal-article" }>, decisions: Decision[], notes: Note[]): Run[] {
  const journal = source.journal.trim();
  const volume = (source.volume ?? "").trim();
  const issue = (source.issue ?? "").trim();
  const pages = formatPages(source.pages ?? "");
  const articleNumber = (source.articleNumber ?? "").trim();

  const runs: Run[] = [];
  if (journal) runs.push(italic(journal));
  else {
    notes.push({ code: "missing-journal" });
    runs.push(placeholder("[Journal]"));
  }
  if (volume || issue) {
    decisions.push({ code: "journal-numbers" });
    runs.push(plain(`, ${volume}${issue ? `(${issue})` : ""}`));
  }
  if (pages) {
    const range = pages.includes("–");
    decisions.push({ code: range ? "page-range" : "single-page" });
    runs.push(plain(`, ${range ? "pp." : "p."} ${pages}`));
    if (articleNumber) notes.push({ code: "article-number-not-shown" });
  } else if (articleNumber) {
    decisions.push({ code: "article-number" });
    runs.push(plain(`, article ${articleNumber}`));
  }
  runs.push(plain("."));

  if (!volume && !issue && !pages && !articleNumber) notes.push({ code: "incomplete-journal", missing: "numbers" });
  else if (!volume) notes.push({ code: "incomplete-journal", missing: "volume" });
  else if (!pages && !articleNumber) notes.push({ code: "incomplete-journal", missing: "pages" });
  return runs;
}

function webElements(source: Extract<Source, { type: "webpage" }>, decisions: Decision[], notes: Note[]): (Run[] | null)[] {
  if ((source.siteName ?? "").trim() || (source.publisher ?? "").trim()) notes.push({ code: "site-not-shown" });
  if (!source.url.trim()) {
    notes.push({ code: "missing-url" });
    return [];
  }
  return [availableAt(undefined, source.url, source.accessed, decisions, notes)];
}

/** The year as the reference and citations write it, with the writer's letter if there is a year to attach it to. */
function dateText(source: Source, yearLetter: string | undefined, decisions: Decision[], notes: Note[]): string {
  const date = harvardDate(source.date);
  if (date.problem) notes.push({ code: date.problem, date: "publication" });
  const letter = readYearLetter(yearLetter);
  if (letter.invalid) notes.push({ code: "invalid-year-letter" });
  if (date.year === null) {
    decisions.push({ code: "no-date" });
    notes.push({ code: "missing-year", sourceType: source.type });
    if (letter.letter) notes.push({ code: "year-letter-without-year" });
    return "no date";
  }
  decisions.push({ code: "year-in-brackets" });
  if (letter.letter) {
    decisions.push({ code: "year-letter", letter: letter.letter });
    return `${date.year}${letter.letter}`;
  }
  // Letters depend on the whole reference list, which a single-source generator can't see.
  notes.push({ code: "same-year-letter" });
  return String(date.year);
}

export function formatHarvardReference(source: Source, yearLetter?: string): HarvardReference {
  const decisions: Decision[] = [];
  const notes: Note[] = [{ code: "profile" }];

  const { authors, problems } = nameableAuthors(source.authors);
  notes.push(...problems);
  const date = dateText(source, yearLetter, decisions, notes);

  const title = source.title.trim();
  const style = titleStyle(source);
  decisions.push({ code: source.type === "book" ? "book-title-italic" : source.type === "journal-article" ? "article-title-quoted" : "page-title-italic" });
  if (title) notes.push({ code: "check-capitals" });
  else notes.push({ code: "missing-title" });

  const elements: (Run[] | null)[] = [];
  if (authors.length > 0) {
    const [first] = authors;
    if (first.kind === "organization") decisions.push({ code: "organization-author" });
    else decisions.push({ code: "surname-initials" });
    if (authors.length > 1) decisions.push({ code: "authors-listed", count: authors.length });
    if (authors.length > MAX_TEXT_AUTHORS) notes.push({ code: "et-al-variant" });
    // An article title is followed by a comma, inside the sentence that names its journal; other titles end with a full stop.
    const titled = style === "quoted" ? [...titleRuns(title, style), plain(",")] : [...titleRuns(title, style), plain(closing(title))];
    elements.push([plain(`${listAuthors(authors)} (${date})`)], titled);
  } else {
    notes.push({ code: "no-author" });
    decisions.push({ code: "title-first" });
    elements.push([...titleRuns(title, style), plain(` (${date})`)]);
  }

  if (source.type === "book") elements.push(...bookElements(source, decisions, notes));
  else if (source.type === "journal-article") elements.push(journalDetails(source, decisions, notes), availableAt(source.doi, source.url, source.accessed, decisions, notes));
  else elements.push(...webElements(source, decisions, notes));

  const present = elements.filter((element): element is Run[] => element !== null && element.length > 0);
  const lead: Lead = authors.length > 0 ? { kind: "authors", authors } : { kind: "title", title, style };

  return {
    runs: mergeRuns(present.flatMap((element, index) => (index === 0 ? element : [plain(" "), ...element]))),
    lead,
    date,
    decisions,
    notes,
  };
}
