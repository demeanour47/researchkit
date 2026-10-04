/**
 * All wording for the Reference Checker. What each style's checks cover is listed
 * here per style, and tests compare it with the checkers' capabilities, so the page
 * never claims a check that isn't implemented. Issue wording lives with the checks.
 */

// Type-only imports, so the test runner can load this module (see TESTING.md).
import type { CheckerIssueCategory, CheckerStyleId } from "../../knowledge/citation/checker";

export const page = {
  title: "Reference Checker",
  /** One sentence, for listings such as the tools index and the catalogue. */
  summary: "Checks reference lists and citations in APA 7, MLA 9, Chicago, IEEE and Harvard for structure, missing details, duplicates, order and mismatched citations.",
  metaDescription:
    "Check a reference list, Works Cited list or bibliography in APA 7, MLA 9, Chicago author-date, Chicago notes and bibliography, IEEE or Harvard: structure, missing details, duplicates, order, and citations that don't match an entry.",
  intro:
    "Choose a citation style, paste your reference list and, if you like, the text with your citations. The checker explains what it finds and never rewrites your text.",
  noScript: "The Reference Checker needs JavaScript to inspect the reference list. Turn on JavaScript to use it.",
  howHeading: "How the checker works",
  how: [
    "Choose the citation style your work follows. Every check depends on it: a correct APA entry is wrong in IEEE.",
    "Paste the list, with a blank line between entries, or one numbered entry per line. Paste the text with your citations, or your notes for Chicago notes and bibliography, to check that citations and entries match.",
    "Each style has its own checker for the structure of its entries and citations. Duplicates and citation matching work the same way in every style.",
    "Review each finding against your source. No finding doesn't mean a reference is correct.",
  ],
  limitsHeading: "What this checker cannot determine",
  limits: [
    "Whether details are correct. It doesn't look up DOIs, fetch records or test whether URLs work.",
    "Everything your instructor or institution requires. It checks the patterns of each style as ResearchKit formats them; Harvard follows ResearchKit's defined profile.",
    "Your whole document. Citation matching is heuristic and works only on the text you paste; it can't see footnote placement, page layout or text in other files.",
    "Source types beyond books, journal articles and web pages, such as chapters, reports and conference papers, are read only as far as their shared structure allows.",
    "It never corrects, reorders, merges or deletes your text. The generators format; the checker diagnoses.",
  ],
  privacyHeading: "Privacy",
  privacy: "Checking happens in your browser. Your reference list and text are not sent to ResearchKit, stored or placed in the URL.",
  learnLink: "Learn how the Reference Checker works",
  finderLink: "Not sure which style you need? Try the Citation Style Finder",
} as const;

export const form = {
  styleLegend: "Citation style",
  styleHint: "Reference validation depends on the selected citation style.",
  styleRequired: "Choose a citation style to check against.",
  checksHeading: (style: string) => `What is checked in ${style}`,
  inputHeading: "Paste your list",
  listLabel: "Reference list",
  listHint: "Use a blank line between entries, or put each numbered entry on its own line. Long entries may wrap.",
  citationsLabel: "Text with citations (optional)",
  citationsHint: "Paste the paragraphs where you cite sources, to check that every citation matches an entry and every entry is cited.",
  notesLabel: "Notes (optional)",
  notesHint: "Paste your footnotes or endnotes, one per line, to check that each matches a bibliography entry.",
  check: "Check references",
  loadExample: "Load example",
  clear: "Clear",
  empty: "Choose a style and paste a list to check its structure, details, order and citations.",
  nothingPasted: "Paste a list above to check it.",
} as const;

export const styleNames: Record<CheckerStyleId, string> = {
  apa: "APA 7",
  mla: "MLA 9",
  "chicago-author-date": "Chicago Author-Date",
  "chicago-notes-bibliography": "Chicago Notes & Bibliography",
  ieee: "IEEE",
  harvard: "Harvard (ResearchKit profile)",
};

export const listLabels: Record<CheckerStyleId, string> = {
  apa: "APA 7 reference list",
  mla: "MLA Works Cited list",
  "chicago-author-date": "Chicago author-date reference list",
  "chicago-notes-bibliography": "Chicago bibliography",
  ieee: "IEEE reference list",
  harvard: "Harvard reference list",
};

