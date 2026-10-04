/**
 * Chicago author-date problems as the shared ValidationIssue shape: what is wrong,
 * why it matters in Chicago, and what to do. Errors leave the source unidentifiable
 * or drop an identifier; warnings need a check against the source; information
 * explains an omission, a limitation, or a point where Chicago allows a variant.
 */

import type { SourceRecord, ValidationIssue, ValidationSeverity } from "../../source";
import type { Note } from "./notes";

function severityOf(note: Note): ValidationSeverity {
  switch (note.code) {
    case "missing-title":
    case "missing-journal":
    case "unsupported-source-type":
    case "invalid-doi":
    case "invalid-url":
      return "error";
    case "no-author":
    case "author-incomplete":
    case "ambiguous-author":
    case "unsupported-contributor-role":
    case "missing-access-date":
    case "invalid-date":
    case "day-without-month":
    case "missing-publisher":
    case "missing-url":
    case "incomplete-journal":
    case "unsupported-locator":
    case "incomplete-locator":
      return "warning";
    case "missing-year":
      return note.sourceType === "webpage" ? "information" : "warning";
    default:
      return "information";
  }
}

type Text = Pick<ValidationIssue, "message" | "explanation" | "action">;

const journalGaps = {
  numbers: "The volume, issue and pages are all missing.",
  volume: "The volume is missing.",
  pages: "The page range or article ID is missing.",
} as const;

