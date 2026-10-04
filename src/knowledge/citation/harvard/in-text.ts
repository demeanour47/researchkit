/**
 * Harvard in-text citations in ResearchKit's Harvard profile (Cite Them Right, 13th
 * edition, as university library guides reproduce it):
 *
 * - Parenthetical: author, comma, year, and a page after a further comma:
 *   (Smith, 2015, p. 23), (Hughes and Ali, 2022, p. 6), (Lloyd, Singh and Alonso, 2018),
 *   (Gerrard et al., 2005, p. 8), (University of Wolverhampton, 2015).
 * - Narrative: the name is part of the sentence and the year, with any page, follows
 *   in brackets: Smith (2015, p. 23) argues …
 * - Without a date, "no date" stands in for the year: (Cool Antarctica, no date).
 * - Without an author, the title stands in, styled as in the reference list. Guides
 *   agree that the title replaces the author; how an article title is styled in the
 *   text varies, and the researcher is told.
 * - Pages take "p." or "pp.". Other locators aren't formatted, because the profile's
 *   sources don't define them, so they are reported rather than guessed.
 */

import { formatPages, italic, mergeRuns, placeholder, plain, type CitationLocator, type Run } from "../source";
import { MAX_TEXT_AUTHORS, textAuthors } from "./names";
import type { Decision, Note } from "./notes";
import type { Lead } from "./reference";

export interface HarvardTextCitations {
  /** For example "(Hughes and Ali, 2022, p. 6)". */
  parenthetical: Run[];
  /** For example "Hughes and Ali (2022, p. 6)", for the names to be part of the sentence. */
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
  const pages = formatPages(value);
  const range = pages.includes("–");
  if (locator.kind === "page-range" && !range) notes.push({ code: "incomplete-locator" });
  decisions.push({ code: range ? "text-pages" : "text-page" });
  return `${range ? "pp." : "p."} ${pages}`;
}

const titleRuns = (lead: Extract<Lead, { kind: "title" }>): Run[] => {
  if (!lead.title) return lead.style === "quoted" ? [plain("‘"), placeholder("[Title]"), plain("’")] : [placeholder("[Title]")];
  return lead.style === "quoted" ? [plain(`‘${lead.title}’`)] : [italic(lead.title)];
};

/** Text citations that name what the reference begins with, and its date exactly as the reference gives it. */
export function formatHarvardTextCitations(lead: Lead, date: string, locator?: CitationLocator): HarvardTextCitations {
  const decisions: Decision[] = [];
  const notes: Note[] = [];
  const located = locatorText(locator, decisions, notes);
  if (date === "no date") decisions.push({ code: "text-no-date" });

  let name: Run[];
  if (lead.kind === "title") {
    decisions.push({ code: "text-title" });
    notes.push({ code: "text-title-variant" });
    name = titleRuns(lead);
  } else {
    if (lead.authors.length > MAX_TEXT_AUTHORS) decisions.push({ code: "text-et-al" });
    else if (lead.authors.length > 1) decisions.push({ code: "text-all-named", count: lead.authors.length });
    name = [plain(textAuthors(lead.authors))];
  }

  const dateAndLocator = located ? `${date}, ${located}` : date;
  return {
    parenthetical: mergeRuns([plain("("), ...name, plain(`, ${dateAndLocator})`)]),
    narrative: mergeRuns([...name, plain(` (${dateAndLocator})`)]),
    decisions,
    notes,
  };
}
