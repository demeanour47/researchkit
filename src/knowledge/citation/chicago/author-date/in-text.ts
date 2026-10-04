/**
 * Chicago author-date text citations (CMOS 18, 13.105–10; sample citations at
 * chicagomanualofstyle.org/tools_citationguide/citation-guide-2.html).
 *
 * - Parenthetical: author and year with no punctuation between them, then a comma
 *   and the locator: (Yu 2020, 45), (Binder and Kidder 2022, 117–18),
 *   (Snyder et al. 2025, 9–10), (Google 2023).
 * - Without a date, n.d. follows a comma, so it isn't read as part of the name:
 *   (OED, n.d.) (CMOS Q&A, "How would one cite something from the OED in author-date style?").
 * - Narrative: the name belongs to the sentence and the year, with any locator,
 *   goes in parentheses after it: Binder and Kidder (2022, 117–18) argue …
 * - Without an author, the title stands in, styled as in the reference list. Chicago
 *   shortens it to its first words, which needs judgment, so the full title is used
 *   and the writer is told.
 * - Page numbers take no "p."; ranges are shortened by Chicago's inclusive-number
 *   rules. Other locators (chapters, sections, paragraphs) take abbreviations that
 *   this generator doesn't format, so they are reported rather than guessed.
 */

import { italic, mergeRuns, placeholder, plain, type CitationLocator, type Run } from "../../source";
import { textAuthors } from "../names";
import { formatChicagoPages } from "../numbers";
import type { Decision, Note } from "./notes";
import type { Lead } from "./reference";

export interface ChicagoTextCitations {
  /** For example "(Dittmar and Schemske 2023, 480)". */
  parenthetical: Run[];
  /** For example "Dittmar and Schemske (2023, 480)", for the name to be part of the sentence. */
  narrative: Run[];
  decisions: Decision[];
  notes: Note[];
}

function locatorText(locator: CitationLocator | undefined, decisions: Decision[], notes: Note[]): string | null {
  const value = locator?.value.trim() ?? "";
  if (!locator || !value) {
    decisions.push({ code: "text-no-locator" });
    return null;
  }
  if (locator.kind === "paragraph" || locator.kind === "section") {
    notes.push({ code: "unsupported-locator", kind: locator.kind });
    return null;
  }
  const pages = formatChicagoPages(value);
  if (locator.kind === "page-range" && !pages.range) notes.push({ code: "incomplete-locator" });
  if (pages.shortened) decisions.push({ code: "pages-shortened", from: value, to: pages.text });
  decisions.push({ code: "text-page" });
  return pages.text;
}

/** The title in the author's place. A comma that follows a quoted title goes inside the closing quotation mark. */
const titleRuns = (lead: Extract<Lead, { kind: "title" }>, comma: boolean): Run[] => {
  if (!lead.title) return [placeholder("[Title]"), plain(comma ? "," : "")];
  return lead.italic ? [italic(lead.title), plain(comma ? "," : "")] : [plain(`“${lead.title}${comma ? "," : ""}”`)];
};

export function formatChicagoTextCitations(lead: Lead, year: number | null, locator?: CitationLocator): ChicagoTextCitations {
  const decisions: Decision[] = [];
  const notes: Note[] = [];
  const located = locatorText(locator, decisions, notes);

  const undated = year === null;
  if (undated) decisions.push({ code: "text-no-date-comma" });
  let name: Run[];
  let parentheticalName: Run[];
  if (lead.kind === "title") {
    decisions.push({ code: "text-title" });
    notes.push({ code: "shorten-title" });
    name = titleRuns(lead, false);
    parentheticalName = titleRuns(lead, undated);
  } else {
    if (lead.authors.length > 2) decisions.push({ code: "text-et-al" });
    name = [plain(textAuthors(lead.authors))];
    parentheticalName = [...name, plain(undated ? "," : "")];
  }

  const dateAndLocator = `${undated ? "n.d." : String(year)}${located ? `, ${located}` : ""}`;

  return {
    parenthetical: mergeRuns([plain("("), ...parentheticalName, plain(` ${dateAndLocator})`)]),
    narrative: mergeRuns([...name, plain(` (${dateAndLocator})`)]),
    decisions,
    notes,
  };
}
