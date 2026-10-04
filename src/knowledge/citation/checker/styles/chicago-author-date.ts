/**
 * Chicago author-date checks (CMOS 18), against the form ResearchKit's Chicago
 * author-date generator produces:
 *
 *   Yu, Charles. 2020. Interior Chinatown. Pantheon Books.
 *   Dittmar, Emily L., and Douglas W. Schemske. 2023. “Temporal Variation …” American Naturalist 202 (4): 471–85. https://doi.org/10.1086/725865.
 *
 * Citations: (Yu 2020, 45), Binder and Kidder (2022, 117–18), (OED, n.d.).
 * Notes and bibliography is a separate system with its own checker.
 */

import type { Source } from "../../source";
import { readNarrative, readParenthetical, uncertainCitation, unreadYearGroups, type AuthorDateCitation, type AuthorDateGrammar } from "../author-date";
import { ENTRY_FORM_NAMES, clean, entryForm, invertedFirstNames, numericCitationCount, quotedTitle } from "../features";
import { issue } from "../issue";
import { checkLinks } from "../links";
import { checkAlphabeticalOrder, checkYearLetters } from "../list";
import type { CitationScan, DetectedSourceType, ParsedReference, ReferenceCheckIssue, ReferenceEntry, StyleChecker } from "../types";

