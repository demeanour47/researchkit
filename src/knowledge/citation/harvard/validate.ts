/**
 * Harvard problems as the shared ValidationIssue shape: what is wrong, why it
 * matters in Harvard, and what to do. Errors leave the source unidentifiable or drop
 * a link; warnings need a check against the source; information explains an
 * omission, a limit of the generator, or a point where institutions' Harvard guides
 * differ from ResearchKit's profile.
 */

import type { SourceRecord, ValidationIssue, ValidationSeverity } from "../source";
import type { Note } from "./notes";

function severityOf(note: Note): ValidationSeverity {
  switch (note.code) {
    case "missing-title":
    case "missing-journal":
    case "missing-url":
    case "unsupported-source-type":
    case "invalid-doi":
    case "invalid-url":
    case "invalid-year-letter":
      return "error";
    case "no-author":
    case "author-incomplete":
    case "ambiguous-author":
    case "unsupported-contributor-role":
    case "missing-access-date":
    case "incomplete-access-date":
    case "invalid-date":
    case "day-without-month":
    case "missing-publisher":
    case "incomplete-journal":
    case "unsupported-locator":
    case "incomplete-locator":
    case "year-letter-without-year":
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
  pages: "The page range or article number is missing.",
} as const;

function textOf(note: Note): Text {
  switch (note.code) {
    case "missing-title":
      return { message: "The title is missing.", explanation: "Every Harvard reference identifies the work by its title, and a work with no author is cited in the text by its title.", action: "Enter the title exactly as it appears on the source, including any subtitle after a colon." };
    case "missing-journal":
      return { message: "The journal title is missing.", explanation: "A journal article is found through its journal, volume and issue; without the journal, readers can't locate it.", action: "Enter the journal's title." };
    case "missing-url":
      return { message: "The URL is missing.", explanation: "A Harvard reference to a web page gives its address after “Available at:”. Without it, readers can't find the page.", action: "Copy the page's address from your browser's address bar." };
    case "unsupported-source-type":
      return { message: `“${note.value}” is not a supported source type.`, explanation: "Harvard cites each kind of source with its own elements. Formatting one kind as another gives a reference with the wrong elements, so unsupported types are not approximated.", action: "Choose Book, Journal article or Web page if one describes the source; otherwise check your institution's Harvard guide." };
    case "invalid-doi":
      return { message: "The DOI is not in a valid form and was not used.", explanation: "A DOI leads to the work even when a publisher's web address changes, but only a valid DOI does.", action: "Check the DOI against the source. A DOI starts with 10., such as 10.1111/risa.13574." };
    case "invalid-url":
      return { message: "The URL is not a valid web address and was not used.", explanation: "A URL in a reference must lead readers to the source.", action: "Copy the full address from your browser, beginning with http:// or https://." };
    case "invalid-year-letter":
      return { message: "The year letter must be a single lowercase letter, such as a or b, so it was not used.", explanation: "Harvard tells apart works by the same author in the same year with a letter straight after the year, such as 2024a.", action: "Enter one lowercase letter, or leave the field blank." };
    case "no-author":
      return { message: "No author was entered, so the reference begins with the title.", explanation: "Harvard begins a reference with the title only when no person or organization can be named. An organization responsible for the work, such as a government department or the body that runs a website, is cited as the author.", action: "Check the source for an author or a responsible organization, and enter it if there is one." };
    case "author-incomplete":
      return { message: `Author ${note.position} has no family name or organization name, so it was left out.`, explanation: "Harvard lists and cites authors by family name, so a name without one can't be placed.", action: `Add author ${note.position}'s family name, or remove the empty entry.` };
    case "ambiguous-author":
      return { message: `Author ${note.position} looks like more than one name, or a name already inverted.`, explanation: "Each author needs a separate entry so the family name and initials are placed correctly and et al. is used at the right point.", action: "Give each author their own entry, with the family name and given names in their own fields." };
    case "unsupported-contributor-role":
      return { message: `Author ${note.position} looks like an editor, translator or compiler.`, explanation: "Harvard credits editors with (ed.) or (eds.) and translators with a separate phrase, which this generator can't represent yet. The name has been treated as an author.", action: "If the person is not an author, remove them here, and check your institution's Harvard guide for how to credit them." };
    case "missing-year":
      return note.sourceType === "webpage"
        ? { message: "The page has no year entered, so “no date” was used.", explanation: "Many web pages show no date of publication or last update. Harvard then writes “no date” in place of the year, in the reference and the citations.", action: "Check the page, often at the foot, for a date of publication or last update. If there is none, keep “no date”." }
        : { message: "No year was entered, so “no date” was used.", explanation: "The year is central to an author–date citation, and books and journal articles almost always have one.", action: "Check the source, such as the copyright page or the journal issue, for the year of publication." };
    case "missing-access-date":
      return { message: "The access date is missing.", explanation: "Harvard follows a URL with the date you accessed it, “(Accessed: 23 July 2020)”, because web content can change.", action: "Add the date you accessed the source, under More details." };
    case "incomplete-access-date":
      return { message: "The access date is incomplete, so only the parts entered were used.", explanation: "Harvard gives the full date of access: day, month and year.", action: "Add the day and month you accessed the source." };
    case "invalid-date":
      return { message: `Part of the ${note.date === "access" ? "access" : "publication"} date isn't a real calendar date, so only the valid part was used.`, explanation: "A date that cannot exist would mislead readers looking for the source.", action: "Check the day, month and year against the source." };
    case "day-without-month":
      return { message: `A day was entered without a month in the ${note.date === "access" ? "access" : "publication"} date, so it was left out.`, explanation: "A day means nothing without its month.", action: "Add the month, or remove the day." };
    case "missing-publisher":
      return { message: "The publisher is missing.", explanation: "A Harvard book reference names the publisher. Cite Them Right's 13th edition no longer asks for the place of publication, but the publisher is still needed.", action: "Enter the publisher's name from the title page or copyright page." };
    case "incomplete-journal":
      return { message: journalGaps[note.missing], explanation: "Harvard locates an article by its journal's volume and issue and its page range, or an article number when the journal doesn't use pages.", action: "Check the journal's record of the article and add whichever of these it gives." };
    case "unsupported-locator":
      return { message: `${note.kind === "paragraph" ? "Paragraph" : "Section"} locators are not formatted.`, explanation: "ResearchKit's Harvard profile formats page numbers, which every Harvard guide agrees on. Other locators vary between guides, so they are not guessed.", action: "Use a page or page range if the source has one, or follow your institution's guidance for other locators." };
    case "incomplete-locator":
      return { message: "A page range was chosen, but only one page was entered.", explanation: "A range needs a first and last page, such as 45–47. The single page was cited with “p.”.", action: "Enter the last page of the range, or choose Page." };
    case "year-letter-without-year":
      return { message: "The year letter was not used because there is no year.", explanation: "A letter tells apart works by the same author in the same year; ResearchKit's profile has no rule for letters after “no date”.", action: "Add the year if the source has one, or check your institution's guidance." };
    case "access-date-not-needed":
      return { message: "The access date was left out because a DOI is given.", explanation: "A DOI is a permanent identifier, so Harvard gives an access date only with a URL.", action: "Nothing, unless your institution's guide asks for access dates with DOIs." };
    case "article-number-not-shown":
      return { message: "The article number was left out because a page range was given.", explanation: "Harvard gives an article number in place of pages, for journals that number articles instead of paginating them, not alongside them.", action: "Nothing. If the journal numbers its articles, clear the pages and keep the article number." };
    case "site-not-shown":
      return { message: "The website's name and owner are not part of the reference.", explanation: "A Harvard web page reference gives the author, year, title and address. When no person is named, the organization responsible for the page is the author.", action: "If no author is entered, enter the organization responsible for the page as the author." };
    case "check-capitals":
      return { message: "Check the title's capital letters.", explanation: "Harvard writes book, article and web page titles in sentence case, with capitals only for the first word and proper nouns, and journal titles with major words capitalized. The title is used exactly as you typed it.", action: "Capitalize only the first word and proper nouns, including after a colon, as in Cite them right: the essential referencing guide. Write a journal's title as the journal does." };
    case "check-edition":
      return { message: "The edition is shown exactly as you typed it.", explanation: "Harvard abbreviates edition as “edn”, as in 2nd edn.", action: "Enter a number, such as 2, for a numbered edition, or check the wording against the source." };
    case "et-al-variant":
      return { message: "All authors are listed in the reference.", explanation: "Cite Them Right lists every author in the reference list and uses et al. in the text for four or more. Some institutions allow et al. in the reference list as well.", action: "Keep every author unless your institution's guide allows et al. in the reference list." };
    case "text-title-variant":
      return { message: "The title stands in for the author in the citations.", explanation: "Harvard guides agree that a work with no author is cited by its title, but differ on its styling. ResearchKit styles it as in the reference, so readers can match the two.", action: "Check your institution's guide, and shorten a long title only if it allows that." };
    case "same-year-letter":
      return { message: "Works by the same author in the same year need letters.", explanation: "Harvard tells such works apart with a letter after the year, such as 2024a and 2024b, in both the reference and the citations. ResearchKit formats one source at a time, so it can't see whether you need one.", action: "If your reference list has another work by the same author from the same year, enter a year letter. Many guides assign letters in alphabetical order of the titles, some in the order of first citation; check your institution's guide." };
    case "profile":
      return { message: "ResearchKit uses a defined Harvard author-date profile, based on Cite Them Right, 13th edition.", explanation: "Harvard is a family of styles with no single official version, and universities publish their own versions, which differ in punctuation and detail.", action: "Check your university's referencing requirements, and follow them where they differ." };
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

/** A source type from untrusted input that the Harvard profile can't handle, as an issue; null if it is supported. */
export function unsupportedSourceType(value: string, supported: readonly string[]): ValidationIssue | null {
  return supported.includes(value) ? null : issuesFor([{ code: "unsupported-source-type", value }])[0];
}
