/**
 * All wording for the MLA Citation Generator. Every decision the formatter can
 * report has an explanation here; the map is typed, so a new decision without text
 * is an error. Validation wording lives with the issues in the knowledge layer.
 */

import type { AuthorFieldLabels } from "@/features/citation";
import type { Decision } from "@/knowledge/citation/mla";
import type { SourceType } from "@/knowledge/citation/source";
// A relative import, so the test runner can load this module (see TESTING.md).
import { styleTitle } from "../../knowledge/citation/styles";

const mla = styleTitle("mla");

export const page = {
  title: "MLA Citation Generator",
  /** One sentence, for listings such as the tools index and the catalogue. */
  summary: "Formats Works Cited entries and in-text citations in MLA Style, 9th edition.",
  metaDescription:
    "Format MLA 9 Works Cited entries and in-text citations for books, journal articles and web pages, with every formatting decision explained and missing details flagged.",
  intro:
    "Enter one source to get its Works Cited entry and in-text citations in MLA Style. Each result explains how it was built and what to check, so you learn the rules as you go.",
  noScript: "The generator needs JavaScript to format your source. Turn on JavaScript to use it.",
  rulesHeading: "How entries are formatted",
  limitsHeading: "What the generator can't check",
  privacyHeading: "Privacy",
  privacy: "Your citation is generated entirely in your browser. Nothing you type is sent to ResearchKit or anyone else, or stored.",
  styleLink: "More about MLA Style",
  learnLink: "Learn MLA 9 citations and Works Cited",
} as const;

export const authorLabels: AuthorFieldLabels = {
  author: (n: number) => `Author ${n}`,
  authorKind: "Author type",
  person: "Person",
  organization: "Organization",
  familyName: "Family name",
  givenNames: "Given names",
  givenNamesHint: "Use the author's full given name when available.",
  organizationName: "Organization name",
  remove: "Remove",
};

export const form = {
  sourceType: "What are you citing?",
  sourceTypes: {
    book: "Book",
    "journal-article": "Journal article",
    webpage: "Web page",
  } satisfies Record<SourceType, string>,
  authors: "Authors",
  authorsHint: "In the order shown on the source. Leave blank if there is no author.",
  addAuthor: "Add another author",
  date: "Date of publication",
  dateHint: "Leave blank if the source shows no date. MLA leaves a missing date out.",
  journalDateHint: "The year, and the month if the issue gives one.",
  year: "Year",
  month: "Month",
  day: "Day",
  noMonth: "No month",
  title: "Title",
  titleHint: "As it appears on the source, in title case: capitalize the first, last and principal words.",
  edition: "Edition",
  editionHint: "A number, such as 2, or the source's wording, such as Expanded ed. Leave blank for a first edition.",
  publisher: "Publisher",
  webPublisher: "Publisher",
  webPublisherHint: "The organization responsible for the site. Left out automatically if it's the same as the website name.",
  journal: "Journal name",
  journalHint: "The journal is the container that holds the article.",
  volume: "Volume",
  issue: "Issue",
  pages: "Pages",
  pagesHint: "Such as 436-444",
  articleNumber: "Article number",
  articleNumberHint: "MLA leaves article numbers out; enter it only so the generator can tell you so.",
  doi: "DOI",
  doiHint: "Such as 10.1038/nature14539, or the full https://doi.org/ link.",
  url: "Web address (URL)",
  urlHintOptional: "Only if there is no DOI.",
  urlHint: "Copy it from your browser's address bar.",
  siteName: "Website name",
  siteNameHint: "The website is the container that holds the page.",
  moreDetails: "More details (optional)",
  accessed: "Date you accessed the page",
  accessedHint: "Optional. MLA suggests it when a page has no publication date, or may change.",
} as const;

export const locator = {
  heading: "Page or paragraph",
  intro: "MLA cites the page a quotation or idea comes from whenever the source has page numbers.",
  kind: "Locator type",
  noLocator: "No locator",
  page: "Page",
  pageRange: "Page range",
  paragraph: "Paragraph (numbered paragraphs only)",
  value: "Number",
  valueHint: "For example, 24 or 24-26",
} as const;

export const output = {
  worksCitedHeading: "Works Cited entry",
  inTextHeading: "In-text citations",
  parenthetical: "Parenthetical",
  narrative: "Narrative",
  narrativeFirst: "First mention in your sentence",
  narrativeLater: "Later mentions",
  narrativeEnd: "At the end of the sentence",
  narrativeEndNone: "Nothing: with no page number, the name in your sentence is enough.",
  decisionsHeading: "How this was built",
  issuesHeading: "Check before you use it",
  severity: { error: "Error", warning: "Warning", information: "Information" },
  action: "What to do",
  provenance: `Formatted to ${mla}.`,
  empty: "Fill in the form, or load the example, to see the Works Cited entry and in-text citations.",
} as const;

export const actions = {
  loadExample: "Load Example",
  clear: "Clear all fields",
} as const;

export type CopyTarget = "worksCited" | "parenthetical" | "narrative";

