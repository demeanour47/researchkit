/**
 * All wording for the IEEE Citation Generator. Every decision the formatter can
 * report has an explanation here; the map is typed, so a new decision without text is
 * an error. Validation wording lives with the issues in the knowledge layer.
 */

import type { AuthorFieldLabels, LocatorFieldLabels, SourceFieldLabels } from "@/features/citation";
import type { Decision, RangeStyle } from "@/knowledge/citation/ieee";

export const page = {
  title: "IEEE Citation Generator",
  /** One sentence, for listings such as the tools index and the catalogue. */
  summary: "Formats numbered IEEE references and in-text citations, including conference papers.",
  metaDescription:
    "Format IEEE references and numbered in-text citations for books, journal articles, conference papers and web pages, following the IEEE Reference Guide, with every decision explained.",
  intro:
    "Give a source its reference number, enter its details, and get its IEEE citation and numbered reference entry. In IEEE style, numbers follow the order sources are first cited in your paper.",
  noScript: "The generator needs JavaScript to format your source. Turn on JavaScript to use it.",
  rulesHeading: "How references and citations are formatted",
  limitsHeading: "What the generator can't do",
  privacyHeading: "Privacy",
  privacy: "Your citation is generated entirely in your browser. Nothing you type is sent to ResearchKit or anyone else, or stored.",
  styleLink: "More about IEEE style",
  learnLink: "Learn IEEE citations and references",
} as const;

export const number = {
  heading: "Reference number",
  intro: "The first source you cite in your paper is [1], the next new source [2], and so on. A source keeps its number every time you cite it.",
  label: "Reference number",
  hint: "A whole number from 1, such as 1. ResearchKit can't see your paper, so enter the number this source has in your reference list.",
} as const;

export const authorLabels: AuthorFieldLabels = {
  author: (n: number) => `Author ${n}`,
  authorKind: "Author type",
  person: "Person",
  organization: "Organization",
  familyName: "Family name",
  givenNames: "Given names",
  givenNamesHint: "Full names or initials; IEEE uses initials.",
  organizationName: "Organization name",
  remove: "Remove",
};

export const form: SourceFieldLabels = {
  sourceType: "What are you citing?",
  sourceTypes: { book: "Book", "journal-article": "Journal article", "conference-paper": "Conference paper", webpage: "Web page" },
  authors: "Authors",
  authorsHint: "In the order shown on the source. Leave blank if no person or organization is named.",
  addAuthor: "Add another author",
  date: "Date of publication",
  dateHint: "Leave blank if the source shows no date.",
  journalDateHint: "The month and year of the issue.",
  conferenceDateHint: "The month and year of the conference or its proceedings.",
  year: "Year",
  month: "Month",
  day: "Day",
  noMonth: "No month",
  title: "Title (required)",
  titleHint: "As it appears on the source. IEEE capitalizes article and paper titles in sentence style.",
  edition: "Edition",
  editionHint: "A number, such as 2. Leave blank for a first edition.",
  publisher: "Publisher",
  place: "Place of publication",
  placeHint: "City, state for U.S. cities, and country, such as Cambridge, MA, USA.",
  webPublisher: "Site owner",
  webPublisherHint: "Not shown in IEEE website references.",
  journal: "Journal name (required)",
  journalHint: "IEEE abbreviates journal names, such as IEEE Trans. Biomed. Eng.; enter the abbreviation if you know it.",
  volume: "Volume",
  issue: "Issue",
  pages: "Pages",
  pagesHint: "Such as 2787-2793",
  articleNumber: "Article number",
  articleNumberHint: "Such as 2600111, for journals that number articles instead of paginating them.",
  doi: "DOI",
  doiHint: "Such as 10.1109/TBME.2011.2158315, or the full https://doi.org/ link.",
  url: "Web address (URL)",
  urlHintOptional: "IEEE gives it after the DOI when both exist.",
  urlHint: "Copy it from your browser's address bar.",
  siteName: "Website name",
  siteNameHint: "Such as CNN.com.",
  moreDetails: "More details (optional)",
  accessed: "Date you accessed the page",
  accessedHint: "IEEE's website references give the date you accessed the page.",
  proceedings: "Proceedings or conference name (required)",
  proceedingsHint: "Such as Proc. Int. Symp. Electromagn. Theory; IEEE abbreviates it.",
  location: "Conference location",
  locationHint: "City, state for U.S. cities, and country, such as Hiroshima, Japan.",
};

