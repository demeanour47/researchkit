import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { check, citationIssues, entryIssues, hasIssue, problems } from "../test-helpers";

const valid = [
  "Binder, A. J., & Kidder, J. L. (2022). The channels of student activism. University of Chicago Press.",
  "Thaker, J., Smith, N., & Leiserowitz, A. (2020). Global warming risk perceptions in India. Risk Analysis, 40(12), 2481–2497. https://doi.org/10.1111/risa.13574",
  "World Health Organization. (2023, May 4). Climate change and health. WHO. https://www.who.int/news-room/fact-sheets/detail/climate-change-and-health",
].join("\n\n");

describe("APA 7 checks", () => {
  it("accepts a valid reference list, including full dates and organization authors", () => {
    const report = check("apa", valid);
    assert.equal(report.total, 3);
    assert.deepEqual(report.references.map((reference) => problems(reference.issues).length), [0, 0, 0]);
    assert.deepEqual(report.references.map((reference) => reference.sourceType), ["book", "journal-article", "webpage"]);
  });

  it("reports a malformed DOI as an error", () => {
    hasIssue(entryIssues(check("apa", "Kahneman, D. (2011). Thinking, fast and slow. doi:not-a-doi"), 1), "doi", "error", "DOI syntax appears invalid.");
  });

  it("warns when no author can be identified", () => {
    hasIssue(entryIssues(check("apa", "(2020). Title. Publisher."), 1), "author-format", "warning", "No author could be identified confidently.");
  });

  it("reports duplicates and ordering", () => {
    const report = check("apa", ["Smith, J. (2024). Zeta. Journal, 10, 1–2. https://doi.org/10.1234/zeta", "Adams, K. (2023). Alpha. Publisher.", "Smith, J. (2020). Zeta again. Journal, 10, 1–2. https://doi.org/10.1234/zeta"].join("\n\n"));
    hasIssue(entryIssues(report, 3), "duplicate", "warning", "Possible duplicate reference.");
    hasIssue(entryIssues(report, 2), "ordering", "warning", "Reference appears out of alphabetical order.");
  });

  it("warns about a year in brackets without APA's full stop", () => {
    hasIssue(entryIssues(check("apa", "Cottrell, S. (2019) The study skills handbook. Red Globe Press."), 1), "date-format", "warning", "The date isn't followed by a full stop.");
  });

  it("flags a numbered entry and an entry in another style as possible mismatches", () => {
    hasIssue(entryIssues(check("apa", "[1] Smith, J. (2020). Title. Publisher."), 1), "style-mismatch", "warning", "This appears to use numeric citation formatting rather than APA author–date formatting.");
    hasIssue(entryIssues(check("apa", "Yu, Charles. 2020. Interior Chinatown. Pantheon Books."), 1), "style-mismatch", "warning", "Reference may be formatted using a different citation style.");
  });

  it("matches parenthetical and narrative citations and reports unmatched and uncited ones", () => {
    const report = check("apa", valid, "Activism shifted (Binder & Kidder, 2022, p. 5). Thaker et al. (2020) found risk. Later work (Jones, 2021) disagreed.");
    hasIssue(citationIssues(report), "citation-consistency", "warning", "Citation appears without a matching reference list entry.");
    hasIssue(entryIssues(report, 3), "citation-consistency", "warning", "Reference may be uncited.");
    assert.equal(report.citations.unmatched, 1);
    assert.equal(report.citations.uncited, 1);
  });

  it("explains APA's citation punctuation", () => {
    const issues = citationIssues(check("apa", valid, "(Binder and Kidder, 2022) (Thaker 2020) (Binder & Kidder, 2022, 45) (Thaker, Smith, & Leiserowitz, 2020)"));
    hasIssue(issues, "citation-format", "warning", "APA joins two authors with “&” in a parenthetical citation.");
    hasIssue(issues, "citation-format", "warning", "APA puts a comma between the author and the year.");
    hasIssue(issues, "locator", "warning", "The page number needs “p.” or “pp.”.");
    hasIssue(issues, "citation-format", "warning", "APA cites three or more authors as the first author and et al.");
  });

  it("notices a year that differs between citation and entry", () => {
    hasIssue(citationIssues(check("apa", valid, "(Binder & Kidder, 2021)")), "citation-consistency", "warning", "No entry by Binder and Kidder from 2021 was found.");
  });

  it("warns about numeric citations in an APA document", () => {
    hasIssue(check("apa", valid, "As shown in [1] and [2]").notices, "style-mismatch", "warning", "This appears to use numeric citation formatting rather than APA author–date formatting.");
  });
});
