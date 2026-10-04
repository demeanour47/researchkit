/**
 * All wording for the Chicago Author-Date Citation Generator. Every decision the
 * formatter can report has an explanation here; the map is typed, so a new decision
 * without text is an error. Validation wording lives with the issues in the
 * knowledge layer.
 */

import type { AuthorFieldLabels, LocatorFieldLabels, SourceFieldLabels } from "@/features/citation";
import type { Decision } from "@/knowledge/citation/chicago/author-date";

export const page = {
  title: "Chicago Author-Date Citation Generator",
  /** One sentence, for listings such as the tools index and the catalogue. */
  summary: "Formats reference list entries and author–date text citations in Chicago style, 18th edition.",
  metaDescription:
    "Format Chicago author-date reference list entries and in-text citations for books, journal articles and web pages, following the Chicago Manual of Style, 18th edition, with every decision explained.",
  intro:
    "Enter one source to get its Chicago author-date reference, parenthetical citation and narrative citation. This tool covers Chicago's author-date system; for footnotes and a bibliography, use the Chicago Notes and Bibliography Citation Generator.",
  noScript: "The generator needs JavaScript to format your source. Turn on JavaScript to use it.",
  rulesHeading: "How references are formatted",
  limitsHeading: "What the generator can't check",
  privacyHeading: "Privacy",
  privacy: "Your citation is generated entirely in your browser. Nothing you type is sent to ResearchKit or anyone else, or stored.",
  styleLink: "More about Chicago style",
  learnLink: "Learn Chicago author-date citations",
} as const;

export const authorLabels: AuthorFieldLabels = {
  author: (n: number) => `Author ${n}`,
  authorKind: "Author type",
  person: "Person",
  organization: "Organization",
  familyName: "Family name",
  givenNames: "Given names",
  givenNamesHint: "As the source gives them, such as Amy J.",
  organizationName: "Organization name",
  remove: "Remove",
};

export const form: SourceFieldLabels = {
  sourceType: "What are you citing?",
  sourceTypes: { book: "Book", "journal-article": "Journal article", webpage: "Web page" },
  authors: "Authors",
  authorsHint: "In the order shown on the source. Leave blank if no person or organization is named.",
  addAuthor: "Add another author",
  date: "Date of publication",
  dateHint: "Leave blank if the source shows no date: Chicago then uses n.d.",
  journalDateHint: "The year of the journal issue.",
  year: "Year",
  month: "Month",
  day: "Day",
  noMonth: "No month",
  title: "Title (required)",
  titleHint: "As it appears on the source, including any subtitle after a colon, in headline-style capitals.",
  edition: "Edition",
  editionHint: "A number, such as 2. Leave blank for a first edition.",
  publisher: "Publisher",
  webPublisher: "Site owner",
  webPublisherHint: "The organization that runs the site. Used only when the site has no name of its own.",
  journal: "Journal name (required)",
  journalHint: "As the journal writes it, such as American Naturalist.",
  volume: "Volume",
  issue: "Issue",
  pages: "Pages",
  pagesHint: "Such as 471-485",
  articleNumber: "Article ID",
  articleNumberHint: "Such as e0318239. Used in place of pages when the journal numbers articles.",
  doi: "DOI",
  doiHint: "Such as 10.1086/725865, or the full https://doi.org/ link.",
  url: "Web address (URL)",
  urlHintOptional: "Only if there is no DOI.",
  urlHint: "Copy it from your browser's address bar.",
  siteName: "Website name",
  siteNameHint: "Left out automatically if it's the same as an organization author.",
  moreDetails: "More details (optional)",
  accessed: "Date you accessed the page",
  accessedHint: "Chicago adds it when a page shows no date of publication or revision.",
};

export const locator: LocatorFieldLabels & { page: string; pageRange: string } = {
  heading: "Page",
  intro: "Chicago adds a page number to a text citation when you quote or refer to a specific passage.",
  kind: "Locator type",
  noLocator: "No locator",
  page: "Page",
  pageRange: "Page range",
  value: "Number",
  valueHint: "For example, 45 or 117-118",
};

export const output = {
  referenceHeading: "Chicago Author-Date Reference",
  citationsHeading: "Chicago Author-Date Text Citations",
  parenthetical: "Parenthetical citation",
  narrative: "Narrative citation",
  narrativeHint: "Make the name part of your sentence, such as: Dittmar and Schemske (2023, 480) found …",
  decisionsHeading: "How this was built",
  issuesHeading: "Validation and notes",
  severity: { error: "Error", warning: "Warning", information: "Information" },
  action: "What to do",
  provenance: "Formatted to the Chicago Manual of Style, 18th edition, author-date system.",
  empty: "Fill in the form, or load the example, to see the reference and text citations.",
} as const;

export const actions = {
  loadExample: "Load Example",
  clear: "Clear all fields",
} as const;

export type CopyTarget = "reference" | "parenthetical" | "narrative";

/** The accessible name completing each copy button: "Copy" + " reference". */
export const copySubjects: Record<CopyTarget, string> = {
  reference: "reference",
  parenthetical: "parenthetical citation",
  narrative: "narrative citation",
};