export const locator = {
  heading: "Page, chapter or section",
  intro: "To point to part of a reference, IEEE puts the locator inside the brackets: [3, p. 24].",
  kind: "Locator type",
  noLocator: "No locator",
  page: "Page",
  pageRange: "Page range",
  chapter: "Chapter",
  section: "Section",
  value: "Number",
  valueHint: "For example, 24, 5-10, 2 or 4.5",
} as const satisfies LocatorFieldLabels & Record<string, string>;

export const multiple = {
  heading: "Cite several references at once",
  intro: "When one statement draws on several sources, give each number in its own brackets, separated by commas. Enter the reference numbers; no source details are needed.",
  label: "Reference numbers",
  hint: "Separate numbers with commas, such as 1, 3, 7. A range such as 4-7 stands for every number in it.",
  rangesLegend: "Consecutive numbers",
  ranges: {
    "written-out": "Write every number: [1], [2], [3], [4] (current IEEE Reference Guide)",
    "en-dash": "Join three or more with an en dash: [1]–[4] (earlier IEEE guidance)",
  } satisfies Record<RangeStyle, string>,
  output: "Citation of several references",
  issuesHeading: "Checks on these numbers",
  empty: "Enter two or more reference numbers to see the citation.",
} as const;

export const output = {
  citationsHeading: "IEEE citation in the text",
  citation: "Citation",
  namedCitation: "After the authors' names",
  namedHint: "For a sentence that names the authors, such as: Klaus and Horn [1] showed …",
  referenceHeading: "IEEE reference entry",
  noNumber: "Enter a valid reference number to number the entry and the citation.",
  decisionsHeading: "How this was built",
  issuesHeading: "Validation and notes",
  severity: { error: "Error", warning: "Warning", information: "Information" },
  action: "What to do",
  provenance: "Formatted to the IEEE Reference Guide, version 3.28.2025.",
  empty: "Fill in the form, or load the example, to see the citation and reference entry.",
} as const;

export const actions = {
  loadExample: "Load Example",
  clear: "Clear all fields",
} as const;

export type CopyTarget = "citation" | "namedCitation" | "entry" | "multiple";

/** The accessible name completing each copy button: "Copy" + " citation". */
export const copySubjects: Record<CopyTarget, string> = {
  citation: "citation",
  namedCitation: "citation with authors",
  entry: "reference entry",
  multiple: "citation of several references",
};

const targetNames: Record<CopyTarget, string> = {
  citation: "Citation",
  namedCitation: "Citation with authors",
  entry: "Reference entry",
  multiple: "Citation of several references",
};

/** Everything the generator announces to screen readers, in one place. */
export const announcements = {
  copied: (target: CopyTarget) => `${targetNames[target]} copied.`,
  copyFailed: (target: CopyTarget) =>
    `${targetNames[target]} couldn't be copied automatically. It is now selected: press Control+C, or Command+C on a Mac, to copy it.`,
  formCleared: "Form cleared.",
  exampleLoaded: "Example loaded.",
  entryUpdated: (entry: string, issues: number) => `Reference entry updated: ${entry}${issues > 0 ? ` ${issues} ${issues === 1 ? "item" : "items"} to check.` : ""}`,
} as const;

