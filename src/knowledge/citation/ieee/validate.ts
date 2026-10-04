/**
 * IEEE problems as the shared ValidationIssue shape: what is wrong, why it matters in
 * IEEE style, and what to do. Errors leave a reference unidentifiable, drop an
 * identifier or make a citation number invalid; warnings need a check against the
 * source or the writer's document; information explains an omission, a limitation
 * or a variant.
 */

import type { NumberProblem, ValidationIssue, ValidationSeverity } from "../source";
import type { Note } from "./notes";

function severityOf(note: Note): ValidationSeverity {
  switch (note.code) {
    case "missing-title":
    case "missing-journal":
    case "missing-proceedings":
    case "unsupported-source-type":
    case "invalid-doi":
    case "invalid-url":
    case "invalid-reference-number":
      return "error";
    case "abbreviation-not-applied":
    case "publication-date-not-shown":
    case "check-title-case":
    case "check-edition":
    case "en-dash-ranges-variant":
    case "citation-order":
      return "information";
    default:
      return "warning";
  }
}

type Text = Pick<ValidationIssue, "message" | "explanation" | "action">;

function numberMessage(problem: NumberProblem | { code: "more-than-one" }): string {
  switch (problem.code) {
    case "no-numbers":
      return "No reference number was entered.";
    case "not-a-number":
      return `“${problem.value}” is not a reference number.`;
    case "not-positive":
      return `“${problem.value}” is not a valid reference number: numbers start at 1.`;
    case "malformed-range":
      return `“${problem.value}” is not a valid range of reference numbers.`;
    case "duplicate-number":
      return `Reference ${problem.value} appears more than once.`;
    case "not-ascending":
      return "The numbers are not in ascending order.";
    case "more-than-one":
      return "Enter one reference number here.";
  }
}

const journalGaps = { volume: "The volume is missing.", issue: "The issue number is missing.", pages: "The page range or article number is missing." } as const;
const conferenceGaps = { location: "The conference's location is missing.", pages: "The paper's page range is missing." } as const;

