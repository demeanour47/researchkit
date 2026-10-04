/**
 * All wording for the Chicago Notes and Bibliography Citation Generator. Every
 * decision the formatter can report has an explanation here; the map is typed, so a
 * new decision without text is an error. Validation wording lives with the issues in
 * the knowledge layer.
 */

import type { AuthorFieldLabels, LocatorFieldLabels, SourceFieldLabels } from "@/features/citation";
import type { Decision, NoteContext } from "@/knowledge/citation/chicago/notes-bibliography";

export const page = {
  title: "Chicago Notes and Bibliography Citation Generator",
  /** One sentence, for listings such as the tools index and the catalogue. */
  summary: "Formats full notes, shortened notes and bibliography entries in Chicago style, 18th edition.",
  metaDescription:
    "Format Chicago notes-and-bibliography footnotes, shortened notes and bibliography entries for books, journal articles and web pages, following the Chicago Manual of Style, 18th edition.",
  intro:
    "Enter one source to get its Chicago full note, shortened note and bibliography entry. This tool covers Chicago's notes-and-bibliography system; for parenthetical citations and a reference list, use the author-date generator.",
  noScript: "The generator needs JavaScript to format your source. Turn on JavaScript to use it.",
  rulesHeading: "How notes and entries are formatted",
  limitsHeading: "What the generator can't do",
  privacyHeading: "Privacy",
  privacy: "Your citation is generated entirely in your browser. Nothing you type is sent to ResearchKit or anyone else, or stored.",
  styleLink: "More about Chicago style",
  learnLink: "Learn Chicago notes and bibliography",
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
  dateHint: "Leave blank if the source shows no date.",
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
  webPublisherHint: "The organization that runs the site, if no person is the author.",
  journal: "Journal name (required)",
  journalHint: "As the journal writes it, such as American Journal of Sociology.",
  volume: "Volume",
  issue: "Issue",
  pages: "Pages of the whole article",
  pagesHint: "Such as 1818-1859. The page you cite goes below.",
  articleNumber: "Article ID",
  articleNumberHint: "Such as e0318239, for journals that number articles instead of paginating them.",
  doi: "DOI",
  doiHint: "Such as 10.1086/720277, or the full https://doi.org/ link.",
  url: "Web address (URL)",
  urlHintOptional: "Only if there is no DOI.",
  urlHint: "Copy it from your browser's address bar.",
  siteName: "Website name",
  siteNameHint: "Left out automatically if it's the same as an organization author.",
  moreDetails: "More details (optional)",
  accessed: "Date you accessed the page",
  accessedHint: "Chicago adds it when a page shows no date of publication or revision.",
};

export const context = {
  heading: "Citation context",
  intro: "Chicago gives a full note the first time you cite a source and a shortened note every time after that. Only your document shows which this is, so choose it here; all three forms are shown below.",
  legend: "Which note does this citation need?",
  options: {
    "full-note": "Full note: the first citation of this source",
    "short-note": "Shortened note: a later citation of this source",
  } satisfies Record<NoteContext, string>,
  shortTitle: "Short title for shortened notes",
  shortTitleHint: (derived: string) => (derived ? `Leave blank to use “${derived}”.` : "Leave blank to use the title, shortened where Chicago's rules allow."),
} as const;

export const locator: LocatorFieldLabels & { page: string; pageRange: string; chapter: string } = {
  heading: "Page or chapter",
  intro: "A note cites the specific page you quote or refer to; the bibliography gives an article's full page range.",
  kind: "Locator type",
  noLocator: "No locator",
  page: "Page",
  pageRange: "Page range",
  chapter: "Chapter",
  value: "Number",
  valueHint: "For example, 45, 117-118 or 6",
};

export const output = {
  heading: "Chicago Notes and Bibliography",
  fullNote: "Full note",
  shortNote: "Shortened note",
  bibliography: "Bibliography entry",
  forThisCitation: "For this citation",
  forFirst: "For the first citation",
  forLater: "For later citations",
  noteNumber: "Your word processor numbers the note; copy the text after the number.",
  decisionsHeading: "How this was built",
  issuesHeading: "Validation and notes",
  severity: { error: "Error", warning: "Warning", information: "Information" },
  action: "What to do",
  provenance: "Formatted to the Chicago Manual of Style, 18th edition, notes-and-bibliography system.",
  empty: "Fill in the form, or load the example, to see the notes and bibliography entry.",
} as const;

export const actions = {
  loadExample: "Load Example",
  clear: "Clear all fields",
} as const;

export type CopyTarget = "fullNote" | "shortNote" | "bibliography";

/** The accessible name completing each copy button: "Copy" + " full note". */
export const copySubjects: Record<CopyTarget, string> = {
  fullNote: "full note",
  shortNote: "shortened note",
  bibliography: "bibliography entry",
};

const targetNames: Record<CopyTarget, string> = {
  fullNote: "Full note",
  shortNote: "Shortened note",
  bibliography: "Bibliography entry",
};

