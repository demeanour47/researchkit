/**
 * Chicago author-date reference list entries for books, journal articles and web
 * pages, following the Chicago Manual of Style, 18th ed. Patterns from the CMOS
 * author-date sample citations (chicagomanualofstyle.org/tools_citationguide/
 * citation-guide-2.html), italics marked *like this*:
 *
 *   Book      Yu, Charles. 2020. *Interior Chinatown*. Pantheon Books.
 *             Borel, Brooke. 2023. *The Chicago Guide to Fact-Checking*. 2nd ed. University of Chicago Press.
 *   Article   Dittmar, Emily L., and Douglas W. Schemske. 2023. “Temporal Variation . . .”
 *             *American Naturalist* 202 (4): 471–85. https://doi.org/10.1086/725865.
 *   Web page  Google. 2023. “Privacy Policy.” Privacy & Terms. Effective November 15. https://policies.google.com/privacy.
 *             Yale University. n.d. “About Yale: Yale Facts.” Accessed March 8, 2022. https://www.yale.edu/about-yale/yale-facts.
 *
 * - Elements are separated by full stops. The year follows the author; without a
 *   date, n.d. takes its place, and a web page then gets an access date.
 * - A place of publication is no longer required for books (CMOS 14.30).
 * - Article IDs stand in for a page range (CMOS 14.71): *PLOS ONE* 20 (3): e0318239.
 * - A DOI, as a https://doi.org/ link, is preferred to a URL (CMOS 13.7); URLs are
 *   given in full. Each ends with a full stop.
 * - An organization may be the author when no person is named (CMOS 13.86). It is
 *   kept as author even when it is also the publisher, since no Chicago rule found
 *   says otherwise; the researcher is told. When an organization author has the same
 *   name as its website, the site name is not repeated (the CMOS Yale example).
 * - Without an author, the entry begins with the title, followed by the year.
 * - Titles are not re-capitalised: headline style depends on judgment.
 */

import {
  endsWithTerminalPunctuation,
  isBlank,
  isWebAddress,
  italic,
  mergeRuns,
  normalizeDoi,
  ordinal,
  placeholder,
  plain,
  type Run,
  type Source,
} from "../../source";
import { chicagoDate, fullDate } from "../dates";
import { MAX_LISTED_AUTHORS, listAuthors, named, type NamedContributor } from "../names";
import { formatChicagoPages } from "../numbers";
import type { Decision, Note } from "./notes";

/** What an entry begins with, and its date. Text citations must match both. */
export type Lead =
  | { kind: "authors"; authors: readonly NamedContributor[] }
  | { kind: "title"; title: string; italic: boolean };

export interface ChicagoReference {
  runs: Run[];
  lead: Lead;
  /** The year as it appears after the author, or null for n.d. */
  year: number | null;
  decisions: Decision[];
  notes: Note[];
}

/** Adds a full stop unless the text already ends with terminal punctuation. */
const closing = (text: string) => (endsWithTerminalPunctuation(text) ? "" : ".");
const sentence = (text: string): Run[] => [plain(text + closing(text))];
const sameName = (a: string, b: string) => a.trim().toLocaleLowerCase("en") === b.trim().toLocaleLowerCase("en");

/** A name typed in one field that looks like several names, or a name already inverted. */
const looksAmbiguous = (text: string) => /[,;&]|\s(?:and|et al\.?)\s/iu.test(` ${text} `);
/** Roles the source model can't represent: editors, translators, compilers. */
const ROLE_WORDS = /\b(?:eds?|editors?|edited by|trans|translators?|translated by|comp|compilers?)\b\.?/iu;

function authorsOf(source: Source, notes: Note[]): NamedContributor[] {
  const listed: NamedContributor[] = [];
  source.authors.forEach((author, index) => {
    if (isBlank(author)) return;
    const name = named(author);
    if (!name) {
      notes.push({ code: "author-incomplete", position: index + 1 });
      return;
    }
    const typed = name.kind === "person" ? `${name.family} ${name.given}` : name.name;
    if (ROLE_WORDS.test(typed)) notes.push({ code: "unsupported-contributor-role", position: index + 1 });
    else if (name.kind === "person" && looksAmbiguous(typed)) notes.push({ code: "ambiguous-author", position: index + 1 });
    listed.push(name);
  });
  return listed;
}

