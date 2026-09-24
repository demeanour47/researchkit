/**
 * APA 7 references and in-text citations for books, journal articles and web pages.
 *
 * Reference patterns (italics marked *like this*):
 *   Book     Author. (Year). *Title* (2nd ed.). Publisher. https://doi.org/…
 *   Article  Author. (Year). Title. *Journal*, *Volume*(Issue), Pages. https://doi.org/…
 *   Web page Author. (Year, Month Day). *Title*. Site Name. URL
 *
 * - Without an author, the title moves to the author position, before the date.
 * - Without a date, "n.d." is used.
 * - The publisher (books) or site name (web pages) is left out when it is the same
 *   as the author.
 * - A DOI is preferred to a URL. Neither ends with a full stop.
 * - An element that already ends in ? or ! gets no extra full stop.
 * - Titles are not re-capitalised: APA's sentence case depends on proper nouns,
 *   which only the writer can judge, so the result asks the writer to check.
 *
 * In-text citations: one author (Smith, 2020); two (Smith & Jones, 2020), or
 * "Smith and Jones (2020)" in running text; three or more (Smith et al., 2020).
 * Without an author, the title stands in: in italics for books and web pages, in
 * quotation marks for articles.
 */

import { editionLabel, formatPages, isWebAddress, normalizeDoi } from "./identifiers";
import { citationName, formatAuthorList, isBlank, MAX_LISTED_AUTHORS, referenceName, type Contributor } from "./names";
import { endsWithTerminalPunctuation, italic, mergeRuns, placeholder, plain, type Run } from "./runs";

export type SourceType = "book" | "journal-article" | "webpage";

export interface PublicationDate {
  year?: number;
  /** 1–12. Used for web pages only. */
  month?: number;
  /** Used for web pages only, and only with a month. */
  day?: number;
}

interface CommonSource {
  authors: readonly Contributor[];
  date: PublicationDate;
  title: string;
}

export interface BookSource extends CommonSource {
  type: "book";
  edition?: string;
  publisher?: string;
  doi?: string;
  url?: string;
}

export interface JournalArticleSource extends CommonSource {
  type: "journal-article";
  journal: string;
  volume?: string;
  issue?: string;
  pages?: string;
  articleNumber?: string;
  doi?: string;
  url?: string;
}

export interface WebpageSource extends CommonSource {
  type: "webpage";
  siteName?: string;
  url: string;
}

export type Source = BookSource | JournalArticleSource | WebpageSource;

export type RequiredField = "title" | "publisher" | "journal" | "url";

/** Every decision or problem worth telling the writer about. */
export type Note =
  | { code: "no-author" }
  | { code: "author-incomplete"; position: number }
  | { code: "over-twenty-authors"; count: number }
  | { code: "no-date" }
  | { code: "invalid-date" }
  | { code: "day-without-month" }
  | { code: "missing"; field: RequiredField }
  | { code: "publisher-omitted" }
  | { code: "site-name-omitted" }
  | { code: "first-edition-omitted" }
  | { code: "invalid-doi" }
  | { code: "invalid-url" }
  | { code: "check-sentence-case" };

export interface Citation {
  reference: Run[];
  /** For example "(LeCun et al., 2015)". */
  parenthetical: Run[];
  /** For example "LeCun et al. (2015)", for use in running text. */
  narrative: Run[];
  notes: Note[];
}

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

const isLeapYear = (year: number) => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