function textOf(note: Note): Text {
  switch (note.code) {
    case "missing-title":
      return { message: "The title is missing.", explanation: "Every Chicago reference identifies the work by its title, and a work with no author is cited in the text by its title.", action: "Enter the title exactly as it appears on the source, including any subtitle after a colon." };
    case "missing-journal":
      return { message: "The journal title is missing.", explanation: "A journal article is found through its journal, volume and issue; without the journal, readers cannot locate it.", action: "Enter the journal's title." };
    case "unsupported-source-type":
      return { message: `“${note.value}” is not a supported source type.`, explanation: "Chicago cites each kind of source with its own elements. Formatting one kind as another gives an entry with the wrong elements, so unsupported types are not approximated.", action: "Choose Book, Journal article or Web page if one describes the source; otherwise consult the Chicago Manual of Style, chapter 14." };
    case "invalid-doi":
      return { message: "The DOI is not in a valid form and was not used.", explanation: "Chicago prefers a URL based on the DOI because it keeps working when publishers' web addresses change, but only a valid DOI leads to the work.", action: "Check the DOI against the source. A DOI starts with 10., such as 10.1086/725865." };
    case "invalid-url":
      return { message: "The URL is not a valid web address and was not used.", explanation: "A URL in a reference must lead readers to the source.", action: "Copy the full address from your browser, beginning with http:// or https://." };
    case "no-author":
      return { message: "No author was entered, so the entry begins with the title.", explanation: "Chicago begins an entry with the title only when no author can be named. When an organization is responsible for the work, Chicago lets it serve as the author (CMOS 13.86).", action: "Check the source for an author, or an organization responsible for it, and enter it if there is one. Don't write Anonymous unless the source does." };
    case "author-incomplete":
      return { message: `Author ${note.position} has no family name or organization name, so it was left out.`, explanation: "Chicago lists and cites authors by family name, so a name without one can't be placed.", action: `Add author ${note.position}'s family name, or remove the empty entry.` };
    case "ambiguous-author":
      return { message: `Author ${note.position} looks like more than one name, or a name already inverted.`, explanation: "Each author needs a separate entry so Chicago's inversion and et al. rules work correctly.", action: "Give each author their own entry, with the family name and given names in their own fields." };
    case "unsupported-contributor-role":
      return { message: `Author ${note.position} looks like an editor, translator or compiler.`, explanation: "Chicago credits these roles with phrases such as “edited by” or “translated by”, which this generator can't represent yet. The name has been treated as an author.", action: "If the person is not an author, remove them here, and check the Chicago Manual of Style, 14.5–14, for how to credit them." };
    case "missing-year":
      return note.sourceType === "webpage"
        ? { message: "No publication date was entered, so n.d. was used.", explanation: "When a web page lists no date of publication or revision, Chicago uses n.d. (“no date”) in place of the year and adds an access date.", action: "Check the page for a publication or last-modified date. If there is none, keep n.d. and add the date you accessed the page." }
        : { message: "No year was entered, so n.d. was used.", explanation: "The year is central to an author-date citation, and books and journal articles almost always have one.", action: "Check the source, such as the copyright page or the journal issue, for the year of publication." };
    case "missing-access-date":
      return { message: "There is no date and no access date.", explanation: "For web content without a date of publication or revision, Chicago includes the date you accessed it, so readers know which version you saw.", action: "Add the date you accessed the page." };
    case "invalid-date":
      return { message: `Part of the ${note.date === "access" ? "access" : "publication"} date isn't a real calendar date, so only the valid part was used.`, explanation: "A date that cannot exist would mislead readers looking for the source.", action: "Check the day, month and year against the source." };
    case "day-without-month":
      return { message: `A day was entered without a month in the ${note.date === "access" ? "access" : "publication"} date, so it was left out.`, explanation: "Chicago writes the month before the day; a day means nothing without its month.", action: "Add the month, or remove the day." };
    case "missing-publisher":
      return { message: "The publisher is missing.", explanation: "Chicago book references name the publisher. A place of publication is no longer required, but the publisher is.", action: "Enter the publisher's name from the title page or copyright page." };
    case "missing-url":
      return { message: "The URL is missing.", explanation: "A reference to web content ends with its URL, which is how readers find it.", action: "Copy the page's address from your browser." };
    case "incomplete-journal":
      return { message: journalGaps[note.missing], explanation: "Chicago locates an article by the journal's volume and issue and the article's page range or article ID.", action: "Check the journal's record of the article and add whichever of these it gives." };
    case "unsupported-locator":
      return { message: `${note.kind === "paragraph" ? "Paragraph" : "Section"} locators are not formatted.`, explanation: "Chicago cites other locators with abbreviations and conventions that depend on the source. ResearchKit formats page numbers only, rather than guess.", action: "Use a page or page range if the source has one, or add the locator yourself following the Chicago Manual of Style." };
    case "incomplete-locator":
      return { message: "A page range was chosen, but only one page was entered.", explanation: "A range needs a first and last page, such as 117–18. The single page was cited.", action: "Enter the last page of the range, or choose Page." };
    case "access-date-not-needed":
      return { message: "The access date was left out because the page has a date.", explanation: "Chicago adds an access date when web content lists no date of publication or revision.", action: "Nothing, unless your instructor or publisher asks for access dates." };
    case "publisher-not-shown":
      return { message: "The publisher was left out because the website is named.", explanation: "Chicago's web references name the site; its owner is given in place of a site name when there isn't one.", action: "Nothing, unless the owner's name adds information readers need." };
    case "article-number-not-shown":
      return { message: "The article number was left out because a page range was given.", explanation: "Chicago uses an article ID in place of a page range, not alongside it.", action: "Nothing. If the journal numbers articles instead of paginating them, clear the pages and keep the article number." };
    case "organization-also-publisher":
      return { message: "The organization is both the author and the publisher, and is named in both places.", explanation: "Chicago lets an organization serve as author when no person is named (CMOS 13.86). ResearchKit found no Chicago rule for leaving the publisher out in this case, so it keeps both.", action: "Check your publisher's or instructor's guidance if they prefer another form." };
    case "web-date-label":
      return { message: "Check how the page labels its date.", explanation: "Chicago repeats a web page's month and day after the site, labeled as the page labels it, such as “Effective November 15” or “Last modified December 19”. ResearchKit gives the date without a label.", action: "Add the page's own label, such as Last modified, before the date if it has one." };
    case "journal-issue-variant":
      return { message: "Chicago allows two forms of volume and issue.", explanation: "ResearchKit uses the form in the Chicago sample citations, 202 (4): 471–85. When the issue's month or season is also cited, Chicago writes 202, no. 4 (April): 471–85.", action: "Use one form consistently throughout your reference list." };
    case "check-headline-style":
      return { message: "Check the title's capitalization.", explanation: "Chicago capitalizes titles in headline style, but small words, proper nouns and other languages need judgment. The title is used exactly as you typed it.", action: "Capitalize the first and last words and all major words; lowercase articles, prepositions and coordinating conjunctions in between." };
    case "check-edition":
      return { message: "The edition is shown exactly as you typed it.", explanation: "Chicago abbreviates edition as ed., as in 2nd ed.", action: "Check the wording against the source." };
    case "shorten-title":
      return { message: "Shorten a long title in the text citation.", explanation: "Without an author, Chicago cites the work in the text by a shortened title. Where to shorten it needs judgment, so the full title is shown.", action: "Keep the first words of the title, enough for readers to find the entry, without changing their order." };
    case "same-year-suffix":
      return { message: "Several works by the same author in the same year need letters.", explanation: "Chicago tells such works apart with letters after the year, such as 2024a and 2024b, assigned by the order of titles in the reference list. ResearchKit formats one source at a time, so it can't assign them.", action: "If your list has more than one work by this author from this year, add a and b to the year in both the reference and the citations." };
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
        explanation: "A correctly formatted reference can still contain wrong details.",
        action: "Compare every detail with the source before you submit your work.",
      };
}

/** A source type from untrusted input that Chicago formatting can't handle, as an issue; null if it is supported. */
export function unsupportedSourceType(value: string, supported: readonly string[]): ValidationIssue | null {
  return supported.includes(value) ? null : issuesFor([{ code: "unsupported-source-type", value }])[0];
}