const soleOrganization = (authors: readonly NamedContributor[]) => {
  const [only] = authors;
  return authors.length === 1 && only.kind === "organization" ? only.name : null;
};

function titleElement(source: Source, decisions: Decision[], notes: Note[]): Run[] {
  decisions.push({ code: source.type === "book" ? "book-title-italic" : source.type === "journal-article" ? "article-title-quoted" : "page-title-quoted" });
  const title = source.title.trim();
  if (!title) {
    notes.push({ code: "missing-title" });
    return [placeholder("[Title]"), plain(".")];
  }
  notes.push({ code: "check-headline-style" });
  return source.type === "book" ? [italic(title), plain(closing(title))] : [plain(`“${title}${closing(title)}”`)];
}

/** A DOI if valid, otherwise a URL if valid, otherwise nothing. */
function locationElement(doi: string | undefined, url: string | undefined, decisions: Decision[], notes: Note[]): Run[] | null {
  const typedUrl = (url ?? "").trim();
  if (doi && doi.trim()) {
    const normalized = normalizeDoi(doi);
    if (normalized) {
      decisions.push({ code: "doi-used" });
      if (typedUrl) decisions.push({ code: "url-left-out-for-doi" });
      return sentence(normalized);
    }
    notes.push({ code: "invalid-doi" });
  }
  if (!typedUrl) return null;
  if (!isWebAddress(typedUrl)) {
    notes.push({ code: "invalid-url" });
    return null;
  }
  decisions.push({ code: "url-used" });
  return sentence(typedUrl);
}

function bookElements(source: Extract<Source, { type: "book" }>, authors: readonly NamedContributor[], decisions: Decision[], notes: Note[]): (Run[] | null)[] {
  const elements: (Run[] | null)[] = [];
  const edition = (source.edition ?? "").trim();
  if (/^\d+$/u.test(edition)) {
    if (Number(edition) > 1) {
      decisions.push({ code: "edition-shown" });
      elements.push(sentence(`${ordinal(Number(edition))} ed.`));
    } else {
      decisions.push({ code: "first-edition-omitted" });
    }
  } else if (edition) {
    notes.push({ code: "check-edition" });
    elements.push(sentence(edition));
  }
  const publisher = (source.publisher ?? "").trim();
  if (!publisher) notes.push({ code: "missing-publisher" });
  else {
    const organization = soleOrganization(authors);
    if (organization && sameName(organization, publisher)) notes.push({ code: "organization-also-publisher" });
    elements.push(sentence(publisher));
  }
  elements.push(locationElement(source.doi, source.url, decisions, notes));
  return elements;
}

function journalElements(source: Extract<Source, { type: "journal-article" }>, decisions: Decision[], notes: Note[]): (Run[] | null)[] {
  const journal = source.journal.trim();
  const volume = (source.volume ?? "").trim();
  const issue = (source.issue ?? "").trim();
  const pages = (source.pages ?? "").trim();
  const articleNumber = (source.articleNumber ?? "").trim();

  const runs: Run[] = [];
  if (journal) runs.push(italic(journal));
  else {
    notes.push({ code: "missing-journal" });
    runs.push(placeholder("[Journal]"));
  }
  if (volume) {
    runs.push(plain(` ${volume}${issue ? ` (${issue})` : ""}`));
    if (issue) notes.push({ code: "journal-issue-variant" });
  } else if (issue) {
    // A journal numbered by issue alone takes a comma and "no." after its title.
    runs.push(plain(`, no. ${issue}`));
  }
  if (volume || issue) decisions.push({ code: "journal-numbers" });

  let location = "";
  if (pages) {
    const formatted = formatChicagoPages(pages);
    if (formatted.shortened) decisions.push({ code: "pages-shortened", from: pages, to: formatted.text });
    location = formatted.text;
    if (articleNumber) notes.push({ code: "article-number-not-shown" });
  } else if (articleNumber) {
    decisions.push({ code: "article-id-for-pages" });
    location = articleNumber;
  }
  if (location) runs.push(plain(`${volume || issue ? ":" : ","} ${location}`));
  runs.push(plain("."));

  if (!volume && !issue && !location) notes.push({ code: "incomplete-journal", missing: "numbers" });
  else if (!volume) notes.push({ code: "incomplete-journal", missing: "volume" });
  else if (!location) notes.push({ code: "incomplete-journal", missing: "pages" });

  return [runs, locationElement(source.doi, source.url, decisions, notes)];
}

