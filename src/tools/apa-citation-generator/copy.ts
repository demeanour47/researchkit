/**
 * All wording for the APA Citation Generator. Every note the formatter can return
 * has an explanation here; the map is typed, so a new note without text is an error.
 */

import type { Note, RequiredField, SourceType } from "@/knowledge/citation/apa";
import { styleTitle } from "@/knowledge/citation/styles";

const apa = styleTitle("apa");

export const page = {
  title: "APA Citation Generator",
  /** One sentence, for listings such as the tools index. */
  summary: `Formats references and in-text citations for books, journal articles and web pages in ${apa}.`,
  metaDescription:
    "Free APA 7 citation generator for books, journal articles and web pages. Get the reference and in-text citations, with every formatting decision explained.",
  intro:
    "Fill in your source's details to get its APA reference and in-text citations. Every formatting decision is explained, and nothing you type leaves your browser.",
  noScript: "The generator formats as you type, which needs JavaScript. Turn on JavaScript to use it.",
  rulesHeading: "How references are formatted",
  limitsHeading: "What the generator can't check",
  privacyHeading: "Privacy",
  privacy:
    "Your reference is generated entirely in your browser. Nothing you type is sent to ResearchKit or anyone else, or stored.",
  styleLink: "More about APA Style",
} as const;

export const form = {
  sourceType: "What are you citing?",
  sourceTypes: {
    book: "Book",
    "journal-article": "Journal article",
    webpage: "Web page",
  } satisfies Record<SourceType, string>,
  authors: "Authors",
  authorsHint: "In the order shown on the source. Leave blank if there is no author.",
  author: (n: number) => `Author ${n}`,
  authorKind: "Author type",
  person: "Person",
  organization: "Organization",
  familyName: "Family name",
  givenNames: "Given names",
  givenNamesHint: "Full names or initials",
  organizationName: "Organization name",
  addAuthor: "Add another author",
  remove: "Remove",
  date: "Date of publication",
  dateHint: "Leave the year blank if there is no date.",
  year: "Year",
  month: "Month",
  day: "Day",
  noMonth: "No month",
  title: "Title",
  titleHint: "In sentence case: capitals only for the first word, the first word after a colon, and proper nouns.",
  edition: "Edition",
  editionHint: "A number, such as 2. Leave blank for a first edition.",
  publisher: "Publisher",
  journal: "Journal name",
  journalHint: "As the journal writes it, in title case.",
  volume: "Volume",
  issue: "Issue",
  pages: "Pages",
  pagesHint: "Such as 436-444",
  articleNumber: "Article number",
  articleNumberHint: "Only if the article has no page numbers.",
  doi: "DOI",
  doiHint: "Such as 10.1038/nature14539, or the full https://doi.org/ link.",
  url: "Web address (URL)",
  urlHintOptional: "Only if there is no DOI.",
  siteName: "Site name",
  siteNameHint: "Left out automatically if it's the same as the author.",
} as const;

export const output = {
  heading: "Your reference",
  inTextHeading: "In-text citations",
  parenthetical: "Parenthetical",
  narrative: "Narrative",
  notesHeading: "Check before you use it",
  provenance: `Formatted to ${apa}. This tool has not yet been checked by a named reviewer.`,
  empty: "Fill in the form, or load the example, to see the reference and in-text citations.",
} as const;

export const actions = {
  loadExample: "Load Example",
  clear: "Clear all fields",
} as const;

const requiredLabels: Record<RequiredField, string> = {
  title: "title",
  publisher: "publisher",
  journal: "journal name",
  url: "web address (URL)",
};

export function noteText(note: Note): string {
  switch (note.code) {
    case "no-author":
      return "There is no author, so the title moves to the start of the reference and stands in for the author in text. In running text, write the title in title case.";
    case "author-incomplete":
      return `Author ${note.position} has no family name or organization name, so it was left out.`;
    case "over-twenty-authors":
      return `With ${note.count} authors, APA lists the first 19, then an ellipsis, then the last author.`;
    case "no-date":
      return "There is no year, so “n.d.” (no date) is used.";
    case "invalid-date":
      return "Part of the date isn't a real calendar date, so only the valid part is used.";
    case "day-without-month":
      return "A day was given without a month, so only the year is used.";
    case "missing":
      return `Add the ${requiredLabels[note.field]}: it is required for this type of source.`;
    case "publisher-omitted":
      return "The publisher is the same as the author, so APA leaves it out.";
    case "site-name-omitted":
      return "The site name is the same as the author, so APA leaves it out.";
    case "first-edition-omitted":
      return "First editions aren't shown in APA references.";
    case "invalid-doi":
      return "The DOI doesn't look valid (a DOI starts with “10.”), so it wasn't used. Check it against the source.";
    case "invalid-url":
      return "The web address must start with http:// or https://, so it wasn't used.";
    case "check-sentence-case":
      return "The title is used exactly as typed. Check it is in sentence case: capitals only for the first word, the first word after a colon, and proper nouns.";
  }
}

export const rules: readonly string[] = [
  "Authors are listed by family name and initials, in the order they appear on the source, with an ampersand (&) before the last. Up to 20 authors are all listed; from 21, the first 19, an ellipsis, then the last.",
  "The date follows the authors in brackets. Books and articles use the year; web pages use as much of the date as the page shows. Without a date, APA uses “n.d.”.",
  "Titles of books and web pages are in italics; titles of articles are not. For an article, the journal name and volume are in italics.",
  "A DOI is written as a link beginning https://doi.org/, with no full stop after it. Without a DOI, a web address is used if there is one.",
  "When the publisher or site name is the same as the author, it is left out.",
  "In text, one or two authors are named each time; three or more are shortened to the first author and “et al.”.",
];

export const limits: readonly string[] = [
  "Capitalisation. Titles are used exactly as you type them, because sentence case depends on proper nouns that only you can judge.",
  "Your instructions. An instructor or publisher may require changes to standard APA; their instructions come first.",
  "Other kinds of source. Book chapters, reports, videos and other formats aren't supported yet.",
  "Whether the details are right. The generator formats what you enter; check names, dates and numbers against the source.",
];
