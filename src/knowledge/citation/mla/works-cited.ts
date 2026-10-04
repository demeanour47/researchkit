/**
 * MLA 9 works-cited entries for books, journal articles and web pages.
 *
 * MLA builds every entry from the same core elements, in order, using only those
 * that apply: Author. Title of source. Title of container, Other contributors,
 * Version, Number, Publisher, Publication date, Location. Optional elements, such
 * as an access date, follow (MLA Handbook, 9th ed., ch. 5). Entries here
 * (italics marked *like this*):
 *
 *   Book     Author. *Title*. 2nd ed., Publisher, 2012, https://doi.org/….
 *   Article  Author. “Title.” *Journal*, vol. 43, no. 2, 2015, pp. 11–14, https://doi.org/….
 *   Web page Author. “Title.” *Site*, Publisher, 2 Mar. 2016, www.example.org/page. Accessed 4 Oct. 2026.
 *
 * Rules, with their sources on the MLA Style Center (style.mla.org):
 * - A work published by an organization that is also its author begins with the
 *   title, and the organization is given only as publisher. When the website has
 *   basically the same name, the author and publisher are both left out
 *   (/author-publisher-web-site-names/, /citing-mla-handbook-ninth-edition/).
 * - Without an author, the entry begins with the title (/source-with-no-author/).
 * - A self-contained work's title is italic; a work inside a container is in
 *   quotation marks, and the container is italic. With American punctuation, the
 *   full stop goes inside the closing quotation mark.
 * - Page numbers take "p." or "pp."; volume and issue take "vol." and "no."
 *   (/volume-issue-page-abbreviations/).
 * - A DOI is preferred to a URL and is written after https://doi.org/; a URL is
 *   written without http:// or https:// (/page-range-and-doi/, /urls-some-practical-advice/).
 * - Journals that number articles instead of paginating them: the article number is
 *   left out (/journals-with-article-numbers/).
 * - An access date is optional, and goes at the end (/access-dates/).
 * - Titles are not re-capitalised: MLA's title case has exceptions only the writer
 *   can judge, so the result asks the writer to check.
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
} from "../source";
import { formatMlaDate } from "./dates";
import { named, worksCitedAuthors, type NamedContributor } from "./names";
import type { Decision, Note } from "./notes";
import { formatMlaPages } from "./numbers";

/** What an entry begins with. In-text citations must begin with the same thing. */
export type Lead =
  | { kind: "authors"; authors: readonly NamedContributor[] }
  | { kind: "title"; title: string; italic: boolean };

export interface WorksCitedEntry {
  runs: Run[];
  lead: Lead;
  decisions: Decision[];
  notes: Note[];
}

/** Adds a full stop unless the text already ends with terminal punctuation. */
const closing = (text: string) => (endsWithTerminalPunctuation(text) ? "" : ".");

const sameName = (a: string, b: string) => a.trim().toLocaleLowerCase("en") === b.trim().toLocaleLowerCase("en");

/** A name typed in one field that looks like several names, or a name already inverted. */
const looksAmbiguous = (text: string) => /[,;&]|\s(?:and|et al\.?)\s/iu.test(` ${text} `);

const UNIVERSITY_PRESS = /\bUniversity Press\b/u;
const BUSINESS_WORDS = /\b(?:Inc|Co|Company|Corp|Corporation|Ltd|Limited|LLC)\b\.?/u;

function authorsOf(source: Source, notes: Note[]): NamedContributor[] {
  const listed: NamedContributor[] = [];
  source.authors.forEach((author, index) => {
    if (isBlank(author)) return;
    const name = named(author);
    if (!name) {
      notes.push({ code: "author-incomplete", position: index + 1 });
      return;
    }
    const typed = name.kind === "person" ? `${name.family} ${name.given}` : "";
    if (looksAmbiguous(typed)) notes.push({ code: "ambiguous-author", position: index + 1 });
    listed.push(name);
  });
  return listed;
}

