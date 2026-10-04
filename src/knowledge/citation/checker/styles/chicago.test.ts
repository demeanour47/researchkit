import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { check, citationIssues, entryIssues, hasIssue, problems } from "../test-helpers";

// Valid entries reproduce the Chicago Manual of Style's sample citations, as the Chicago generators format them.
const referenceList = [
  "Binder, Amy J., and Jeffrey L. Kidder. 2022. The Channels of Student Activism: How the Left and Right Are Winning (and Losing) in Campus Politics Today. University of Chicago Press.",
  "Dittmar, Emily L., and Douglas W. Schemske. 2023. “Temporal Variation in Selection Influences Microgeographic Local Adaptation.” American Naturalist 202 (4): 471–85. https://doi.org/10.1086/725865.",
  "Yale University. n.d. “About Yale: Yale Facts.” Accessed March 8, 2022. https://www.yale.edu/about-yale/yale-facts.",
  "Yu, Charles. 2020. Interior Chinatown. Pantheon Books.",
].join("\n\n");

const bibliography = [
  "Binder, Amy J., and Jeffrey L. Kidder. The Channels of Student Activism: How the Left and Right Are Winning (and Losing) in Campus Politics Today. University of Chicago Press, 2022.",
  "Borel, Brooke. The Chicago Guide to Fact-Checking. 2nd ed. University of Chicago Press, 2023.",
  "Yu, Charles. Interior Chinatown. Pantheon Books, 2020.",
].join("\n\n");

describe("Chicago author-date checks", () => {
  it("accepts the CMOS sample reference list", () => {
    const report = check("chicago-author-date", referenceList);
    assert.deepEqual(report.references.map((reference) => problems(reference.issues).length), [0, 0, 0, 0]);
    assert.deepEqual(report.references.map((reference) => reference.key?.year), ["2022", "2023", null, "2020"]);
  });

  it("matches author–date citations with page locators", () => {
    const report = check("chicago-author-date", referenceList, "Students organize (Binder and Kidder 2022, 117–18). Selection varies (Dittmar and Schemske 2023, 480). Yu (2020, 45) satirizes it, and Yale (Yale University, n.d.) lists facts.");
    assert.equal(report.citations.unmatched, 0);
    assert.equal(report.citations.uncited, 0);
    assert.equal(problems(citationIssues(report)).length, 0);
  });

  it("explains Chicago's citation punctuation and locators", () => {
    const issues = citationIssues(check("chicago-author-date", referenceList, "(Yu, 2020) (Yu 2020, p. 45) (Yale University n.d.) (Binder & Kidder 2022)"));
    hasIssue(issues, "citation-format", "warning", "There is a comma between the author and the year.");
    hasIssue(issues, "locator", "warning", "The page number has “p.” or “pp.”.");
    hasIssue(issues, "citation-format", "warning", "n.d. needs a comma before it.");
    hasIssue(issues, "citation-format", "warning", "Authors are joined with “&”.");
  });

  it("checks order and journal structure", () => {
    const report = check("chicago-author-date", "Yu, Charles. 2020. Interior Chinatown. Pantheon Books.\n\nDittmar, Emily L. 2023. “Temporal Variation.” American Naturalist 202(4), 471–485.");
    hasIssue(entryIssues(report, 2), "ordering", "warning", "Entry appears out of alphabetical order.");
    hasIssue(entryIssues(report, 2), "journal-structure", "warning", "Journal numbers appear in APA's arrangement.");
  });

  it("recognises an APA entry as a possible mismatch", () => {
    hasIssue(entryIssues(check("chicago-author-date", "Yu, C. (2020). Interior Chinatown. Pantheon Books."), 1), "style-mismatch", "warning", "Reference may be formatted using a different citation style.");
  });
});

describe("Chicago notes and bibliography checks", () => {
  it("accepts a bibliography", () => {
    const report = check("chicago-notes-bibliography", bibliography);
    assert.deepEqual(report.references.map((reference) => problems(reference.issues).length), [0, 0, 0]);
    hasIssue(report.notices, "manual-review", "information", "Notes are checked as pasted text.");
  });

  it("matches full and shortened notes without treating a shortened note as a second entry", () => {
    const notes = [
      "1. Charles Yu, Interior Chinatown (Pantheon Books, 2020), 45.",
      "2. Amy J. Binder and Jeffrey L. Kidder, The Channels of Student Activism: How the Left and Right Are Winning (and Losing) in Campus Politics Today (University of Chicago Press, 2022), 117–18.",
      "3. Yu, Interior Chinatown, 48.",
      "4. Binder and Kidder, Channels of Student Activism, 125.",
    ].join("\n");
    const report = check("chicago-notes-bibliography", bibliography, notes);
    assert.deepEqual(report.citations.findings.map((finding) => [finding.citation.kind, finding.matches]), [["full-note", [3]], ["full-note", [1]], ["short-note", [3]], ["short-note", [1]]]);
    assert.equal(report.potentialDuplicates, 0);
    hasIssue(entryIssues(report, 2), "citation-consistency", "information", "Reference may be uncited.");
    assert.equal(problems(report.notices).length, 0);
  });

  it("reports ibid. as unmatchable and an unknown note as unmatched", () => {
    const report = check("chicago-notes-bibliography", bibliography, "Ibid., 46.\nMorrison, Beloved, 12.");
    hasIssue(report.notices, "citation-format", "information", "Ibid. can't be matched to an entry.");
    hasIssue(citationIssues(report), "citation-consistency", "warning", "Citation appears without a matching bibliography entry.");
  });

  it("recognises a note pasted into the bibliography and leaves it out of list checks", () => {
    const report = check("chicago-notes-bibliography", `${bibliography}\n\nCharles Yu, Interior Chinatown (Pantheon Books, 2020), 45.`);
    hasIssue(entryIssues(report, 4), "unsupported-structure", "warning", "This looks like a note, not a bibliography entry.");
    assert.equal(report.references[3].excluded, true);
    assert.equal(report.potentialDuplicates, 0);
  });

  it("recognises an author–date entry and author–date citations as mismatches", () => {
    hasIssue(entryIssues(check("chicago-notes-bibliography", "Yu, Charles. 2020. Interior Chinatown. Pantheon Books."), 1), "style-mismatch", "warning", "Reference may be formatted using a different citation style.");
    hasIssue(check("chicago-notes-bibliography", bibliography, "As shown (Yu 2020, 45).").notices, "style-mismatch", "warning", "This citation pattern appears author–date rather than notes.");
  });
});
