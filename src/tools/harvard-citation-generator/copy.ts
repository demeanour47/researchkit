/**
 * All wording for the Harvard Citation Generator. Every decision the formatter can
 * report has an explanation here; the map is typed, so a new decision without text
 * is an error. Validation wording lives with the issues in the knowledge layer.
 */

import type { AuthorFieldLabels, LocatorFieldLabels, SourceFieldLabels } from "@/features/citation";
import type { Decision } from "@/knowledge/citation/harvard";

export const page = {
  title: "Harvard Citation Generator",
  /** One sentence, for listings such as the tools index and the catalogue. */
  summary: "Formats Harvard references and author-date citations in a defined profile based on Cite Them Right.",
  metaDescription:
    "Format Harvard references and in-text citations for books, journal articles and web pages, following a defined profile based on Cite Them Right, 13th edition, with every decision explained.",
  intro:
    "Enter one source to get its Harvard reference, parenthetical citation and narrative citation. The generator follows one defined version of Harvard, based on Cite Them Right, and explains every choice it makes.",
  /** Shown above the generator, so no one mistakes the profile for every university's Harvard. */
  profileTitle: "One version of Harvard",
  profileNotice:
    "ResearchKit uses a defined Harvard author-date profile. Harvard referencing varies between institutions, so check your university's referencing requirements.",
  noScript: "The generator needs JavaScript to format your source. Turn on JavaScript to use it.",
  rulesHeading: "How references are formatted",
  limitsHeading: "What the generator can't check",
  privacyHeading: "Privacy",
  privacy: "Your citation is generated entirely in your browser. Nothing you type is sent to ResearchKit or anyone else, or stored.",
  styleLink: "More about Harvard referencing",
  learnLink: "Learn Harvard citations and references",
} as const;

export const authorLabels: AuthorFieldLabels = {
  author: (n: number) => `Author ${n}`,
  authorKind: "Author type",
  person: "Person",
  organization: "Organization",
  familyName: "Family name",
  givenNames: "Given names",
  givenNamesHint: "Full names or initials, such as Stella or J.G. Harvard uses initials.",
  organizationName: "Organization name",
  remove: "Remove",
};

export const form: SourceFieldLabels = {
  sourceType: "What are you citing?",
  sourceTypes: { book: "Book", "journal-article": "Journal article", webpage: "Web page" },
  authors: "Authors",
  authorsHint: "In the order shown on the source. An organization can be the author. Leave blank if no person or organization is responsible.",
  addAuthor: "Add another author",
  date: "Date of publication",
  dateHint: "Only the year is used. Leave blank if the source shows no date: Harvard then uses “no date”.",
  journalDateHint: "The year of the journal issue.",
  year: "Year",
  month: "Month",
  day: "Day",
  noMonth: "No month",
  title: "Title (required)",
  titleHint: "As it appears on the source, including any subtitle after a colon. Harvard uses sentence case: capitals only for the first word and proper nouns.",
  edition: "Edition",
  editionHint: "A number, such as 2. Leave blank for a first edition.",
  publisher: "Publisher",
  webPublisher: "Site owner",
  webPublisherHint: "Not part of a Harvard reference. If no author is named, enter the organization responsible for the page as the author instead.",
  journal: "Journal name (required)",
  journalHint: "As the journal writes it, such as Risk Analysis.",
  volume: "Volume",
  issue: "Issue",
  pages: "Pages",
  pagesHint: "Such as 2481-2497",
  articleNumber: "Article number",
  articleNumberHint: "Such as 108125. Used in place of pages when the journal numbers articles.",
  doi: "DOI",
  doiHint: "Such as 10.1111/risa.13574, or the full https://doi.org/ link.",
  url: "Web address (URL)",
  urlHintOptional: "Only if there is no DOI. Add the date you accessed it below.",
  urlHint: "Copy it from your browser's address bar.",
  siteName: "Website name",
  siteNameHint: "Not part of a Harvard reference; the page's author and title identify it.",
  moreDetails: "More details (optional)",
  accessed: "Date you accessed it",
  accessedHint: "Harvard gives the date you viewed a source with its URL. It isn't needed with a DOI.",
};

export const locator: LocatorFieldLabels & { page: string; pageRange: string } = {
  heading: "Page",
  intro: "Harvard adds a page number to a citation when you quote or refer to a specific passage.",
  kind: "Locator type",
  noLocator: "No locator",
  page: "Page",
  pageRange: "Page range",
  value: "Number",
  valueHint: "For example, 45 or 45-47",
};

export const yearLetter = {
  heading: "Same author, same year",
  intro: "If your reference list has two or more works by the same author from the same year, give each a letter after the year: 2024a, 2024b. Many guides assign letters in alphabetical order of the titles, some in the order you first cite the works, so only you can assign them.",
  label: "Year letter",
  hint: "One lowercase letter, such as a. Leave blank if you don't need one.",
} as const;