/** Everything the generator announces to screen readers, in one place. */
export const announcements = {
  copied: (target: CopyTarget) => `${targetNames[target]} copied.`,
  copyFailed: (target: CopyTarget) =>
    `${targetNames[target]} couldn't be copied automatically. It is now selected: press Control+C, or Command+C on a Mac, to copy it.`,
  formCleared: "Form cleared.",
  exampleLoaded: "Example loaded.",
  noteUpdated: (kind: NoteContext, note: string, issues: number) =>
    `${kind === "full-note" ? "Full note" : "Shortened note"} updated: ${note}${issues > 0 ? ` ${issues} ${issues === 1 ? "item" : "items"} to check.` : ""}`,
} as const;

const shortTitleMethods = {
  custom: "your own short title",
  "full-title": "the full title, which is already four words or fewer",
  "article-dropped": "the title without its initial article",
  "main-title": "the main title, without its subtitle",
} as const;

export function decisionText(decision: Decision): string {
  switch (decision.code) {
    case "note-names-normal-order":
      return "In the full note, authors' names are in normal order, given names first.";
    case "note-et-al":
      return "With three or more authors, notes name the first author followed by “et al.”.";
    case "bibliography-first-inverted":
      return "In the bibliography, the first author's name is inverted because the bibliography is alphabetized by it.";
    case "bibliography-authors-listed":
      return `The bibliography lists all ${decision.count} authors, with “and” before the last. Chicago lists up to six.`;
    case "bibliography-authors-shortened":
      return `With ${decision.count} authors, the bibliography lists the first three followed by “et al.”, as Chicago does for more than six.`;
    case "organization-author":
      return "The organization is the author, so its name is written in full and not inverted.";
    case "title-first":
      return "With no author, the note and the bibliography entry begin with the title.";
    case "web-note-title-first":
      return "With no person as author, the web page's note begins with its title, then names the site and its owner.";
    case "listed-under-owner":
      return "With no author, the web page is listed in the bibliography under the site's owner.";
    case "book-title-italic":
      return "The book's title is italicized.";
    case "article-title-quoted":
      return "The article title is in quotation marks; the journal title is italicized.";
    case "page-title-quoted":
      return "The page title is in quotation marks; the website's name is not italicized.";
    case "book-publication-parentheses":
      return "In the full note, the publisher and year go in parentheses after the title; in the bibliography they end the entry.";
    case "no-place-of-publication":
      return "No place of publication is given: the 18th edition of the Chicago Manual of Style no longer requires one.";
    case "edition-shown":
      return "The edition follows the title, abbreviated to “ed.”.";
    case "first-edition-omitted":
      return "A first edition is not shown; Chicago notes only later editions.";
    case "journal-numbers":
      return "The volume follows the journal, then “no.” and the issue, then the year in parentheses.";
    case "article-page-range":
      return "The bibliography gives the article's full page range; a note gives only the page cited.";
    case "article-id":
      return "The article ID stands in place of a page range.";
    case "pages-shortened":
      return `The range ${decision.from} is written ${decision.to}, following Chicago's rules for inclusive numbers.`;
    case "site-name-omitted":
      return "The website has the same name as the organization, so it isn't repeated.";
    case "access-date":
      return `With no date on the page, the date you accessed it is given: accessed ${decision.text}.`;
    case "no-date":
      return "With no year, n.d. (“no date”) takes its place.";
    case "doi-used":
      return "The DOI is given as a https://doi.org/ link, which Chicago prefers to other URLs.";
    case "url-left-out-for-doi":
      return "The URL is left out because the DOI identifies the work more reliably.";
    case "url-used":
      return "The URL is given in full.";
    case "note-locator":
      return decision.kind === "chapter" ? "The chapter is cited as “chap.” and its number." : "The page cited follows a comma, with no “p.”.";
    case "short-note-surnames":
      return "The shortened note gives the author's surname, or surnames, and a short title.";
    case "short-title":
      return `The shortened note uses ${shortTitleMethods[decision.method]}: ${decision.text}.`;
    case "short-note-title-only":
      return "The shortened note gives the title alone, since no person or separately named organization is its author.";
  }
}

export const rules: readonly string[] = [
  "The first citation of a source gets a full note; every later citation gets a shortened note with the author's surname, a short title and the page.",
  "Notes give names in normal order and separate elements with commas. The bibliography inverts the first author and separates elements with full stops.",
  "In a book's note, the publisher and year go in parentheses; in the bibliography they end the entry. A place of publication is no longer required.",
  "A note cites the specific page; the bibliography gives an article's full page range, as in 127, no. 6 (2022): 1818–59.",
  "Two authors are named in full; with three or more, notes give the first and “et al.”, and the bibliography lists up to six.",
  "A DOI, as a https://doi.org/ link, is preferred to a URL. Web pages without a date get an access date.",
];

export const limits: readonly string[] = [
  "Your document. The generator formats citation text. It doesn't number notes, insert them into your document, or know which sources you've cited before.",
  "Short titles. Titles longer than four words need your judgment to shorten; enter your own short title when asked.",
  "Author-date. For parenthetical citations and a reference list, use the Chicago Author-Date Citation Generator.",
  "Other sources and contributors. Chapters, editors, translators, news articles, databases and other formats aren't supported yet.",
  "Your instructions. An instructor or publisher may require changes to standard Chicago; their instructions come first.",
  "Whether the details are right. The generator formats what you enter; check names, dates and numbers against the source.",
];