function daysInMonth(year: number, month: number): number {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

const isWholeNumberIn = (value: number | undefined, min: number, max: number): value is number =>
  value !== undefined && Number.isInteger(value) && value >= min && value <= max;

/** The date as it appears inside the parentheses: "2020", "2020, March 5" or "n.d.". */
function dateLabel(source: Source, notes: Note[]): { label: string; year: string } {
  const { year, month, day } = source.date;
  if (year === undefined) {
    notes.push({ code: "no-date" });
    return { label: "n.d.", year: "n.d." };
  }
  if (!isWholeNumberIn(year, 1, 9999)) {
    notes.push({ code: "invalid-date" });
    return { label: "n.d.", year: "n.d." };
  }
  if (source.type !== "webpage") return { label: String(year), year: String(year) };

  if (month === undefined) {
    if (day !== undefined) notes.push({ code: "day-without-month" });
    return { label: String(year), year: String(year) };
  }
  if (!isWholeNumberIn(month, 1, 12)) {
    notes.push({ code: "invalid-date" });
    return { label: String(year), year: String(year) };
  }
  const monthName = MONTHS[month - 1];
  if (day === undefined) return { label: `${year}, ${monthName}`, year: String(year) };
  if (!isWholeNumberIn(day, 1, daysInMonth(year, month))) {
    notes.push({ code: "invalid-date" });
    return { label: `${year}, ${monthName}`, year: String(year) };
  }
  return { label: `${year}, ${monthName} ${day}`, year: String(year) };
}

/** Adds a full stop unless the element already ends with terminal punctuation. */
const closing = (text: string) => (endsWithTerminalPunctuation(text) ? "" : ".");

const sameName = (a: string, b: string) => a.trim().toLocaleLowerCase("en") === b.trim().toLocaleLowerCase("en");

/** The single organization author's name, if the work has exactly one author and it is an organization. */
function soleOrganization(authors: readonly Contributor[]): string | null {
  const [only, ...others] = authors;
  return only && others.length === 0 && only.kind === "organization" ? only.name : null;
}

function titleElement(source: Source, notes: Note[]): Run[] {
  const title = source.title.trim();
  if (!title) {
    notes.push({ code: "missing", field: "title" });
    return [placeholder("[Title]"), plain(".")];
  }
  notes.push({ code: "check-sentence-case" });

  if (source.type === "journal-article") return [plain(title), plain(closing(title))];

  if (source.type === "book") {
    const edition = editionLabel(source.edition ?? "");
    if (!edition && (source.edition ?? "").trim() !== "") notes.push({ code: "first-edition-omitted" });
    if (edition) return [italic(title), plain(` (${edition}).`)];
  }
  return [italic(title), plain(closing(title))];
}

/** A DOI if valid, otherwise a web address if valid, otherwise nothing. */
function locator(doi: string | undefined, url: string | undefined, notes: Note[]): Run[] {
  if (doi && doi.trim()) {
    const normalized = normalizeDoi(doi);
    if (normalized) return [plain(normalized)];
    notes.push({ code: "invalid-doi" });
  }
  if (url && url.trim()) {
    if (isWebAddress(url)) return [plain(url.trim())];
    notes.push({ code: "invalid-url" });
  }
  return [];
}

function sourceElements(source: Source, authors: readonly Contributor[], notes: Note[]): Run[][] {
  switch (source.type) {
    case "book": {
      const elements: Run[][] = [];
      const publisher = (source.publisher ?? "").trim();
      const organization = soleOrganization(authors);
      if (!publisher) {
        notes.push({ code: "missing", field: "publisher" });
        elements.push([placeholder("[Publisher]"), plain(".")]);
      } else if (organization && sameName(organization, publisher)) {
        notes.push({ code: "publisher-omitted" });
      } else {
        elements.push([plain(publisher), plain(closing(publisher))]);
      }
      return [...elements, locator(source.doi, source.url, notes)];
    }

    case "journal-article": {
      const journal = source.journal.trim();
      const volume = (source.volume ?? "").trim();
      const issue = (source.issue ?? "").trim();
      const pages = formatPages(source.pages ?? "");
      const articleNumber = (source.articleNumber ?? "").trim();
      const runs: Run[] = [];
      if (journal) {
        runs.push(italic(journal));
      } else {
        notes.push({ code: "missing", field: "journal" });
        runs.push(placeholder("[Journal]"));
      }
      if (volume) runs.push(plain(", "), italic(volume));
      if (issue) runs.push(plain(`(${issue})`));
      if (pages) runs.push(plain(`, ${pages}`));
      else if (articleNumber) runs.push(plain(`, Article ${articleNumber}`));
      runs.push(plain("."));
      return [runs, locator(source.doi, source.url, notes)];
    }

    case "webpage": {
      const elements: Run[][] = [];
      const siteName = (source.siteName ?? "").trim();
      const organization = soleOrganization(authors);
      if (siteName && organization && sameName(organization, siteName)) {
        notes.push({ code: "site-name-omitted" });
      } else if (siteName) {
        elements.push([plain(siteName), plain(closing(siteName))]);
      }
      const url = source.url.trim();
      if (!url) {
        notes.push({ code: "missing", field: "url" });
        elements.push([placeholder("[URL]")]);
      } else if (!isWebAddress(url)) {
        notes.push({ code: "invalid-url" });
        elements.push([placeholder("[URL]")]);
      } else {
        elements.push([plain(url)]);
      }
      return elements;
    }
  }
}

/**
 * The title as it stands in for a missing author in text: italic, or in quotation
 * marks for articles. APA uses American punctuation, so a following comma goes
 * inside the closing quotation mark: ("Deep learning," 2015).
 */
function titleInText(source: Source, followedByComma: boolean): Run[] {
  const title = source.title.trim();
  if (!title) return [placeholder("[Title]"), plain(followedByComma ? "," : "")];
  if (source.type === "journal-article") return [plain(`“${title}${followedByComma ? "," : ""}”`)];
  return [italic(title), plain(followedByComma ? "," : "")];
}

function inTextNames(names: readonly string[], joiner: "&" | "and"): string {
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} ${joiner} ${names[1]}`;
  return `${names[0]} et al.`;
}

export function formatCitation(source: Source): Citation {
  const notes: Note[] = [];

  const authors = source.authors.filter((author) => !isBlank(author));
  const listed: Contributor[] = [];
  source.authors.forEach((author, index) => {
    if (isBlank(author)) return;
    if (referenceName(author) === null) notes.push({ code: "author-incomplete", position: index + 1 });
    else listed.push(author);
  });
  const names = listed.map((author) => referenceName(author) as string);
  if (names.length > MAX_LISTED_AUTHORS) notes.push({ code: "over-twenty-authors", count: names.length });

  const { label, year } = dateLabel(source, notes);
  const date: Run[] = [plain(`(${label}).`)];
  const title = titleElement(source, notes);

  const leading: Run[][] = [];
  if (names.length > 0) {
    const list = formatAuthorList(names);
    leading.push([plain(list + closing(list))], date, title);
  } else {
    notes.push({ code: "no-author" });
    leading.push(title, date);
  }

  const elements = [...leading, ...sourceElements(source, authors, notes)].filter((element) => element.length > 0);
  const reference = mergeRuns(elements.flatMap((element, index) => (index === 0 ? element : [plain(" "), ...element])));

  const citationNames = listed.map((author) => citationName(author) as string);
  const parenthetical =
    citationNames.length > 0
      ? [plain(`(${inTextNames(citationNames, "&")}, ${year})`)]
      : [plain("("), ...titleInText(source, true), plain(` ${year})`)];
  const narrative =
    citationNames.length > 0
      ? [plain(`${inTextNames(citationNames, "and")} (${year})`)]
      : [...titleInText(source, false), plain(` (${year})`)];

  return { reference, parenthetical: mergeRuns(parenthetical), narrative: mergeRuns(narrative), notes };
}
