/**
 * MLA 9 in-text citations.
 *
 * An in-text citation begins with the first item of the works-cited entry, usually
 * the author, and adds a page number directly, with no "p." and no comma: (Baron 194)
 * (style.mla.org/in-text-citations-overview/). There is no date. Without a page
 * number the citation is the name alone: (Baron).
 *
 * - Two authors: (Smith and Jones 24). Three or more: (Smith et al. 24).
 * - Without an author, the title stands in, styled as in the entry: ("Homily" 97)
 *   (style.mla.org/source-with-no-author/). MLA shortens a long title to at least its
 *   first noun, which needs judgment, so the full title is used and the writer is
 *   told how to shorten it (style.mla.org/shortening-a-long-title/).
 * - Paragraph numbers take "par." or "pars." after a comma: (Chan, par. 41)
 *   (style.mla.org/paragraph-numbers-in-shakespeare/).
 * - Section locators are not formatted: their MLA form could not be confirmed
 *   against the MLA's own guidance, so they are reported rather than guessed.
 *
 * In running text the name goes in the sentence and the locator in parentheses at
 * its end: Baron argues … (194). Et al. is kept for parenthetical citations; prose
 * uses "and others".
 */

import { italic, mergeRuns, placeholder, plain, type CitationLocator, type Run } from "../source";
import { parentheticalAuthors, proseAuthors } from "./names";
import type { Decision, Note } from "./notes";
import { formatMlaPages } from "./numbers";
import type { Lead } from "./works-cited";

/** A citation for running text: the name for the sentence, and the locator to close it. */
export interface MlaNarrative {
  /** The first time the work is mentioned: authors' full names, or the title. */
  firstMention: Run[];
  /** Later mentions: surnames, or the title. */
  laterMentions: Run[];
  /** The locator in parentheses, for the end of the sentence, or null without one. */
  locator: Run[] | null;
}

export interface MlaInText {
  parenthetical: Run[];
  narrative: MlaNarrative;
  decisions: Decision[];
  notes: Note[];
}

/** The locator and what separates it from a name: a space before a page, a comma before "par.". */
function locatorText(locator: CitationLocator | undefined, decisions: Decision[], notes: Note[]): { text: string; separator: string } | null {
  const value = locator?.value.trim() ?? "";
  if (!locator || !value) {
    decisions.push({ code: "in-text-no-locator" });
    return null;
  }
  if (locator.kind === "section") {
    notes.push({ code: "unsupported-locator", kind: "section" });
    return null;
  }
  const pages = formatMlaPages(value);
  if (locator.kind === "paragraph") {
    decisions.push({ code: "in-text-paragraph" });
    return { text: `${pages.range ? "pars." : "par."} ${pages.text}`, separator: ", " };
  }
  decisions.push({ code: "in-text-page" });
  if (pages.shortened) decisions.push({ code: "pages-shortened", from: value, to: pages.text });
  return { text: pages.text, separator: " " };
}

const titleRuns = (lead: Extract<Lead, { kind: "title" }>): Run[] =>
  !lead.title ? [placeholder("[Title]")] : lead.italic ? [italic(lead.title)] : [plain(`“${lead.title}”`)];

export function formatInText(lead: Lead, locator?: CitationLocator): MlaInText {
  const decisions: Decision[] = [];
  const notes: Note[] = [];
  const located = locatorText(locator, decisions, notes);
  const tail = located ? [plain(`${located.separator}${located.text}`)] : [];
  const narrativeLocator = located ? [plain(`(${located.text})`)] : null;

  if (lead.kind === "title") {
    decisions.push({ code: "in-text-title" });
    const title = titleRuns(lead);
    return {
      parenthetical: mergeRuns([plain("("), ...title, ...tail, plain(")")]),
      narrative: { firstMention: title, laterMentions: title, locator: narrativeLocator },
      decisions,
      notes,
    };
  }

  if (lead.authors.length > 2) decisions.push({ code: "in-text-et-al" }, { code: "prose-and-others" });
  const prose = proseAuthors(lead.authors);
  return {
    parenthetical: mergeRuns([plain(`(${parentheticalAuthors(lead.authors)}`), ...tail, plain(")")]),
    narrative: { firstMention: [plain(prose.first)], laterMentions: [plain(prose.later)], locator: narrativeLocator },
    decisions,
    notes,
  };
}
