import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CHECKER_STYLES, STYLE_CHECKERS, parseCheckerStyle } from ".";
import { check, entryIssues, hasIssue } from "./test-helpers";

describe("the checker contract", () => {
  it("has one checker per supported style, each declaring its capabilities", () => {
    assert.deepEqual(Object.keys(STYLE_CHECKERS).sort(), [...CHECKER_STYLES].sort());
    for (const style of CHECKER_STYLES) assert.equal(STYLE_CHECKERS[style].id, style);
    assert.equal(STYLE_CHECKERS.ieee.capabilities.citations, "numeric");
    assert.equal(STYLE_CHECKERS["chicago-notes-bibliography"].capabilities.citations, "notes");
    assert.equal(STYLE_CHECKERS.mla.capabilities.list, "Works Cited list");
    assert.equal(STYLE_CHECKERS.harvard.capabilities.yearLetters, true);
  });

  it("reads styles from untrusted input", () => {
    assert.equal(parseCheckerStyle("harvard"), "harvard");
    assert.equal(parseCheckerStyle("vancouver"), null);
  });

  it("reports an empty list as empty, with nothing invented", () => {
    const report = check("mla", "   ");
    assert.equal(report.empty, true);
    assert.deepEqual(report.counts, { error: 0, warning: 0, information: 0 });
  });

  it("never rewrites the pasted text", () => {
    const original = "smith j 2020 a title with no structure https://example.org";
    for (const style of CHECKER_STYLES) assert.equal(check(style, original).references[0].originalText, original, style);
  });
});

describe("duplicates", () => {
  it("finds the same DOI, title and year, or URL, in every style", () => {
    const sameDoi = check("harvard", "Chen, Y. (2023) ‘One’, J, 1(1), pp. 1–2. Available at: https://doi.org/10.1234/abc\n\nChen, Y. (2023) ‘Other’, J, 1(1), pp. 1–2. Available at: https://doi.org/10.1234/ABC");
    hasIssue(entryIssues(sameDoi, 2), "duplicate", "warning", "Possible duplicate reference.");
    const sameUrl = check("mla", "Burns, Shauntee. “One.” Library, 2016, www.nypl.org/a.\n\nBurns, Shauntee. “Two.” Library, 2017, https://www.nypl.org/a.");
    hasIssue(entryIssues(sameUrl, 2), "duplicate", "warning", "Possible duplicate reference.");
    const sameTitle = check("chicago-author-date", "Yu, Charles. 2020. Interior Chinatown. Pantheon Books.\n\nYu, Charles. 2020. Interior Chinatown. Vintage.");
    hasIssue(entryIssues(sameTitle, 2), "duplicate", "warning", "Possible duplicate reference.");
  });

  it("doesn't call different works duplicates", () => {
    assert.equal(check("chicago-author-date", "Yu, Charles. 2020. Interior Chinatown. Pantheon Books.\n\nYu, Charles. 2010. How to Live Safely. Pantheon Books.").potentialDuplicates, 0);
  });
});

describe("citation consistency", () => {
  const list = "Smith, J. (2024). A study. Publisher.\n\nJones, K. (2023). Another study. Publisher.";

  it("matches citations and reports unmatched and uncited ones, saying matching is heuristic", () => {
    const report = check("apa", list, "As shown (Smith, 2024), and later (Brown, 2022).");
    assert.equal(report.citations.findings[0].matches[0], 1);
    assert.equal(report.citations.unmatched, 1);
    assert.equal(report.citations.uncited, 1);
    hasIssue(report.notices, "citation-consistency", "information", "Citation matching is heuristic.");
  });

  it("reports text it can't confidently read as a citation as uncertain, not as an error", () => {
    const report = check("apa", list, "The policy changed (Government Policy Review Board Annual Statement, 2024 edition).");
    hasIssue(report.notices, "citation-consistency", "information", "Could not confidently identify citation.");
    assert.equal(report.counts.error, 0);
  });

  it("matches an organization named in full in a narrative citation", () => {
    const report = check("apa", "World Health Organization. (2023). Climate change and health. WHO. https://www.who.int/a", "The World Health Organization (2023) reports risk.");
    assert.equal(report.citations.unmatched, 0);
    assert.equal(report.citations.uncited, 0);
  });

  it("doesn't mark every entry uncited when no citations are recognised", () => {
    const report = check("apa", list, "There are no citations in this sentence.");
    assert.equal(report.citations.uncited, 0);
    hasIssue(report.notices, "citation-consistency", "information", "No citations were recognised.");
  });

  it("counts every issue by severity", () => {
    const report = check("ieee", "[1] A. Author, Book. P, 2020.\n\nB. Author, Book Two. P, 2021.", "See [1] and [5].");
    assert.equal(report.counts.error, 2);
    assert.ok(report.counts.information > 0);
  });
});