function textOf(note: Note): Text {
  switch (note.code) {
    case "missing-title":
      return { message: "The title is missing.", explanation: "Every IEEE reference identifies the work by its title.", action: "Enter the title exactly as it appears on the source." };
    case "missing-journal":
      return { message: "The journal title is missing.", explanation: "An IEEE journal reference is found through the journal, its volume and its issue.", action: "Enter the journal's title." };
    case "missing-proceedings":
      return { message: "The proceedings or conference name is missing.", explanation: "A conference paper is found through the proceedings it was published in, given after “in”.", action: "Enter the name of the proceedings or conference, as it appears on the paper." };
    case "unsupported-source-type":
      return { message: `“${note.value}” is not a supported source type.`, explanation: "IEEE gives each kind of source its own elements, so unsupported types are not approximated.", action: "Choose Book, Journal article, Conference paper or Web page if one describes the source; otherwise consult the IEEE Reference Guide." };
    case "invalid-doi":
      return { message: "The DOI is not in a valid form and was not used.", explanation: "IEEE gives a DOI as “doi:” followed by the DOI, but only a valid DOI leads to the work.", action: "Check the DOI against the source. A DOI starts with 10., such as 10.1109/TBME.2011.2158315." };
    case "invalid-url":
      return { message: "The URL is not a valid web address and was not used.", explanation: "A URL after “[Online]. Available:” must lead readers to the source.", action: "Copy the full address from your browser, beginning with http:// or https://." };
    case "invalid-reference-number":
      return { message: numberMessage(note.problem), explanation: "An IEEE citation is the number of an entry in the reference list. Numbers are positive whole numbers, each reference has one number, and each number appears once in a citation.", action: "Enter the number the source has in your reference list, such as 1, or a list such as 1, 3, 7." };
    case "no-author":
      return { message: "No author was entered, so the reference begins with the title.", explanation: "IEEE references begin with the authors when there are any, and an organization can be the author.", action: "Check the source for an author or a responsible organization, and enter it if there is one." };
    case "author-incomplete":
      return { message: `Author ${note.position} has no family name or organization name, so it was left out.`, explanation: "IEEE gives each author's initials and surname, so a name without a surname can't be written.", action: `Add author ${note.position}'s family name, or remove the empty entry.` };
    case "ambiguous-author":
      return { message: `Author ${note.position} looks like more than one name, or a name already inverted.`, explanation: "IEEE writes each author's initials before the surname, so each author needs their own entry.", action: "Give each author their own entry, with the family name and given names in their own fields." };
    case "unsupported-contributor-role":
      return { message: `Author ${note.position} looks like an editor or translator.`, explanation: "IEEE credits editors with “Ed.” or “Eds.” and translators with “trans.”, which this generator can't represent yet. The name has been treated as an author.", action: "If the person is not an author, remove them here, and check the IEEE Reference Guide for how to credit them." };
    case "missing-year":
      return note.sourceType === "webpage"
        ? { message: "The page has no publication date.", explanation: "IEEE's website references give the date you accessed the page; every reference needs at least a year.", action: "Add the date you accessed the page." }
        : { message: "No year was entered, so (n.d.) was used.", explanation: "Every IEEE reference includes at least the year of publication; (n.d.) marks a work whose date can't be found.", action: "Check the source for the year of publication." };
    case "missing-publisher":
      return { message: "The publisher is missing.", explanation: "An IEEE book reference gives the publisher after the place of publication.", action: "Enter the publisher's name from the title page or copyright page." };
    case "missing-place":
      return { message: "The place of publication is missing.", explanation: "IEEE book references give the city of publication, the state for U.S. cities, and the country, before the publisher: Cambridge, MA, USA: MIT Press.", action: "Enter the city, state if in the U.S., and country, from the title page or copyright page." };
    case "incomplete-journal":
      return { message: journalGaps[note.missing], explanation: "IEEE journal references give the volume, issue and pages, or an article number, so readers can find the article.", action: "Check the journal's record of the article and add it if it has one. Not every journal numbers its issues." };
    case "incomplete-conference":
      return { message: conferenceGaps[note.missing], explanation: "IEEE conference references give the conference's location, when known, and the paper's pages in the proceedings.", action: "Check the proceedings or the paper's record and add it if it is given." };
    case "missing-site-name":
      return { message: "The website's name is missing.", explanation: "An IEEE website reference names the website after the page title.", action: "Enter the website's name." };
    case "missing-url":
      return { message: "The URL is missing.", explanation: "An IEEE website reference ends with “[Online]. Available:” and the page's URL.", action: "Copy the page's address from your browser." };
    case "missing-access-date":
      return { message: "The access date is missing.", explanation: "IEEE's website references give the date you accessed the page, written “Accessed: Feb. 1, 2009.”", action: "Add the date you accessed the page." };
    case "invalid-date":
      return { message: `Part of the ${note.date === "access" ? "access" : "publication"} date isn't a real calendar date, so only the valid part was used.`, explanation: "A date that cannot exist would mislead readers.", action: "Check the day, month and year against the source." };
    case "day-without-month":
      return { message: `A day was entered without a month in the ${note.date === "access" ? "access" : "publication"} date, so it was left out.`, explanation: "IEEE writes the month before the day; a day means nothing without its month.", action: "Add the month, or remove the day." };
    case "unsupported-locator":
      return { message: "Paragraph locators are not formatted.", explanation: "The IEEE Reference Guide cites parts of a reference by page, chapter, section, figure, equation and the like, but gives no form for paragraphs.", action: "Use a page, chapter or section if the source has one." };
    case "incomplete-locator":
      return { message: "A page range was chosen, but only one page was entered.", explanation: "A range needs a first and last page, such as 5–10. The single page was cited.", action: "Enter the last page of the range, or choose Page." };
    case "missing-locator-value":
      return { message: "A locator type was chosen, but no number was entered.", explanation: "The citation has been given without a locator.", action: "Enter the page, range, chapter or section you are citing, or choose No locator." };
    case "numbers-not-ascending":
      return { message: "The numbers are not in ascending order. They are shown in the order you typed them.", explanation: "IEEE's examples list several references in ascending order, as in [2], [4], [5].", action: "Reorder the numbers if your citation should follow IEEE's examples." };
    case "locator-with-several-numbers":
      return { message: "A locator can't be given for several references at once, so it was left out.", explanation: "An IEEE locator belongs inside one reference's brackets, as in [3, pp. 5–10].", action: "Cite the reference with the locator on its own, such as [3, p. 5], [4]." };
    case "abbreviation-not-applied":
      return note.container === "journal"
        ? { message: "The journal title is used as you entered it.", explanation: "IEEE abbreviates journal titles from its own lists, as in IEEE Trans. Biomed. Eng.; one-word titles such as Science are never abbreviated. ResearchKit doesn't hold those lists, so it doesn't abbreviate.", action: "Enter the journal's IEEE abbreviation yourself if your publisher requires it, checking IEEE's journal title list." }
        : { message: "The conference name is used as you entered it.", explanation: "IEEE abbreviates conference names with standard abbreviations, such as Proc., Conf. and Symp. ResearchKit doesn't apply them.", action: "Enter the abbreviated name yourself if your publisher requires it, following the IEEE Reference Guide." };
    case "publication-date-not-shown":
      return { message: "The publication date was left out because an access date was given.", explanation: "IEEE's website format gives the date you accessed the page.", action: "Nothing, unless your publisher asks for the publication date as well." };
    case "check-title-case":
      return { message: "Check the title's capitalization.", explanation: "IEEE's examples capitalize article and paper titles in sentence style, and book and periodical titles in headline style. The title is used exactly as you typed it.", action: "Check the capitalization against the source and your publisher's instructions." };
    case "check-edition":
      return { message: "The edition is shown exactly as you typed it.", explanation: "IEEE writes the edition after the title, as in 2nd ed.", action: "Check the wording against the source." };
    case "en-dash-ranges-variant":
      return { message: "Consecutive numbers are joined with an en dash.", explanation: "This follows earlier IEEE guidance, still required by some publishers. The current IEEE Reference Guide writes every number out instead: [1], [2], [3], [4].", action: "Use this form only if your publisher or instructor asks for it." };
    case "citation-order":
      return { message: "Reference numbers follow the order of first citation in your document.", explanation: "In IEEE style, the first source you cite is [1], the next new source [2], and so on; a source keeps its number every time it is cited. ResearchKit can't see your document, so it uses the number you enter.", action: "Check that the number matches this source's place in your reference list." };
  }
}

/** Each note as a validation issue. */
export function issuesFor(notes: readonly Note[]): ValidationIssue[] {
  return notes.map((note) => ({ code: note.code, severity: severityOf(note), ...textOf(note) }));
}

/** The provenance of the metadata, which every result states. */
export function provenanceIssue(provenance: "user-entered" | "verified"): ValidationIssue {
  return provenance === "verified"
    ? { code: "verified", severity: "information", message: "The metadata is marked as externally verified." }
    : {
        code: "user-entered",
        severity: "information",
        message: "The metadata was entered by you and has not been externally verified.",
        explanation: "A correctly formatted reference can still contain wrong details.",
        action: "Compare every detail with the source before you submit your work.",
      };
}

/** A source type from untrusted input that IEEE formatting can't handle, as an issue; null if it is supported. */
export function unsupportedSourceType(value: string, supported: readonly string[]): ValidationIssue | null {
  return supported.includes(value) ? null : issuesFor([{ code: "unsupported-source-type", value }])[0];
}
