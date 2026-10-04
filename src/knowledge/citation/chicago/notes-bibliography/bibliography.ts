/**
 * Chicago bibliography entries (notes-and-bibliography system), following the CMOS
 * 18 sample citations (chicagomanualofstyle.org/tools_citationguide/citation-guide-1.html).
 * Italics marked *like this*:
 *
 *   Book      Yu, Charles. *Interior Chinatown*. Pantheon Books, 2020.
 *             Borel, Brooke. *The Chicago Guide to Fact-Checking*. 2nd ed. University of Chicago Press, 2023.
 *   Article   Kwon, Hyeyoung. “Inclusion Work: . . .” *American Journal of Sociology* 127, no. 6 (2022): 1818–59. https://doi.org/10.1086/720277.
 *   Web page  Google. “Privacy Policy.” Privacy & Terms. Effective November 15, 2023. https://policies.google.com/privacy.
 *             Yale University. “About Yale: Yale Facts.” Accessed March 8, 2022. https://www.yale.edu/about-yale/yale-facts.
 *
 * Unlike an author-date reference, the year comes at the end of the publication
 * details. A place of publication is no longer required (CMOS 14.30). A web page is
 * listed under its owner or sponsor when no person is its author (CMOS sample note),
 * and has no n.d.: without a date, an access date is given.
 */

import { endsWithTerminalPunctuation, italic, mergeRuns, placeholder, plain, type Run, type Source } from "../../source";
import { MAX_LISTED_AUTHORS, listAuthors } from "../names";
import { formatChicagoPages } from "../numbers";
import { chicagoEdition, sameName, soleOrganization } from "../source-parts";
import { analyse, type Analysis } from "./analysis";
import type { Decision, Note } from "./notes";

export interface ChicagoBibliographyEntry {
  runs: Run[];
  decisions: Decision[];
  notes: Note[];
}

const closing = (text: string) => (endsWithTerminalPunctuation(text) ? "" : ".");
const sentence = (text: string): Run[] => [plain(text + closing(text))];

function titleElement(analysis: Analysis): Run[] {
  const { title, source } = analysis;
  if (!title) return [placeholder("[Title]"), plain(".")];
  return source.type === "book" ? [italic(title), plain(closing(title))] : [plain(`“${title}${closing(title)}”`)];
}

function bookElements(analysis: Analysis, source: Extract<Source, { type: "book" }>, decisions: Decision[], notes: Note[]): Run[][] {
  const elements: Run[][] = [];
  const edition = chicagoEdition(source.edition);
  if (edition.kind === "numbered") {
    decisions.push({ code: "edition-shown" });
    elements.push(sentence(edition.label));
  } else if (edition.kind === "first") {
    decisions.push({ code: "first-edition-omitted" });
  } else if (edition.kind === "as-typed") {
    notes.push({ code: "check-edition" });
    elements.push(sentence(edition.label));
  }
  const publisher = (source.publisher ?? "").trim();
  if (!publisher) notes.push({ code: "missing-publisher" });
  else {
    const organization = soleOrganization(analysis.authors);
    if (organization && sameName(organization, publisher)) notes.push({ code: "organization-also-publisher" });
  }
  decisions.push({ code: "no-place-of-publication" });
  elements.push(sentence(publisher ? `${publisher}, ${analysis.year}` : analysis.year));
  return elements;
}

/** “202, no. 4 (2023)”: the numbers and year Chicago gives after a journal title. */
export function journalNumbers(volume: string, issue: string, year: string): string {
  if (volume) return ` ${volume}${issue ? `, no. ${issue}` : ""} (${year})`;
  if (issue) return `, no. ${issue} (${year})`;
  return ` (${year})`;
}

function journalElements(analysis: Analysis, source: Extract<Source, { type: "journal-article" }>, decisions: Decision[], notes: Note[]): Run[][] {
  const journal = source.journal.trim();
  const volume = (source.volume ?? "").trim();
  const issue = (source.issue ?? "").trim();
  const pages = (source.pages ?? "").trim();
  const articleNumber = (source.articleNumber ?? "").trim();
  const runs: Run[] = journal ? [italic(journal)] : [placeholder("[Journal]")];
  if (!journal) notes.push({ code: "missing-journal" });
  runs.push(plain(journalNumbers(volume, issue, analysis.year)));
  if (volume || issue) decisions.push({ code: "journal-numbers" });

  let location = "";
  if (pages) {
    const formatted = formatChicagoPages(pages);
    if (formatted.shortened) decisions.push({ code: "pages-shortened", from: pages, to: formatted.text });
    decisions.push({ code: "article-page-range" });
    location = formatted.text;
    if (articleNumber) notes.push({ code: "article-number-not-shown" });
  } else if (articleNumber) {
    decisions.push({ code: "article-id" });
    location = articleNumber;
  }
  runs.push(plain(`${location ? `: ${location}` : ""}.`));

  if (!volume && !issue && !location) notes.push({ code: "incomplete-journal", missing: "numbers" });
  else if (!volume) notes.push({ code: "incomplete-journal", missing: "volume" });
  else if (!location) notes.push({ code: "incomplete-journal", missing: "pages" });
  return [runs];
}

function webElements(analysis: Analysis): Run[][] {
  const elements: Run[][] = [];
  if (analysis.siteName) elements.push(sentence(analysis.siteName));
  if (analysis.webDate) elements.push(sentence(analysis.webDate));
  else if (analysis.accessed) elements.push(sentence(`Accessed ${analysis.accessed}`));
  return elements;
}

/** The bibliography entry, from the source alone: a bibliography lists works, not citations. */
export function formatChicagoBibliography(source: Source, analysis: Analysis = analyse(source)): ChicagoBibliographyEntry {
  const decisions: Decision[] = [...analysis.decisions];
  const notes: Note[] = [...analysis.notes];
  const elements: Run[][] = [];

  const { authors } = analysis;
  if (authors.length > 0) {
    const [first] = authors;
    if (first.kind === "organization") decisions.push({ code: "organization-author" });
    else if (first.given) decisions.push({ code: "bibliography-first-inverted" });
    if (authors.length > MAX_LISTED_AUTHORS) decisions.push({ code: "bibliography-authors-shortened", count: authors.length });
    else if (authors.length > 1) decisions.push({ code: "bibliography-authors-listed", count: authors.length });
    elements.push(sentence(listAuthors(authors)));
  } else if (source.type === "webpage" && analysis.owner) {
    elements.push(sentence(analysis.owner));
  } else {
    decisions.push({ code: "title-first" });
  }

  decisions.push({ code: source.type === "book" ? "book-title-italic" : source.type === "journal-article" ? "article-title-quoted" : "page-title-quoted" });
  elements.push(titleElement(analysis));

  if (source.type === "book") elements.push(...bookElements(analysis, source, decisions, notes));
  else if (source.type === "journal-article") elements.push(...journalElements(analysis, source, decisions, notes));
  else elements.push(...webElements(analysis));

  if (analysis.location.location) elements.push(sentence(analysis.location.location.text));

  return {
    runs: mergeRuns(elements.flatMap((element, index) => (index === 0 ? element : [plain(" "), ...element]))),
    decisions,
    notes,
  };
}