/** Whether the sole author is an organization that MLA gives only as publisher or site. */
function omittedOrganization(source: Source, authors: readonly NamedContributor[]): "publisher" | "site" | null {
  const [only] = authors;
  if (authors.length !== 1 || only.kind !== "organization") return null;
  if (source.type === "book") return source.publisher && sameName(only.name, source.publisher) ? "publisher" : null;
  if (source.type === "webpage") {
    if (source.siteName && sameName(only.name, source.siteName)) return "site";
    if (source.publisher && sameName(only.name, source.publisher)) return "publisher";
  }
  return null;
}

function titleElement(source: Source, decisions: Decision[], notes: Note[]): Run[] {
  if (source.type === "book") decisions.push({ code: "standalone-title" });
  else if (source.type === "journal-article") decisions.push({ code: "title-in-container", container: "journal" });
  else if ((source.siteName ?? "").trim()) decisions.push({ code: "title-in-container", container: "website" });
  else decisions.push({ code: "no-container" });

  const title = source.title.trim();
  if (!title) {
    notes.push({ code: "missing", field: "title" });
    return [placeholder("[Title]"), plain(".")];
  }
  notes.push({ code: "check-title-case" });
  return source.type === "book" ? [italic(title), plain(closing(title))] : [plain(`“${title}${closing(title)}”`)];
}

function editionElement(edition: string | undefined, decisions: Decision[], notes: Note[]): Run[] | null {
  const text = (edition ?? "").trim();
  if (!text) return null;
  if (/^\d+$/u.test(text)) {
    const n = Number(text);
    if (n <= 1) {
      decisions.push({ code: "first-edition-omitted" });
      return null;
    }
    decisions.push({ code: "edition-shown" });
    return [plain(`${ordinal(n)} ed.`)];
  }
  notes.push({ code: "check-edition" });
  return [plain(text)];
}

function publisherElement(publisher: string, notes: Note[]): Run[] {
  if (UNIVERSITY_PRESS.test(publisher)) {
    notes.push({ code: "publisher-abbreviation", suggestion: publisher.replace(UNIVERSITY_PRESS, "UP") });
  } else if (BUSINESS_WORDS.test(publisher)) {
    notes.push({ code: "publisher-abbreviation", suggestion: null });
  }
  return [plain(publisher)];
}

function dateElement(source: Source, decisions: Decision[], notes: Note[]): Run[] | null {
  const date = formatMlaDate(source.date);
  if (date.problem) notes.push({ code: date.problem, date: "publication" });
  if (!date.text) {
    decisions.push({ code: "date-omitted" });
    notes.push({ code: "no-date", sourceType: source.type });
    return null;
  }
  if (source.date.month !== undefined && date.text !== String(source.date.year)) decisions.push({ code: "date-written", text: date.text });
  return [plain(date.text)];
}

