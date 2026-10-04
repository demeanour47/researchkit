/**
 * MLA problems as the shared ValidationIssue shape: what is wrong, why it matters
 * in MLA, and what to do. Severity follows what the problem does to the entry:
 * errors leave the source unidentifiable or drop an identifier, warnings need a
 * check against the source, and information explains a limitation.
 */

import type { SourceRecord, ValidationIssue, ValidationSeverity } from "../source";
import type { Note, RecommendedField } from "./notes";

const severityOf = (note: Note): ValidationSeverity => {
  switch (note.code) {
    case "missing":
    case "invalid-doi":
    case "invalid-url":
    case "unsupported-source-type":
      return "error";
    case "no-date":
      return note.sourceType === "webpage" ? "information" : "warning";
    case "check-title-case":
    case "check-edition":
    case "publisher-abbreviation":
      return "information";
    default:
      return "warning";
  }
};

const recommended: Record<RecommendedField, { label: string; why: string }> = {
  publisher: {
    label: "Publisher",
    why: "MLA gives a book's publisher so readers can identify the edition you used. Some works, such as self-published ones, have none.",
  },
  "site-name": {
    label: "Website name",
    why: "MLA treats the website as the container that holds the page, and readers use it to find the page.",
  },
  url: {
    label: "Web address (URL)",
    why: "For a web page, the URL is the location element: it is how readers find the page.",
  },
};

type Text = Pick<ValidationIssue, "message" | "explanation" | "action">;

function textOf(note: Note): Text {
  switch (note.code) {
    case "missing":
      return note.field === "title"
        ? { message: "The title is missing.", explanation: "The title of the source is a core MLA element; without it the entry cannot identify the work, and a work with no author is cited in text by its title.", action: "Enter the title exactly as it appears on the source." }
        : { message: "The journal title is missing.", explanation: "MLA treats the journal as the container for a journal article. Without it, readers cannot find the article.", action: "Enter the journal title." };
    case "missing-recommended":
      return { message: `${recommended[note.field].label} is missing.`, explanation: recommended[note.field].why, action: `Add the ${recommended[note.field].label.toLowerCase()} if the source shows one; otherwise leave it out rather than guessing.` };
    case "no-author":
      return { message: "No author was entered, so the entry begins with the title.", explanation: "MLA begins an entry with the title only when the work has no author. An author left out by mistake changes how the source is listed and cited.", action: "Check the source for an author, including an organization. Do not write Anonymous unless the source does." };
    case "author-incomplete":
      return { message: `Author ${note.position} has no family name or organization name, so it was left out.`, explanation: "MLA lists authors by family name, so a name without one cannot be placed correctly.", action: `Add author ${note.position}'s family name, or remove the empty entry.` };
    case "ambiguous-author":
      return { message: `Author ${note.position} looks like more than one name, or a name already inverted.`, explanation: "Each author needs a separate entry with the family name and given name in their own fields, so MLA's inversion and et al. rules work correctly.", action: "Give each author their own entry, with the family name in Family name and the given names in Given names." };
    case "no-date":
      return note.sourceType === "webpage"
        ? { message: "No publication date was entered, so it was left out.", explanation: "MLA omits a missing date rather than writing n.d. For a web page without a date, MLA suggests giving the date you accessed it.", action: "Check the page for a publication or update date. If there is none, add the date you accessed the page." }
        : { message: "No publication date was entered, so it was left out.", explanation: "MLA omits a missing date rather than writing n.d., but books and journal articles almost always have one.", action: "Check the source, such as the copyright page or the journal issue, for the year of publication." };
    case "invalid-date":
      return { message: `Part of the ${note.date === "access" ? "access" : "publication"} date isn't a real calendar date, so only the valid part was used.`, explanation: "A date that cannot exist would mislead readers looking for the source.", action: "Check the day, month and year against the source." };
    case "day-without-month":
      return { message: `A day was entered without a month in the ${note.date === "access" ? "access" : "publication"} date, so only the year was used.`, explanation: "MLA writes a date as day, month and year; a day means nothing without its month.", action: "Add the month, or remove the day." };
    case "no-journal-numbers":
      return { message: "The volume, issue and pages are all missing.", explanation: "MLA uses the volume, issue and page range to locate an article within its journal. Some online journals have none of these.", action: "Check the journal's record of the article and add whichever of them it gives." };
    case "invalid-doi":
      return { message: "The DOI is not in a valid form and was not used.", explanation: "MLA prefers a DOI to a URL because it keeps working when web addresses change, but only a valid DOI leads to the work.", action: "Check the DOI against the source. A DOI starts with 10., such as 10.1038/nature14539." };
    case "invalid-url":
      return { message: "The URL is not a valid web address and was not used.", explanation: "The location element must lead readers to the source.", action: "Copy the full address from your browser, beginning with http:// or https://." };
    case "check-title-case":
      return { message: "Check the title's capitalization.", explanation: "MLA writes titles in title case, but which small words stay lowercase, and how names and other languages are capitalized, needs judgment. The title is used exactly as you typed it.", action: "Capitalize the first and last words and all principal words; check names and terms against the source." };
    case "check-edition":
      return { message: "The edition is shown exactly as you typed it.", explanation: "MLA writes the edition as the source labels it, abbreviating edition to ed., as in 2nd ed. or Expanded ed.", action: "Check the wording against the source." };
    case "publisher-abbreviation":
      return note.suggestion
        ? { message: `MLA abbreviates University Press as UP: ${note.suggestion}.`, explanation: "The publisher is shown as you typed it, because publishers' names vary and only you can confirm the name.", action: `Consider entering the publisher as ${note.suggestion}.` }
        : { message: "MLA leaves business words such as Inc., Co. and Ltd. out of publishers' names.", explanation: "The publisher is shown as you typed it, because publishers' names vary and only you can confirm the name.", action: "Consider removing the business word from the publisher's name." };
    case "unsupported-locator":
      return { message: "Section locators are not formatted.", explanation: "ResearchKit could not confirm MLA's form for section numbers against the MLA's own guidance, so it does not guess.", action: "Use a page or paragraph number if the source has one, or consult the MLA Handbook." };
    case "unsupported-source-type":
      return { message: `“${note.value}” is not a supported source type.`, explanation: "Formatting one kind of source as another gives an entry with the wrong elements, so unsupported types are not approximated.", action: "Choose Book, Journal article or Web page if one of them describes the source; otherwise consult the MLA Handbook." };
  }
}

/** Each note as a validation issue. */
export function issuesFor(notes: readonly Note[]): ValidationIssue[] {
  return notes.map((note) => ({ code: note.code, severity: severityOf(note), ...textOf(note) }));
}

/** The provenance of the metadata, which every result states. */
export function provenanceIssue(record: SourceRecord): ValidationIssue {
  return record.provenance === "verified"
    ? { code: "verified", severity: "information", message: "The metadata is marked as externally verified." }
    : {
        code: "user-entered",
        severity: "information",
        message: "The metadata was entered by you and has not been externally verified.",
        explanation: "A correctly formatted entry can still contain wrong details.",
        action: "Compare every detail with the source before you submit your work.",
      };
}

/** A source type from untrusted input that MLA formatting cannot handle, as an issue; null if it is supported. */
export function unsupportedSourceType(value: string, supported: readonly string[]): ValidationIssue | null {
  return supported.includes(value) ? null : issuesFor([{ code: "unsupported-source-type", value }])[0];
}