function webElements(source: Extract<Source, { type: "webpage" }>, authors: readonly NamedContributor[], year: number | null, monthDay: string | null, decisions: Decision[], notes: Note[]): (Run[] | null)[] {
  const elements: (Run[] | null)[] = [];
  const organization = soleOrganization(authors);
  const siteName = (source.siteName ?? "").trim();
  const publisher = (source.publisher ?? "").trim();

  if (siteName && organization && sameName(organization, siteName)) {
    decisions.push({ code: "site-name-omitted" });
  } else if (siteName) {
    elements.push(sentence(siteName));
    if (publisher && !sameName(publisher, siteName)) notes.push({ code: "publisher-not-shown" });
  } else if (publisher && !(organization && sameName(organization, publisher))) {
    decisions.push({ code: "site-owner-used" });
    elements.push(sentence(publisher));
  }

  if (monthDay) {
    decisions.push({ code: "web-month-day" });
    notes.push({ code: "web-date-label" });
    elements.push(sentence(monthDay));
  }

  let accessDateShown = false;
  if (source.accessed) {
    const accessed = chicagoDate(source.accessed);
    if (accessed.problem) notes.push({ code: accessed.problem, date: "access" });
    const text = fullDate(accessed);
    if (year !== null) {
      if (text) notes.push({ code: "access-date-not-needed" });
    } else if (text) {
      decisions.push({ code: "access-date", text });
      elements.push(sentence(`Accessed ${text}`));
      accessDateShown = true;
    }
  }
  if (year === null && !accessDateShown) notes.push({ code: "missing-access-date" });

  if (source.url.trim()) elements.push(locationElement(undefined, source.url, decisions, notes));
  else notes.push({ code: "missing-url" });
  return elements;
}

export function formatChicagoReference(source: Source): ChicagoReference {
  const decisions: Decision[] = [];
  const notes: Note[] = [];

  const authors = authorsOf(source, notes);
  const date = chicagoDate(source.date);
  if (date.problem) notes.push({ code: date.problem, date: "publication" });
  const yearRuns = sentence(date.year === null ? "n.d." : String(date.year));
  if (date.year === null) {
    decisions.push({ code: "no-date" });
    notes.push({ code: "missing-year", sourceType: source.type });
  } else {
    decisions.push({ code: "year-after-author" });
  }

  const title = titleElement(source, decisions, notes);
  const elements: (Run[] | null)[] = [];
  if (authors.length > 0) {
    const [first] = authors;
    if (first.kind === "organization") decisions.push({ code: "organization-author" });
    else if (first.given) decisions.push({ code: "first-author-inverted" });
    if (authors.length > MAX_LISTED_AUTHORS) decisions.push({ code: "authors-shortened", count: authors.length });
    else if (authors.length > 1) decisions.push({ code: "authors-listed", count: authors.length });
    elements.push(sentence(listAuthors(authors)), yearRuns, title);
  } else {
    notes.push({ code: "no-author" });
    decisions.push({ code: "title-first" });
    elements.push(title, yearRuns);
  }

  // Only the month and day of a web page's date are repeated after the site; books and articles use the year alone.
  const monthDay = source.type === "webpage" && date.year !== null ? date.monthDay : null;
  if (source.type === "book") elements.push(...bookElements(source, authors, decisions, notes));
  else if (source.type === "journal-article") elements.push(...journalElements(source, decisions, notes));
  else elements.push(...webElements(source, authors, date.year, monthDay, decisions, notes));

  const present = elements.filter((element): element is Run[] => element !== null && element.length > 0);
  const lead: Lead = authors.length > 0 ? { kind: "authors", authors } : { kind: "title", title: source.title.trim(), italic: source.type === "book" };

  return {
    runs: mergeRuns(present.flatMap((element, index) => (index === 0 ? element : [plain(" "), ...element]))),
    lead,
    year: date.year,
    decisions,
    notes,
  };
}