/** A DOI if valid, otherwise a URL if valid, otherwise nothing. */
function locationElement(doi: string | undefined, url: string | undefined, decisions: Decision[], notes: Note[]): Run[] | null {
  const hasUrl = Boolean(url && url.trim());
  if (doi && doi.trim()) {
    const normalized = normalizeDoi(doi);
    if (normalized) {
      decisions.push({ code: "doi-used" });
      if (hasUrl) decisions.push({ code: "url-left-out-for-doi" });
      return [plain(normalized)];
    }
    notes.push({ code: "invalid-doi" });
  }
  if (url && hasUrl) {
    if (!isWebAddress(url)) {
      notes.push({ code: "invalid-url" });
      return null;
    }
    decisions.push({ code: "url-protocol-omitted" });
    return [plain(url.trim().replace(/^https?:\/\//iu, ""))];
  }
  return null;
}

/** The container and the elements after it, as comma-separated elements. */
function containerElements(source: Source, decisions: Decision[], notes: Note[]): Run[][] {
  const elements: (Run[] | null)[] = [];
  switch (source.type) {
    case "book": {
      elements.push(editionElement(source.edition, decisions, notes));
      const publisher = (source.publisher ?? "").trim();
      if (publisher) elements.push(publisherElement(publisher, notes));
      else notes.push({ code: "missing-recommended", field: "publisher" });
      elements.push(dateElement(source, decisions, notes));
      elements.push(locationElement(source.doi, source.url, decisions, notes));
      break;
    }

    case "journal-article": {
      const journal = source.journal.trim();
      if (journal) {
        elements.push([italic(journal)]);
      } else {
        notes.push({ code: "missing", field: "journal" });
        elements.push([placeholder("[Journal]")]);
      }
      const volume = (source.volume ?? "").trim();
      const issue = (source.issue ?? "").trim();
      const pages = (source.pages ?? "").trim();
      if (volume) elements.push([plain(`vol. ${volume}`)]);
      if (issue) elements.push([plain(`no. ${issue}`)]);
      if (!volume && !issue && !pages) notes.push({ code: "no-journal-numbers" });
      elements.push(dateElement(source, decisions, notes));
      if (pages) {
        const formatted = formatMlaPages(pages);
        if (formatted.shortened) decisions.push({ code: "pages-shortened", from: pages, to: formatted.text });
        elements.push([plain(`${formatted.range ? "pp." : "p."} ${formatted.text}`)]);
      }
      if ((source.articleNumber ?? "").trim()) decisions.push({ code: "article-number-omitted" });
      elements.push(locationElement(source.doi, source.url, decisions, notes));
      break;
    }

    case "webpage": {
      const siteName = (source.siteName ?? "").trim();
      const publisher = (source.publisher ?? "").trim();
      if (siteName) elements.push([italic(siteName)]);
      else notes.push({ code: "missing-recommended", field: "site-name" });
      if (publisher && siteName && sameName(publisher, siteName)) decisions.push({ code: "publisher-omitted-same-as-site" });
      else if (publisher) elements.push(publisherElement(publisher, notes));
      elements.push(dateElement(source, decisions, notes));
      if (source.url.trim()) elements.push(locationElement(undefined, source.url, decisions, notes));
      else notes.push({ code: "missing-recommended", field: "url" });
      break;
    }
  }
  return elements.filter((element): element is Run[] => element !== null && element.length > 0);
}

function accessElement(source: Source, decisions: Decision[], notes: Note[]): Run[] | null {
  if (source.type !== "webpage" || !source.accessed) return null;
  const accessed = formatMlaDate(source.accessed);
  if (accessed.problem) notes.push({ code: accessed.problem, date: "access" });
  if (!accessed.text) return null;
  decisions.push({ code: "access-date", text: accessed.text });
  return [plain(`Accessed ${accessed.text}.`)];
}

/** Joins elements with commas and closes the last with a full stop. */
function commaSeparated(elements: readonly Run[][]): Run[] {
  if (elements.length === 0) return [];
  const runs = elements.flatMap((element, index) => (index === 0 ? element : [plain(", "), ...element]));
  const last = runs[runs.length - 1];
  return [...runs, plain(last.placeholder ? "." : closing(last.text))];
}

export function formatWorksCited(source: Source): WorksCitedEntry {
  const decisions: Decision[] = [];
  const notes: Note[] = [];

  const authors = authorsOf(source, notes);
  const omitted = omittedOrganization(source, authors);
  const listed = omitted ? [] : authors;
  if (omitted) decisions.push({ code: "organization-omitted", as: omitted });

  const elements: Run[][] = [];
  if (listed.length > 0) {
    const names = worksCitedAuthors(listed);
    elements.push([plain(names + closing(names))]);
    const [first] = listed;
    if (first.kind === "organization") decisions.push({ code: "organization-author" });
    else if (first.given) decisions.push({ code: "first-author-inverted" });
    if (listed.length === 2) decisions.push({ code: "two-authors" });
    if (listed.length > 2) decisions.push({ code: "et-al", count: listed.length });
  } else {
    if (!omitted) notes.push({ code: "no-author" });
    decisions.push({ code: "title-first" });
  }

  elements.push(titleElement(source, decisions, notes));
  const container = commaSeparated(containerElements(source, decisions, notes));
  if (container.length > 0) elements.push(container);
  const accessed = accessElement(source, decisions, notes);
  if (accessed) elements.push(accessed);

  const lead: Lead =
    listed.length > 0 ? { kind: "authors", authors: listed } : { kind: "title", title: source.title.trim(), italic: source.type === "book" };

  return {
    runs: mergeRuns(elements.flatMap((element, index) => (index === 0 ? element : [plain(" "), ...element]))),
    lead,
    decisions,
    notes,
  };
}