/** What each style's checker examines. Every item is implemented and tested. */
export const styleChecks: Record<CheckerStyleId, readonly string[]> = {
  apa: [
    "The date in brackets after the authors, followed by a full stop.",
    "Authors, title, journal volume and pages, publisher, DOI and URL.",
    "Alphabetical order, and same-author, same-year works.",
    "Citations such as (Smith & Jones, 2024, p. 5) and Smith and Jones (2024): commas, “&”, et al., p. and n.d.",
  ],
  mla: [
    "Author order: the first name inverted, “and” before a second, et al. from three.",
    "Article titles in quotation marks, and labelled containers: vol., no., pp.",
    "Dates written day, month, year, with months abbreviated.",
    "DOI and URL form, and access dates for undated web sources.",
    "Alphabetical order, including three hyphens for a repeated author.",
    "Author–page citations such as (LeCun et al. 437): no comma, no p.",
  ],
  "chicago-author-date": [
    "The year after the author, between full stops, or n.d.",
    "Only the first author inverted, and “and” rather than “&”.",
    "Article titles in double rather than single quotation marks, and journal numbers in Chicago's arrangement, 202 (4): 471–85, rather than APA's.",
    "DOI form and access dates.",
    "Alphabetical order, and same-author, same-year works.",
    "Citations such as (Yu 2020, 45): no comma before the year, no p., a comma before n.d.",
  ],
  "chicago-notes-bibliography": [
    "Bibliography entries: only the first author inverted, the year with the publication details rather than after the author, and journal numbers in Chicago's arrangement rather than APA's.",
    "Notes pasted into the bibliography by mistake.",
    "Full and shortened notes matched to bibliography entries by author and short title.",
    "Ibid., which depends on note order the checker can't see.",
    "Alphabetical order.",
  ],
  ieee: [
    "Reference numbers in square brackets: missing, malformed, repeated or skipped numbers.",
    "Initials before family names, labelled journal details and doi: form.",
    "Citations such as [1], [3, p. 24] and [4]–[7] matched to numbered references.",
    "Whether numbers follow the order of first citation in the text you paste.",
  ],
  harvard: [
    "ResearchKit's Harvard profile, based on Cite Them Right, 13th edition: the year in brackets after the author with no full stop, or “no date”.",
    "Initials, “and” rather than “&”, article titles in single quotation marks, pp. before page ranges.",
    "“Available at:” before links, and access dates with URLs.",
    "Alphabetical order, then year, and same-author, same-year letters.",
    "Citations such as (Smith, 2015, p. 23), with institutional variants explained as information.",
  ],
};

export const categoryLabels: Record<CheckerIssueCategory, string> = {
  "parse-warning": "Structure",
  "missing-metadata": "Missing details",
  "invalid-metadata": "Invalid details",
  "author-format": "Authors",
  "date-format": "Dates",
  "title-format": "Titles",
  "journal-structure": "Journal details",
  "publisher-structure": "Publisher and edition",
  doi: "DOI",
  url: "URL",
  duplicate: "Duplicate",
  ordering: "Order",
  numbering: "Numbering",
  locator: "Page numbers",
  "citation-format": "Citation form",
  "citation-consistency": "Citation and list",
  "style-mismatch": "Style mismatch",
  "unsupported-structure": "Unsupported structure",
  "verification-required": "Verification",
  "manual-review": "Review",
};

export const severityLabel = { error: "Error", warning: "Warning", information: "Information" } as const;

export const report = {
  summaryHeading: "Review summary",
  style: "Style",
  references: "References checked",
  errors: "Errors",
  warnings: "Warnings",
  information: "Information",
  duplicates: "Possible duplicates",
  order: "Order or numbering issues",
  citations: "Citations recognised",
  unmatched: "Unmatched citations",
  uncited: "Possibly uncited references",
  noticesHeading: "About this check",
  citationsHeading: "Citations",
  matched: (count: number) => `${count} ${count === 1 ? "citation matches" : "citations match"} an entry.`,
  citationsClean: "Every recognised citation matches an entry.",
  referencesHeading: "References",
  reference: (index: number) => `Reference ${index}`,
  original: "Original text",
  sourceType: "Detected source type",
  confidence: "Parse confidence",
  confidenceLabels: { high: "High", partial: "Partial", unable: "Unable to determine" },
  sourceTypes: { book: "Book", "journal-article": "Journal article", webpage: "Web page", unknown: "Unknown" },
  issueCount: (count: number) => `${count} ${count === 1 ? "issue" : "issues"}`,
  noDetected: "No implemented check found an issue in this reference.",
  evidence: "Evidence",
  action: "What to do",
  copyReference: "reference text",
  copySummary: "review summary",
} as const;

export const announcements = {
  checked: (count: number, style: string, counts: { error: number; warning: number; information: number }) =>
    `Checked ${count} ${count === 1 ? "reference" : "references"} in ${style}: ${counts.error} ${counts.error === 1 ? "error" : "errors"}, ${counts.warning} ${counts.warning === 1 ? "warning" : "warnings"}, ${counts.information} information.`,
  cleared: "Reference list cleared.",
  exampleLoaded: (style: string) => `${style} example loaded. Check references to see what the checker finds.`,
} as const;

/** The summary as plain text, for copying. */
export function summaryText(lines: readonly [string, string | number][]): string {
  return lines.map(([label, value]) => `${label}: ${value}`).join("\n");
}