/** The accessible name completing each copy button: "Copy" + " Works Cited entry". */
export const copySubjects: Record<CopyTarget, string> = {
  worksCited: "Works Cited entry",
  parenthetical: "parenthetical citation",
  narrative: "narrative citation",
};

const targetNames: Record<CopyTarget, string> = {
  worksCited: "Works Cited entry",
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
  entryUpdated: (entry: string, issues: number) =>
    `Works Cited entry updated: ${entry}${issues > 0 ? ` ${issues} ${issues === 1 ? "item" : "items"} to check.` : ""}`,
} as const;

export function decisionText(decision: Decision): string {
  switch (decision.code) {
    case "first-author-inverted":
      return "The first author's name is inverted (family name, given name), because the Works Cited list is alphabetized by it. Any other author keeps normal order.";
    case "two-authors":
      return "With two authors, both are named, joined by a comma and “and”.";
    case "et-al":
      return `With ${decision.count} authors, the entry names the first author followed by “et al.”.`;
    case "organization-author":
      return "The organization is the author, so its name is written in full and not inverted.";
    case "organization-omitted":
      return decision.as === "publisher"
        ? "The organization is both author and publisher, so MLA begins the entry with the title and names the organization only as publisher. In-text citations use the title."
        : "The organization has the same name as the website, so MLA leaves the author out and begins with the title. In-text citations use the title.";
    case "title-first":
      return "With no author, the entry begins with the title.";
    case "standalone-title":
      return "A book is a self-contained work, so its title is italicized.";
    case "title-in-container":
      return decision.container === "journal"
        ? "The article title is treated as the source, in quotation marks. The journal is treated as the container, in italics."
        : "The page title is treated as the source, in quotation marks. The website is treated as the container, in italics.";
    case "no-container":
      return "The page title is in quotation marks. No website name was given, so the entry has no container.";
    case "edition-shown":
      return "The edition follows the title, with edition abbreviated to “ed.”.";
    case "first-edition-omitted":
      return "A first edition is not shown: the edition element identifies a later or differently labeled version.";
    case "publisher-omitted-same-as-site":
      return "The publisher has the same name as the website, so it is left out.";
    case "date-written":
      return `The date is written day, month, year, with months longer than four letters abbreviated: ${decision.text}.`;
    case "date-omitted":
      return "The publication date is omitted because it was not supplied. MLA does not use n.d.";
    case "access-date":
      return `Your access date is added at the end as an optional element: Accessed ${decision.text}.`;
    case "pages-shortened":
      return `The range ${decision.from} is written ${decision.to}: for numbers over 99, MLA gives only the last two digits of the second number, unless more are needed.`;
    case "article-number-omitted":
      return "The article number is left out, as MLA advises for journals that number articles instead of paginating them.";
    case "doi-used":
      return "The DOI is the location, written after https://doi.org/.";
    case "url-left-out-for-doi":
      return "MLA prefers a DOI to a URL, so the URL is left out.";
    case "url-protocol-omitted":
      return "The URL is the location, written without http:// or https://, as the MLA Handbook advises.";
    case "in-text-page":
      return "The page number is used directly in the in-text citation, with no “p.” and no comma.";
    case "in-text-paragraph":
      return "The paragraph number follows a comma and “par.” (“pars.” for more than one).";
    case "in-text-no-locator":
      return "No page or paragraph was given, so the in-text citation names the source alone. Add a page number whenever the source has them.";
    case "in-text-title":
      return "The in-text citation uses the title, because the entry begins with it. MLA shortens a long title to at least its first noun; ResearchKit shows it in full because that needs your judgment.";
    case "in-text-et-al":
      return "With three or more authors, the parenthetical citation names the first author followed by “et al.”.";
    case "prose-and-others":
      return "In your own sentence, MLA writes “and others” instead of “et al.”, or you can name every author.";
  }
}

export const rules: readonly string[] = [
  "An entry is built from MLA's core elements, in order, using only those that apply: author, title of the source, title of the container, version, number, publisher, date and location.",
  "The first author is inverted (Smith, Jane). Two authors are joined by “and”; three or more become the first author and “et al.”.",
  "A book's title is italicized. An article or web page title is in quotation marks, and the journal or website that contains it is italicized.",
  "Dates are written day, month, year, with months longer than four letters abbreviated. A missing date is left out, not replaced with n.d.",
  "A DOI is preferred to a URL and written after https://doi.org/. A URL is written without http:// or https://.",
  "In-text citations give the name and page with nothing between them, such as (Smith 24), and no year.",
];

export const limits: readonly string[] = [
  "Capitalization. Titles are used exactly as you type them, because title case needs judgment about names, terms and other languages.",
  "Short titles. When a work has no author, the in-text citation uses the full title; shorten a long one yourself.",
  "Several works. The generator formats one source at a time. It doesn't order a Works Cited list or add short titles to tell apart several works by the same author.",
  "Other kinds of source and contributors. Book chapters, editors, translators, newspapers, videos and other formats aren't supported yet.",
  "Your instructions. An instructor or publisher may require changes to standard MLA; their instructions come first.",
  "Whether the details are right. The generator formats what you enter; check names, dates and numbers against the source.",
];