export const output = {
  referenceHeading: "Harvard Reference",
  citationsHeading: "Harvard In-Text Citations",
  parenthetical: "Harvard Parenthetical Citation",
  narrative: "Harvard Narrative Citation",
  narrativeHint: "Make the names part of your sentence, such as: Thaker, Smith and Leiserowitz (2020, p. 2485) found …",
  decisionsHeading: "How this was built",
  issuesHeading: "Validation / Notes",
  severity: { error: "Error", warning: "Warning", information: "Information" },
  action: "What to do",
  provenance: "Formatted to ResearchKit's Harvard profile, based on Cite Them Right, 13th edition (Pears and Shields, 2025).",
  empty: "Fill in the form, or load the example, to see the reference and citations.",
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
    case "surname-initials":
      return "Each author is written family name first, then initials with full stops and no spaces, such as Speight, J.G.";
    case "authors-listed":
      return `All ${decision.count} authors are listed in the reference, with “and”, not “&”, before the last.`;
    case "organization-author":
      return "The organization is the author, so its name is written in full.";
    case "title-first":
      return "With no author, the reference begins with the title, followed by the year.";
    case "year-in-brackets":
      return "The year follows the author in round brackets, the defining feature of Harvard's author-date system.";
    case "no-date":
      return "With no date, “no date” takes the year's place in the reference and the citations.";
    case "year-letter":
      return `The letter ${decision.letter} follows the year in the reference and the citations, to tell this work from others by the same author in the same year.`;
    case "book-title-italic":
      return "A book's title is in italics, followed by a full stop.";
    case "article-title-quoted":
      return "The article title is in single quotation marks, followed by a comma; the journal title is in italics.";
    case "page-title-italic":
      return "A web page's title is in italics, followed by a full stop.";
    case "journal-numbers":
      return "The volume follows the journal, with the issue in round brackets straight after it, such as 40(12).";
    case "single-page":
      return "A single page takes “p.”.";
    case "page-range":
      return "A page range takes “pp.” and is given in full, with an en dash.";
    case "article-number":
      return "The article number stands in place of a page range, as “article” and the number.";
    case "edition-shown":
      return "The edition follows the title, abbreviated to “edn”.";
    case "first-edition-omitted":
      return "A first edition is not shown; Harvard notes only later editions.";
    case "publisher-only":
      return "The publisher is given without a place of publication, as in Cite Them Right's 13th edition.";
    case "doi-used":
      return "The DOI is given as a https://doi.org/ link after “Available at:”, with no access date and no full stop after it.";
    case "url-left-out-for-doi":
      return "The URL is left out because the DOI identifies the work more reliably.";
    case "url-used":
      return "The URL is given in full after “Available at:”.";
    case "access-date":
      return `The date you accessed the source follows the URL: (Accessed: ${decision.text}).`;
    case "text-page":
      return "The page follows the year after a comma, with “p.”.";
    case "text-pages":
      return "The page range follows the year after a comma, with “pp.”.";
    case "text-no-locator":
      return "No page was given, so the citation names the source and year only. Add a page when you quote or refer to a specific passage.";
    case "text-all-named":
      return `With ${decision.count} authors, the citations name them all, with “and” before the last.`;
    case "text-et-al":
      return "With four or more authors, the citations name the first author followed by “et al.”.";
    case "text-title":
      return "With no author, the citations use the title, styled as in the reference.";
    case "text-no-date":
      return "“no date” follows the name after a comma, in place of the year.";
  }
}

export const rules: readonly string[] = [
  "The author and year in the citation match the start of the reference, so readers can find one from the other: (Cottrell, 2019) leads to Cottrell, S. (2019) …",
  "In the reference, authors are family names and initials, all listed, with “and” before the last. In the text, up to three are named; four or more become the first author and “et al.”.",
  "A comma separates the name, year and page in a parenthetical citation: (Smith, 2015, p. 23). In a narrative citation, the year and page follow the name in brackets: Smith (2015, p. 23).",
  "Book and web page titles are in italics; article titles are in single quotation marks, and journal titles in italics. Pages take “p.” or “pp.”.",
  "A DOI or URL follows “Available at:”. A URL is followed by the date you accessed it; a DOI needs no access date. Without a date, “no date” stands in for the year.",
];

export const limits: readonly string[] = [
  "Your university's version. Harvard has no single official version. This generator follows one defined profile; where your university's guide differs, follow your guide.",
  "Same author, same year. Letters such as 2024a and 2024b depend on your whole reference list, so you choose them; the generator doesn't assign them.",
  "Capital letters. Titles are used as you type them; sentence case needs your judgment about proper nouns.",
  "Other sources and contributors. Chapters, editors, translators, reports, news articles and other formats aren't supported yet.",
  "Whether the details are right. The generator formats what you enter; check names, dates and numbers against the source.",
];