export function decisionText(decision: Decision): string {
  switch (decision.code) {
    case "number-from-citation-order":
      return "The entry is numbered with the number you gave: in IEEE style, numbers follow the order sources are first cited, not the alphabet.";
    case "initials-first":
      return "Each author's given names are reduced to initials, which come before the surname, and no name is inverted.";
    case "authors-listed":
      return `All ${decision.count} authors are listed, with “and” before the last. IEEE lists up to six.`;
    case "authors-shortened":
      return `With ${decision.count} authors, the reference names the first followed by “et al.”, as IEEE does for more than six.`;
    case "organization-author":
      return "The organization is the author, so its name is written in full.";
    case "title-first":
      return "With no author, the reference begins with the title.";
    case "book-title-italic":
      return "The book's title is italicized.";
    case "article-title-quoted":
      return "The title is in quotation marks, followed by a comma inside them.";
    case "conference-in-proceedings":
      return "The conference proceedings follow “in” and are italicized, then the location, date and pages.";
    case "web-elements-periods":
      return "A website reference separates its parts with periods, unlike other IEEE references.";
    case "edition-shown":
      return "The edition follows the title, abbreviated to “ed.”.";
    case "place-and-publisher":
      return "The place of publication comes before the publisher, after a colon.";
    case "journal-numbers":
      return "The volume and issue are labeled “vol.” and “no.”.";
    case "page-range-full":
      return "Page ranges are given in full, with an en dash and “pp.”.";
    case "article-number":
      return "The article number, labeled “Art. no.”, follows the date in place of pages.";
    case "month-abbreviated":
      return `The month is abbreviated and comes before the year: ${decision.text}.`;
    case "no-date":
      return "With no year, “(n.d.)” goes where the date would be, between periods.";
    case "doi-prefix":
      return "The DOI is written “doi:” followed by the DOI.";
    case "doi-and-url":
      return "The DOI comes first and ends with a period; the URL follows “[Online]. Available:” with no period after it.";
    case "url-online":
      return "The URL follows “[Online]. Available:” and has no period after it.";
    case "access-date":
      return `The date you accessed the page is given: Accessed: ${decision.text}.`;
    case "citation-brackets":
      return "The citation is the reference number in square brackets, on the line and inside the sentence's punctuation.";
    case "citation-locator":
      return `The locator goes inside the brackets after a comma: ${decision.text}.`;
    case "citations-written-out":
      return "Several references are each bracketed and separated by commas, every number written out, as the current IEEE Reference Guide requires.";
    case "citations-en-dash":
      return "Three or more consecutive numbers are joined with an en dash, as earlier IEEE guidance did.";
    case "text-names":
      return "When a sentence names the authors, the citation follows their surnames; three or more authors are the first and “et al.”.";
  }
}

export const rules: readonly string[] = [
  "A citation is the reference's number in square brackets, such as [1]. Numbers follow the order sources are first cited in your paper, and a source keeps its number every time it is cited.",
  "Several references are each bracketed and separated by commas: [2], [4], [5]. The current IEEE Reference Guide writes consecutive numbers out rather than as a range.",
  "Part of a reference is cited inside the brackets: [3, p. 24], [3, pp. 5–10], [3, Ch. 2], [3, Sect. 4.5].",
  "Authors' initials come before their surnames. Up to six authors are listed; with more, the first and “et al.”.",
  "Book, journal and conference names are italicized; article and paper titles are in quotation marks. Volume, issue and pages are labeled vol., no. and pp.",
  "A DOI is written “doi:” followed by the DOI. Every reference ends with a period, except one ending with a URL.",
];

export const limits: readonly string[] = [
  "Your paper's citation order. The generator can't see your paper, so it uses the reference number you give and can't renumber your list.",
  "Abbreviations. IEEE abbreviates journal and conference names from its own lists; enter the abbreviations yourself.",
  "Conference dates. Day ranges such as Mar. 20–22 aren't supported; the month and year are given.",
  "Other sources and contributors. Chapters, editors, translators, theses, reports, standards, patents and datasets aren't supported yet.",
  "Your instructions. A publisher or instructor may require changes to standard IEEE style; their instructions come first.",
  "Whether the details are right. The generator formats what you enter; check names, dates and numbers against the source.",
];
