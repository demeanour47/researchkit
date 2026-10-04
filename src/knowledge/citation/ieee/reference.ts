/**
 * IEEE reference entries, following the IEEE Reference Guide, v. 3.28.2025
 * (IEEE Publication Operations). The entry's number is not part of the source and is
 * added by numberedReference. Italics marked *like this*:
 *
 *   Book        B. Klaus and P. Horn, *Robot Vision*. Cambridge, MA, USA: MIT Press, 1986.
 *   Journal     M. M. Chiampi and L. L. Zilberti, “Induction of electric field . . . ,” *IEEE Trans. Biomed. Eng.*,
 *               vol. 58, no. 10, pp. 2787–2793, Oct. 2011, doi: 10.1109/TBME.2011.2158315.
 *   Conference  L. S. Carmichael et al., “Characterization and comparison . . . ,” in *Proc. 37th Southeastern Symp.
 *               Syst. Theory (SSST 2005)*, Tuskegee, AL, USA, Mar. 2005, pp. 124–129.
 *   Web page    J. Smith. “Obama inaugurated as President.” CNN.com. Accessed: Feb. 1, 2009. [Online]. Available: URL
 *
 * - Every reference ends with a period except one ending with a URL. A DOI is written
 *   “doi: 10.xxx”; when a reference has a DOI and a URL, the DOI comes first and the
 *   URL follows “[Online]. Available:”.
 * - Page ranges are given in full: pp. 2787–2793.
 * - Without a date, “(n.d.)” goes where the date would be, preceded and followed by periods.
 * - Journal and conference names are used as entered: IEEE abbreviates them from its
 *   own lists, which ResearchKit does not apply.
 */

import { endsWithTerminalPunctuation, formatPages, italic, mergeRuns, nameableAuthors, normalizeDoi, isWebAddress, ordinal, placeholder, plain, type AnySource, type Run } from "../source";
import { ieeeDate } from "./dates";
import { MAX_LISTED_AUTHORS, referenceAuthors } from "./names";
import type { Decision, Note } from "./notes";

export interface IeeeReference {
  /** The entry without its number. */
  runs: Run[];
  decisions: Decision[];
  notes: Note[];
}

const closing = (text: string) => (endsWithTerminalPunctuation(text) ? "" : ".");

interface Location {
  doi: string | null;
  url: string | null;
}

/** A valid DOI and a valid URL; IEEE gives both when both exist. */
function locationOf(doi: string | undefined, url: string | undefined, decisions: Decision[], notes: Note[]): Location {
  let normalized: string | null = null;
  if (doi && doi.trim()) {
    const link = normalizeDoi(doi);
    if (link) normalized = link.replace("https://doi.org/", "");
    else notes.push({ code: "invalid-doi" });
  }
  let address: string | null = null;
  const typed = (url ?? "").trim();
  if (typed) {
    if (isWebAddress(typed)) address = typed;
    else notes.push({ code: "invalid-url" });
  }
  if (normalized) decisions.push({ code: "doi-prefix" });
  if (normalized && address) decisions.push({ code: "doi-and-url" });
  else if (address) decisions.push({ code: "url-online" });
  return { doi: normalized, url: address };
}

/** The end of a reference: “, doi: …”, the closing period, then any URL, which has no period after it. */
function ending(location: Location): Run[] {
  return [plain(`${location.doi ? `, doi: ${location.doi}` : ""}.`), ...(location.url ? [plain(` [Online]. Available: ${location.url}`)] : [])];
}

/** Publication details that stop at the date: “Cambridge, MA, USA: MIT Press, 1986”, or “MIT Press. (n.d.)”. */
function withDate(parts: readonly string[], date: string | null): string {
  const before = parts.filter(Boolean).join(", ");
  if (date) return [before, date].filter(Boolean).join(", ");
  return before ? `${before}. (n.d.)` : "(n.d.)";
}

function dateText(source: AnySource, decisions: Decision[], notes: Note[]): string | null {
  const date = ieeeDate(source.date);
  if (date.problem) notes.push({ code: date.problem, date: "publication" });
  if (!date.text) {
    notes.push({ code: "missing-year", sourceType: source.type });
    if (source.type !== "webpage") decisions.push({ code: "no-date" });
  } else if (source.date.month !== undefined && date.text !== String(source.date.year)) {
    decisions.push({ code: "month-abbreviated", text: date.text });
  }
  return date.text;
}

function pagesText(pages: string, decisions: Decision[]): string {
  const text = formatPages(pages);
  if (text.includes("–")) decisions.push({ code: "page-range-full" });
  return `${text.includes("–") ? "pp." : "p."} ${text}`;
}

/** The title in quotation marks, followed by a comma inside them, even after a question mark (“display?,”). */
const quotedWithComma = (title: string): Run[] => (title ? [plain(`“${title},”`)] : [placeholder("[Title]"), plain(",")]);