const STYLE = "Chicago author-date";
/** The year between full stops after the author, or after a quoted title when there is no author. */
const YEAR = /[.”"]\s((?:1[5-9]|20)\d\d[a-z]?(?=\.)|n\.d(?=\.)|forthcoming(?=\.))\.\s/u;

/** A later author inverted, as in "Binder, Amy J., and Kidder, Jeffrey L.": Chicago and MLA invert only the first. */
export const LATER_AUTHOR_INVERTED = /,\s+and\s+\p{Lu}[\p{L}'’-]+,\s/u;

/** The APA arrangement of journal numbers: 202(4), 471–485. */
export const APA_JOURNAL_NUMBERS = /\b\d+\(\w+\),\s*\d/u;

function parseEntry(entry: ReferenceEntry): ParsedReference {
  const { index, originalText, text } = entry;
  const issues: ReferenceCheckIssue[] = [];
  const base = { index, originalText, ...(entry.label ? { label: entry.label } : {}) };
  if (entry.label) issues.push(issue("style-mismatch", "warning", "This appears to use numeric citation formatting rather than Chicago author–date formatting.", "A Chicago reference list is alphabetical and unnumbered.", "Remove the numbers if you are using Chicago author-date, or choose the style your list follows.", entry.label.raw));

  const year = YEAR.exec(text);
  if (!year || year.index === undefined) {
    issues.push(issue("parse-warning", "warning", "The year after the author could not be found.", `${STYLE} gives the year straight after the author, between full stops: Yu, Charles. 2020.`, "Check the entry's opening against the source."));
    const form = entryForm(text);
    if (form && form !== "author-period-year") issues.push(issue("style-mismatch", "warning", "Reference may be formatted using a different citation style.", `This entry appears to use ${ENTRY_FORM_NAMES[form]}. ${STYLE} writes Yu, Charles. 2020. Interior Chinatown.`, "Check which style your list should follow, and choose it above or reformat the entry.", text));
    return { ...base, sourceType: "unknown", confidence: "unable", issues };
  }

  const lead = text.slice(0, year.index + 1).replace(/\.$/u, "");
  const undated = year[1] === "n.d";
  const rest = text.slice(year.index + year[0].length);
  const titleFirst = /^[“"‘]/u.test(lead);
  const names = titleFirst ? { names: [clean(lead.replace(/^[“"‘]|[.,]?[”"’]$/gu, ""))], etAl: false } : invertedFirstNames(lead);
  if (!titleFirst) {
    if (/\s&\s/u.test(lead)) issues.push(issue("author-format", "warning", "Authors are joined with “&”.", "Chicago joins the last two authors with “and”: Binder, Amy J., and Jeffrey L. Kidder.", "Replace “&” with “and”.", lead));
    if (LATER_AUTHOR_INVERTED.test(lead)) issues.push(issue("author-format", "warning", "A later author's name appears inverted.", "Chicago inverts only the first author's name, for alphabetizing; later authors keep normal order: Binder, Amy J., and Jeffrey L. Kidder.", "Write every author after the first given names first.", lead));
  }

  const links = checkLinks(rest, { style: STYLE, doi: "link", bareUrls: false });
  issues.push(...links.issues);
  const quoted = quotedTitle(rest);
  const articleLike = quoted !== null && quoted.index === 0;
  const title = titleFirst ? names.names[0] : articleLike ? quoted.title : clean((/^(.+?[.?!])(?=\s|$)/u.exec(rest)?.[1] ?? rest).replace(/\.$/u, ""));
  if (articleLike && quoted.quotes === "single") issues.push(issue("title-format", "warning", "The title is in single quotation marks.", "Chicago puts article and web page titles in double quotation marks: “Temporal Variation …”", "Use double quotation marks.", `‘${quoted.title}’`));
  if (APA_JOURNAL_NUMBERS.test(rest)) issues.push(issue("journal-structure", "warning", "Journal numbers appear in APA's arrangement.", `${STYLE} writes the volume, the issue in brackets after a space, then a colon and the pages: 202 (4): 471–85.`, "Rearrange the volume, issue and pages.", APA_JOURNAL_NUMBERS.exec(rest)?.[0]));
  const accessedDayFirst = /Accessed\s+\d{1,2}\s+\p{Lu}\p{Ll}+\s+\d{4}/u.exec(rest);
  if (accessedDayFirst) issues.push(issue("date-format", "information", "The access date is written day first.", "Chicago writes dates month first: Accessed March 8, 2022.", "Write the month before the day.", accessedDayFirst[0]));
  if (undated && links.url?.valid && !/Accessed\s/u.test(rest)) issues.push(issue("date-format", "information", "An undated web source has no access date.", "When web content shows no date, Chicago adds the date you accessed it.", "Add Accessed and the date before the URL.", links.url.raw));
  if (!title) issues.push(issue("missing-metadata", "error", "A title could not be identified.", "Every Chicago reference identifies the work by its title.", "Check the entry and add the title."));

  const sourceType: DetectedSourceType = /\b\d+\s*(?:\(\w+\))?:\s*[\dA-Za-z]/u.test(rest) || APA_JOURNAL_NUMBERS.test(rest) ? "journal-article" : articleLike && links.url ? "webpage" : "book";
  const yearText = /^\d/u.test(year[1]) ? year[1] : null;
  const date = { year: yearText ? Number(yearText.slice(0, 4)) : undefined };
  const authors = titleFirst ? [] : names.names.map((name) => ({ kind: "organization" as const, name }));
  const source: Source =
    sourceType === "journal-article"
      ? { type: "journal-article", authors, date, title, journal: "", doi: links.doi?.normalized ?? undefined, url: links.url?.raw }
      : sourceType === "webpage"
        ? { type: "webpage", authors, date, title, url: links.url?.raw ?? "" }
        : { type: "book", authors, date, title, doi: links.doi?.normalized ?? undefined, url: links.url?.raw };
  return { ...base, sourceType, confidence: title && names.names.length ? "high" : "partial", source, key: { names: names.names, etAl: names.etAl, year: yearText, title, number: null }, issues };
}

function checkList(references: readonly ParsedReference[]): void {
  checkAlphabeticalOrder(references, { explanation: "A Chicago reference list is in alphabetical order by the first author's family name, or the title when there is no author; one author's works go by year, earliest first.", sameAuthorByYear: true });
  checkYearLetters(references, "Chicago tells apart works by the same author in the same year with letters after the year, such as 2024a and 2024b.");
}

const GRAMMAR: AuthorDateGrammar = { separator: "space", joiner: "and", noDate: "n.d.", locatorLabels: false, etAlFrom: 3 };

function diagnose(citation: AuthorDateCitation): AuthorDateCitation {
  const issues: ReferenceCheckIssue[] = [];
  for (const problem of citation.problems) {
    if (problem === "separator-extra") issues.push(issue("citation-format", "warning", "There is a comma between the author and the year.", `${STYLE} puts no punctuation between author and year: (Yu 2020, 45). A comma there is the form of APA and many Harvard guides.`, "Remove the comma after the author.", citation.evidence));
    if (problem === "separator-missing") issues.push(issue("citation-format", "warning", "n.d. needs a comma before it.", "Chicago puts a comma before n.d., so it isn't read as part of the name: (OED, n.d.).", "Add a comma before n.d.", citation.evidence));
    if (problem === "joiner") issues.push(issue("citation-format", "warning", "Authors are joined with “&”.", "Chicago joins two authors with “and”: (Binder and Kidder 2022).", "Replace “&” with “and”.", citation.evidence));
    if (problem === "no-date-form") issues.push(issue("citation-format", "warning", "A missing date isn't written n.d.", "Chicago writes n.d. in place of the year.", "Write n.d.", citation.evidence));
    if (problem === "locator-label-extra") issues.push(issue("locator", "warning", "The page number has “p.” or “pp.”.", `${STYLE} gives page numbers without p. or pp.: (Yu 2020, 45).`, "Remove p. or pp.", citation.evidence));
    if (problem === "et-al-missing") issues.push(issue("citation-format", "warning", "Three or more authors are all named in the citation.", "Chicago cites three or more authors as the first author and et al.: (Snyder et al. 2025).", "Shorten the names to the first author and et al.", citation.evidence));
  }
  return { ...citation, issues };
}

function readCitations(text: string): CitationScan {
  const citations = [...readParenthetical(text, GRAMMAR), ...readNarrative(text, GRAMMAR)].map(diagnose);
  const issues: ReferenceCheckIssue[] = unreadYearGroups(text, citations).map(uncertainCitation);
  const numeric = numericCitationCount(text);
  if (numeric > 0) issues.push(issue("style-mismatch", "warning", "This appears to use numeric citation formatting rather than Chicago author–date formatting.", "Citations such as [1] belong to numeric styles. Chicago author-date cites the author and year: (Yu 2020).", "Check which style your document uses, and choose it above.", `${numeric} numeric citation${numeric === 1 ? "" : "s"}`));
  return { citations, issues };
}

export const chicagoAuthorDateChecker: StyleChecker = {
  id: "chicago-author-date",
  capabilities: { sourceTypes: ["book", "journal-article", "webpage"], citations: "author-date", list: "reference list", ordering: "alphabetical", yearLetters: true },
  notices: [],
  parseEntry,
  checkList,
  readCitations,
};
