/**
 * Chicago notes-and-bibliography problems as the shared ValidationIssue shape: what
 * is wrong, why it matters in Chicago, and what to do. Errors leave the source
 * unidentifiable or drop an identifier; warnings need a check against the source or
 * the writer's document; information explains an omission, a limitation, or a point
 * where Chicago allows a variant.
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
    case "missing-year":
      return note.sourceType === "webpage" ? "information" : "warning";
    case "access-date-not-needed":
    case "publisher-not-shown":
    case "article-number-not-shown":
    case "organization-also-publisher":
    case "web-date-label":
    case "article-note-without-page":
    case "shorten-title":
    case "check-headline-style":
    case "check-edition":
    case "ibid-not-used":
      return "information";
    default:
      return "warning";
  }
}

type Text = Pick<ValidationIssue, "message" | "explanation" | "action">;

const journalGaps = {
  numbers: "The volume, issue and pages are all missing.",
  volume: "The volume is missing.",
  pages: "The page range or article ID is missing from the bibliography entry.",
} as const;

function textOf(note: Note): Text {
  switch (note.code) {
    case "missing-title":
      return { message: "The title is missing.", explanation: "Notes and bibliography entries identify a work by its title, and shortened notes are built from it.", action: "Enter the title exactly as it appears on the source, including any subtitle after a colon." };
    case "missing-journal":
      return { message: "The journal title is missing.", explanation: "An article is found through its journal, volume and issue; without the journal, readers can't locate it.", action: "Enter the journal's title." };
    case "unsupported-source-type":
      return { message: `“${note.value}” is not a supported source type.`, explanation: "Chicago cites each kind of source with its own elements, so unsupported types are not approximated.", action: "Choose Book, Journal article or Web page if one describes the source; otherwise consult the Chicago Manual of Style, chapter 14." };
    case "invalid-doi":
      return { message: "The DOI is not in a valid form and was not used.", explanation: "Chicago prefers a URL based on the DOI, but only a valid DOI leads to the work.", action: "Check the DOI against the source. A DOI starts with 10., such as 10.1086/720277." };
    case "invalid-url":
      return { message: "The URL is not a valid web address and was not used.", explanation: "A URL in a note or bibliography entry must lead readers to the source.", action: "Copy the full address from your browser, beginning with http:// or https://." };
    case "no-author":
      return { message: "No author was entered.", explanation: "Without an author, the note and the bibliography entry begin with the title. When an organization is responsible for the work, Chicago lets it serve as the author.", action: "Check the source for an author or a responsible organization, and enter it if there is one. Don't write Anonymous unless the source does." };
    case "author-incomplete":
      return { message: `Author ${note.position} has no family name or organization name, so it was left out.`, explanation: "Shortened notes and the bibliography's alphabetical order depend on family names.", action: `Add author ${note.position}'s family name, or remove the empty entry.` };
    case "ambiguous-author":
      return { message: `Author ${note.position} looks like more than one name, or a name already inverted.`, explanation: "Notes give names in normal order and the bibliography inverts only the first, so each author needs their own entry.", action: "Give each author their own entry, with the family name and given names in their own fields." };
    case "unsupported-contributor-role":
      return { message: `Author ${note.position} looks like an editor, translator or compiler.`, explanation: "Chicago credits these roles with “ed.” or “trans.” in notes and “edited by” or “translated by” in the bibliography, which this generator can't represent yet. The name has been treated as an author.", action: "If the person is not an author, remove them here, and check the Chicago Manual of Style, 14.5–14, for how to credit them." };
    case "missing-year":
      return note.sourceType === "webpage"
        ? { message: "The page has no publication date.", explanation: "For web content without a date of publication or revision, Chicago gives the date you accessed it instead.", action: "Check the page for a publication or last-modified date. If there is none, add the date you accessed it." }
        : { message: "No year was entered, so n.d. was used.", explanation: "When a work's date can't be found, n.d. (“no date”) takes the place of the year, but books and articles almost always have one.", action: "Check the source, such as the copyright page or the journal issue, for the year." };
    case "missing-publisher":
      return { message: "The publisher is missing.", explanation: "A book's note and bibliography entry name its publisher. A place of publication is no longer required, but the publisher is.", action: "Enter the publisher's name from the title page or copyright page." };
    case "incomplete-journal":
      return { message: journalGaps[note.missing], explanation: "Chicago locates an article by the journal's volume and issue, and the bibliography gives the article's full page range or article ID.", action: "Check the journal's record of the article and add whichever of these it gives." };
    case "missing-site-name":
      return { message: "There is no website name or site owner.", explanation: "A web page's note names the site that holds it, or the organization that owns it, so readers know where it was published.", action: "Enter the website's name, or the organization that runs the site." };
    case "missing-url":
      return { message: "The URL is missing.", explanation: "A note or bibliography entry for web content ends with its URL, which is how readers find it.", action: "Copy the page's address from your browser." };
    case "missing-access-date":
      return { message: "There is no date and no access date.", explanation: "If web content lists no date of publication or revision, Chicago includes the date you accessed it.", action: "Add the date you accessed the page." };
    case "invalid-date":
      return { message: `Part of the ${note.date === "access" ? "access" : "publication"} date isn't a real calendar date, so only the valid part was used.`, explanation: "A date that cannot exist would mislead readers.", action: "Check the day, month and year against the source." };
    case "day-without-month":
      return { message: `A day was entered without a month in the ${note.date === "access" ? "access" : "publication"} date, so it was left out.`, explanation: "Chicago writes the month before the day; a day means nothing without its month.", action: "Add the month, or remove the day." };
    case "unsupported-locator":
      return { message: `${note.kind === "paragraph" ? "Paragraph" : "Section"} locators are not formatted.`, explanation: "Chicago notes use abbreviations for other kinds of locator that depend on the source. ResearchKit formats pages and chapters only, rather than guess.", action: "Use a page, page range or chapter if the source has one." };
    case "incomplete-locator":
      return { message: "A page range was chosen, but only one page was entered.", explanation: "A range needs a first and last page, such as 117–18. The single page was cited.", action: "Enter the last page of the range, or choose Page." };
    case "missing-locator-value":
      return { message: "A locator type was chosen, but no number was entered.", explanation: "The notes have been given without a locator.", action: "Enter the page, range or chapter you are citing, or choose No locator." };
    case "short-note-unidentifiable":
      return { message: "The shortened note has nothing to identify the source.", explanation: "A shortened note leads readers back to the full note or bibliography by author and title; with neither, it can't.", action: "Enter the title, and the author if there is one." };
    case "access-date-not-needed":
      return { message: "The access date was left out because the page has a date.", explanation: "Chicago adds an access date when web content lists no date of publication or revision.", action: "Nothing, unless your instructor or publisher asks for access dates." };
    case "publisher-not-shown":
      return { message: "The site owner was left out.", explanation: "When a person or a named organization is the author, Chicago's web citations name the site, not a separate owner.", action: "Nothing, unless the owner's name adds information readers need." };
    case "article-number-not-shown":
      return { message: "The article ID was left out of the bibliography because a page range was given.", explanation: "Chicago uses an article ID in place of a page range in the bibliography.", action: "Nothing. If the journal numbers articles instead of paginating them, clear the pages and keep the article ID." };
    case "organization-also-publisher":
      return { message: "The organization is both the author and the publisher, and is named in both places.", explanation: "Chicago lets an organization serve as author when no person is named. ResearchKit found no Chicago rule for leaving the publisher out in this case, so it keeps both.", action: "Check your publisher's or instructor's guidance if they prefer another form." };
    case "web-date-label":
      return { message: "Check how the page labels its date.", explanation: "Chicago gives a web page's date as the page labels it, such as “effective November 15” or “last modified December 19, 2023”. ResearchKit gives the date without a label.", action: "Add the page's own label, such as last modified, before the date if it has one." };
    case "article-note-without-page":
      return { message: "The full note cites no page.", explanation: "A note to a journal article usually cites the specific page or pages, while the bibliography gives the whole range.", action: "Add the page you are citing, if you are citing a particular passage." };
    case "shorten-title":
      return { message: "Shorten the title for the shortened note.", explanation: "Chicago's shortened notes use the main title, shortened to four words or fewer if it is longer. Choosing the key words needs judgment, so the full main title is shown.", action: "Enter your own short title, keeping the title's key words in their original order, such as Temporal Variation." };
    case "check-headline-style":
      return { message: "Check the title's capitalization.", explanation: "Chicago capitalizes titles in headline style, but small words, proper nouns and other languages need judgment. The title is used exactly as you typed it.", action: "Capitalize the first and last words and all major words; lowercase articles, prepositions and coordinating conjunctions in between." };
    case "check-edition":
      return { message: "The edition is shown exactly as you typed it.", explanation: "Chicago abbreviates edition as ed., as in 2nd ed.", action: "Check the wording against the source." };
    case "ibid-not-used":
      return { message: "Shortened notes are used instead of ibid.", explanation: "The 18th edition of the Chicago Manual of Style discourages ibid., which saves little space and can obscure which source is meant (13.37).", action: "Use the shortened note for every later citation, even of the source cited just before." };
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
        explanation: "A correctly formatted note can still contain wrong details.",
        action: "Compare every detail with the source before you submit your work.",
      };
}

/** A source type from untrusted input that Chicago formatting can't handle, as an issue; null if it is supported. */
export function unsupportedSourceType(value: string, supported: readonly string[]): ValidationIssue | null {
  return supported.includes(value) ? null : issuesFor([{ code: "unsupported-source-type", value }])[0];
}