export function formatIeeeReference(source: AnySource): IeeeReference {
  const decisions: Decision[] = [{ code: "number-from-citation-order" }];
  const notes: Note[] = [];
  const { authors, problems } = nameableAuthors(source.authors);
  notes.push(...problems);
  const title = source.title.trim();
  if (!title) notes.push({ code: "missing-title" });
  else notes.push({ code: "check-title-case" });

  const names = referenceAuthors(authors);
  if (authors.length === 0) {
    notes.push({ code: "no-author" });
    decisions.push({ code: "title-first" });
  } else {
    if (authors[0].kind === "organization" && authors.length === 1) decisions.push({ code: "organization-author" });
    if (authors.some((author) => author.kind === "person")) decisions.push({ code: "initials-first" });
    if (authors.length > MAX_LISTED_AUTHORS) decisions.push({ code: "authors-shortened", count: authors.length });
    else if (authors.length > 1) decisions.push({ code: "authors-listed", count: authors.length });
  }
  const date = dateText(source, decisions, notes);
  let runs: Run[];

  switch (source.type) {
    case "book": {
      decisions.push({ code: "book-title-italic" });
      const edition = (source.edition ?? "").trim();
      let editionText = "";
      if (/^\d+$/u.test(edition) && Number(edition) > 1) {
        editionText = `, ${ordinal(Number(edition))} ed.`;
        decisions.push({ code: "edition-shown" });
      } else if (edition && !/^\d+$/u.test(edition)) {
        editionText = `, ${edition}`;
        notes.push({ code: "check-edition" });
      }
      const place = (source.place ?? "").trim();
      const publisher = (source.publisher ?? "").trim();
      if (!publisher) notes.push({ code: "missing-publisher" });
      if (!place) notes.push({ code: "missing-place" });
      if (place && publisher) decisions.push({ code: "place-and-publisher" });
      const published = withDate([place && publisher ? `${place}: ${publisher}` : publisher || place], date);
      const titleRuns: Run[] = title ? [italic(title)] : [placeholder("[Title]")];
      const afterTitle = editionText ? `${editionText}${closing(editionText)}` : title ? closing(title) : ".";
      const location = locationOf(source.doi, source.url, decisions, notes);
      runs = [...(names ? [plain(`${names}, `)] : []), ...titleRuns, plain(`${afterTitle} ${published}`), ...ending(location)];
      break;
    }

    case "journal-article": {
      decisions.push({ code: "article-title-quoted" });
      const journal = source.journal.trim();
      if (!journal) notes.push({ code: "missing-journal" });
      else notes.push({ code: "abbreviation-not-applied", container: "journal" });
      const volume = (source.volume ?? "").trim();
      const issue = (source.issue ?? "").trim();
      const pages = (source.pages ?? "").trim();
      const articleNumber = (source.articleNumber ?? "").trim();
      if (!volume) notes.push({ code: "incomplete-journal", missing: "volume" });
      if (!issue) notes.push({ code: "incomplete-journal", missing: "issue" });
      if (!pages && !articleNumber) notes.push({ code: "incomplete-journal", missing: "pages" });
      if (volume || issue) decisions.push({ code: "journal-numbers" });
      const numbers = [volume && `vol. ${volume}`, issue && `no. ${issue}`, pages && pagesText(pages, decisions)].filter(Boolean) as string[];
      if (!pages && articleNumber) decisions.push({ code: "article-number" });
      const afterDate = !pages && articleNumber ? `, Art. no. ${articleNumber}` : "";
      const location = locationOf(source.doi, source.url, decisions, notes);
      runs = [
        ...(names ? [plain(`${names}, `)] : []),
        ...quotedWithComma(title),
        plain(" "),
        ...(journal ? [italic(journal)] : [placeholder("[Journal]")]),
        plain(`, ${withDate(numbers, date)}${afterDate}`),
        ...ending(location),
      ];
      break;
    }

    case "conference-paper": {
      decisions.push({ code: "article-title-quoted" }, { code: "conference-in-proceedings" });
      const proceedings = source.proceedings.trim();
      if (!proceedings) notes.push({ code: "missing-proceedings" });
      else notes.push({ code: "abbreviation-not-applied", container: "conference" });
      const place = (source.location ?? "").trim();
      const pages = (source.pages ?? "").trim();
      if (!place) notes.push({ code: "incomplete-conference", missing: "location" });
      if (!pages) notes.push({ code: "incomplete-conference", missing: "pages" });
      const details = withDate([place], date);
      const location = locationOf(source.doi, source.url, decisions, notes);
      runs = [
        ...(names ? [plain(`${names}, `)] : []),
        ...quotedWithComma(title),
        plain(" in "),
        ...(proceedings ? [italic(proceedings)] : [placeholder("[Proceedings]")]),
        plain(`, ${details}${pages ? `, ${pagesText(pages, decisions)}` : ""}`),
        ...ending(location),
      ];
      break;
    }

    case "webpage": {
      decisions.push({ code: "web-elements-periods" });
      const site = (source.siteName ?? "").trim();
      if (!site) notes.push({ code: "missing-site-name" });
      const accessed = ieeeDate(source.accessed);
      if (accessed.problem) notes.push({ code: accessed.problem, date: "access" });
      let dateElement: string;
      if (accessed.text) {
        dateElement = `Accessed: ${accessed.text}.`;
        decisions.push({ code: "access-date", text: accessed.text });
        if (date) notes.push({ code: "publication-date-not-shown" });
      } else {
        notes.push({ code: "missing-access-date" });
        dateElement = date ? `${date}.` : "(n.d.).";
      }
      const url = source.url.trim();
      let online: Run[] = [];
      if (!url) notes.push({ code: "missing-url" });
      else if (!isWebAddress(url)) notes.push({ code: "invalid-url" });
      else {
        decisions.push({ code: "url-online" });
        online = [plain(` [Online]. Available: ${url}`)];
      }
      const lead = names ? [plain(`${names}${closing(names)} `)] : [];
      const titleRuns: Run[] = title ? [plain(`“${title}${closing(title)}” `)] : [placeholder("[Title]"), plain(". ")];
      runs = [...lead, ...titleRuns, plain(`${site ? `${site}${closing(site)} ` : ""}${dateElement}`), ...online];
      break;
    }
  }

  return { runs: mergeRuns(runs), decisions, notes };
}

/** The entry with its number, “[1] ”, set before it. The number comes from the citation, not the source. */
export function numberedReference(number: number, runs: readonly Run[]): Run[] {
  return mergeRuns([plain(`[${number}] `), ...runs]);
}