const targetNames: Record<CopyTarget, string> = {
  reference: "Reference",
  parenthetical: "Parenthetical citation",
  narrative: "Narrative citation",
};

/** Everything the generator announces to screen readers, in one place. */
export const announcements = {
  copied: (target: CopyTarget) => `${targetNames[target]} copied.`,
  copyFailed: (target: CopyTarget) =>
    `${targetNames[target]} couldn't be copied automatically. It is now selected: press Control+C, or Command+C on a Mac, to copy it.`,
  formCleared: "Form cleared.",
  exampleLoaded: "Example loaded.",
  referenceUpdated: (reference: string, issues: number) =>
    `Reference updated: ${reference}${issues > 0 ? ` ${issues} ${issues === 1 ? "item" : "items"} to check.` : ""}`,
} as const;

export function decisionText(decision: Decision): string {
  switch (decision.code) {
    case "first-author-inverted":
      return "The first author's name is inverted (family name, given names) because the reference list is alphabetized by it. Any other author keeps normal order.";
    case "authors-listed":
      return `All ${decision.count} authors are listed, with “and” before the last. Chicago lists up to six.`;
    case "authors-shortened":
      return `With ${decision.count} authors, the reference lists the first three followed by “et al.”, as Chicago does for more than six.`;
    case "organization-author":
      return "The organization is the author, so its name is written in full and not inverted.";
    case "title-first":
      return "With no author, the entry begins with the title, followed by the year.";
    case "year-after-author":
      return "The year follows the author, the defining feature of the author-date system.";
    case "no-date":
      return "With no date, n.d. (“no date”) takes the year's place in the reference and the citations.";
    case "book-title-italic":
      return "A book's title is italicized.";
    case "article-title-quoted":
      return "The article title is in quotation marks; the journal title is italicized.";
    case "page-title-quoted":
      return "The page title is in quotation marks; the website's name is not italicized.";
    case "journal-numbers":
      return "The volume follows the journal, with the issue in parentheses and the pages after a colon.";
    case "pages-shortened":
      return `The range ${decision.from} is written ${decision.to}, following Chicago's rules for inclusive numbers.`;
    case "article-id-for-pages":
      return "The article ID stands in place of a page range.";
    case "edition-shown":
      return "The edition follows the title, abbreviated to “ed.”.";
    case "first-edition-omitted":
      return "A first edition is not shown; Chicago notes only later editions.";
    case "site-name-omitted":
      return "The website has the same name as the organization author, so it isn't repeated.";
    case "site-owner-used":
      return "The site has no name of its own, so its owner is named instead.";
    case "web-month-day":
      return "The page's month and day follow the site; the year isn't repeated because it follows the author.";
    case "access-date":
      return `With no date on the page, the date you accessed it is added: Accessed ${decision.text}.`;
    case "doi-used":
      return "The DOI is given as a https://doi.org/ link, which Chicago prefers to other URLs.";
    case "url-left-out-for-doi":
      return "The URL is left out because the DOI identifies the work more reliably.";
    case "url-used":
      return "The URL is given in full, ending with a full stop.";
    case "text-page":
      return "The page follows the year after a comma, with no “p.”.";
    case "text-no-locator":
      return "No page was given, so the citation names the source and year only. Add a page when you quote or refer to a specific passage.";
    case "text-et-al":
      return "With three or more authors, text citations name the first author followed by “et al.”.";
    case "text-title":
      return "With no author, text citations use the title, styled as in the reference.";
    case "text-no-date-comma":
      return "A comma comes before n.d. in a parenthetical citation, so it isn't read as part of the name.";
  }
}

export const rules: readonly string[] = [
  "The year follows the author in the reference list, and the same author and year make up the text citation, so readers can match one to the other.",
  "The first author is inverted. Up to six authors are listed, with “and” before the last; with more than six, the first three and “et al.”.",
  "In text, one or two authors are named; three or more become the first author and “et al.”. There is no punctuation between name and year, and a comma before a page: (Yu 2020, 45).",
  "Book titles are italicized; article and web page titles are in quotation marks. Journal volume, issue and pages are written 202 (4): 471–85.",
  "A DOI, as a https://doi.org/ link, is preferred to a URL. Without a date, n.d. stands in for the year, and a web page gets an access date.",
];

export const limits: readonly string[] = [
  "Notes and bibliography. This tool covers Chicago's author-date system only. For footnotes and a bibliography, use the Chicago Notes and Bibliography Citation Generator.",
  "Same author, same year. Letters such as 2024a and 2024b depend on your whole reference list, so the generator can't assign them.",
  "Capitalization and short titles. Titles are used as you type them; headline style and shortened titles need your judgment.",
  "Other sources and contributors. Chapters, editors, translators, news articles and other formats aren't supported yet.",
  "Your instructions. An instructor or publisher may require changes to standard Chicago; their instructions come first.",
  "Whether the details are right. The generator formats what you enter; check names, dates and numbers against the source.",
];
